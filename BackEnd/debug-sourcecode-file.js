require('dotenv').config();
const mongoose = require('mongoose');
const SourceCode = require('./src/models/sourceCode.model');
const { GridFSBucket, ObjectId } = require('mongodb');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugSourceCodeFile() {
  try {
    console.log('Connecting to MongoDB...');
    
    const productId = '68ad83447dd64f6f192eed46';
    console.log('Looking for SourceCode with productId:', productId);
    
    // Find source code by _id
    let sourceCode;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      sourceCode = await SourceCode.findById(productId);
      console.log('SourceCode found by _id:', sourceCode ? 'YES' : 'NO');
    } else {
      sourceCode = await SourceCode.findOne({ slug: productId });
      console.log('SourceCode found by slug:', sourceCode ? 'YES' : 'NO');
    }
    
    if (sourceCode) {
      console.log('SourceCode details:', {
        _id: sourceCode._id,
        name: sourceCode.name,
        slug: sourceCode.slug,
        sourceCodeFile: sourceCode.sourceCodeFile
      });
      
      if (sourceCode.sourceCodeFile) {
        const fileId = typeof sourceCode.sourceCodeFile === 'string'
          ? new ObjectId(sourceCode.sourceCodeFile)
          : sourceCode.sourceCodeFile;

        // Check both buckets: 'uploads' (new) then 'fs' (legacy)
        const checkBucket = async (bucketName) => {
          const bucket = new GridFSBucket(mongoose.connection.db, { bucketName });
          const files = await bucket.find({ _id: fileId }).toArray();
          return { bucketName, files };
        };

        console.log('\nChecking GridFS for file in both buckets:', fileId.toString());

        try {
          const [uploadsRes, fsRes] = await Promise.all([
            checkBucket('uploads'),
            checkBucket('fs'),
          ]);

          const summarize = (res) => {
            console.log(`\nBucket: ${res.bucketName}`);
            console.log('Files found:', res.files.length);
            if (res.files.length > 0) {
              const file = res.files[0];
              console.log('File details:', {
                _id: file._id,
                filename: file.filename,
                contentType: file.contentType,
                length: file.length,
                uploadDate: file.uploadDate,
                metadata: file.metadata,
              });
            }
          };

          summarize(uploadsRes);
          summarize(fsRes);

          if (uploadsRes.files.length === 0 && fsRes.files.length === 0) {
            console.log('\n❌ File not found in either bucket! Listing sample files for diagnostics...');
            const listSome = async (bucketName) => {
              const bucket = new GridFSBucket(mongoose.connection.db, { bucketName });
              const allFiles = await bucket.find({}).limit(10).toArray();
              console.log(`\nBucket "${bucketName}" total (first 10):`, allFiles.length);
              allFiles.forEach((file, idx) => {
                console.log(`${idx + 1}. ${file.filename} (${file._id}) - ${file.length} bytes`);
              });
            };
            await listSome('uploads');
            await listSome('fs');
          }
        } catch (gridfsError) {
          console.error('GridFS error:', gridfsError.message);
        }
      } else {
        console.log('❌ SourceCode has no sourceCodeFile!');
      }
    } else {
      console.log('❌ SourceCode not found!');
      
      // List all source codes
      console.log('\nListing all SourceCodes:');
      const allSourceCodes = await SourceCode.find({});
      console.log('Total SourceCodes:', allSourceCodes.length);
      allSourceCodes.forEach((sc, index) => {
        console.log(`${index + 1}. ${sc.name} (${sc._id}) - slug: ${sc.slug}`);
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugSourceCodeFile();