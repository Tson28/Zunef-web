require('dotenv').config();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
const SourceCode = require('./src/models/sourceCode.model');

async function createTestFile() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB and wait for connection
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully!');
    
    // Create a test zip file content
    const testContent = `
# Test Source Code Package

This is a test source code package for download functionality.

## Files included:
- index.html
- style.css
- script.js

## Installation:
1. Extract the zip file
2. Open index.html in browser
3. Enjoy!
    `;
    
    // Create GridFS bucket
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'fs'
    });
    
    console.log('Creating test file in GridFS...');
    
    // Create upload stream
    const uploadStream = bucket.openUploadStream('ung-dung-luu-tru-dam-may.zip', {
      contentType: 'application/zip',
      metadata: {
        description: 'Test source code file for cloud storage app',
        originalName: 'ung-dung-luu-tru-dam-may.zip'
      }
    });
    
    // Write test content (simulating a zip file)
    uploadStream.write(Buffer.from(testContent, 'utf8'));
    uploadStream.end();
    
    uploadStream.on('finish', async () => {
      console.log('✅ Test file created successfully!');
      console.log('File ID:', uploadStream.id);
      
      // Update the SourceCode to reference this file
      const sourceCodeId = '68ad83447dd64f6f192eed46';
      const sourceCode = await SourceCode.findById(sourceCodeId);
      
      if (sourceCode) {
        sourceCode.sourceCodeFile = uploadStream.id;
        await sourceCode.save();
        console.log('✅ SourceCode updated with new file ID');
        
        console.log('Updated SourceCode:', {
          _id: sourceCode._id,
          name: sourceCode.name,
          sourceCodeFile: sourceCode.sourceCodeFile
        });
      } else {
        console.log('❌ SourceCode not found for update');
      }
      
      mongoose.connection.close();
    });
    
    uploadStream.on('error', (error) => {
      console.error('Upload error:', error);
      mongoose.connection.close();
    });
    
  } catch (error) {
    console.error('Create test file error:', error);
    mongoose.connection.close();
  }
}

createTestFile();