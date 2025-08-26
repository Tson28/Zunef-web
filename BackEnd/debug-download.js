const mongoose = require('mongoose');
const Order = require('./src/models/order.model');
const SourceCode = require('./src/models/sourceCode.model');

async function debugDownload() {
    try {
        await mongoose.connect('mongodb://localhost:27017/zunef');
        console.log('✅ Connected to MongoDB');
        
        // Tìm tất cả các đơn hàng
        const allOrders = await Order.find({}).limit(10);
        console.log(`\n📦 Total orders found: ${allOrders.length}`);
        
        for (const order of allOrders) {
            console.log(`- Order ID: ${order.orderId}`);
            console.log(`  Product Type: ${order.product.productType}`);
            console.log(`  Product ID: ${order.product.productId}`);
            console.log(`  Title: ${order.product.title}`);
            console.log('---');
        }
        
        // Tìm các đơn hàng source code
        const sourceCodeOrders = await Order.find({ 
            'product.productType': 'source-code' 
        }).limit(5);
        
        console.log(`\n🎯 Source-code orders found: ${sourceCodeOrders.length}`);
        for (const order of sourceCodeOrders) {
            console.log(`- Order ID: ${order.orderId}`);
            console.log(`  Product ID: ${order.product.productId}`);
            console.log(`  Title: ${order.product.title}`);
            
            // Kiểm tra xem có tìm thấy SourceCode không
            let sourceCode;
            if (mongoose.Types.ObjectId.isValid(order.product.productId)) {
                sourceCode = await SourceCode.findById(order.product.productId);
                console.log(`  ✅ Found by ObjectId: ${sourceCode ? 'Yes' : 'No'}`);
            } else {
                sourceCode = await SourceCode.findOne({ slug: order.product.productId });
                console.log(`  ✅ Found by slug: ${sourceCode ? 'Yes' : 'No'}`);
            }
            
            if (sourceCode) {
                console.log(`  📁 SourceCode File: ${sourceCode.sourceCodeFile}`);
            }
            console.log('---');
        }
        
        // Kiểm tra tất cả SourceCode có sẵn
        const allSourceCodes = await SourceCode.find({}).limit(5);
        console.log(`\n📚 Available SourceCodes: ${allSourceCodes.length}`);
        for (const sc of allSourceCodes) {
            console.log(`- ID: ${sc._id}`);
            console.log(`  Name: ${sc.name}`);
            console.log(`  Slug: ${sc.slug}`);
            console.log(`  Has File: ${sc.sourceCodeFile ? 'Yes' : 'No'}`);
            console.log('---');
        }
        
        // Tìm SourceCode với slug cụ thể
        const specificSourceCode = await SourceCode.findOne({ slug: 'ng-dng-lu-tr-m-my' });
        if (specificSourceCode) {
            console.log('\n🎯 Found specific SourceCode:');
            console.log(`ID: ${specificSourceCode._id}`);
            console.log(`Name: ${specificSourceCode.name}`);
            console.log(`Slug: ${specificSourceCode.slug}`);
            console.log(`SourceCodeFile: ${specificSourceCode.sourceCodeFile}`);
        } else {
            console.log('\n❌ SourceCode with slug "ng-dng-lu-tr-m-my" not found');
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

debugDownload();