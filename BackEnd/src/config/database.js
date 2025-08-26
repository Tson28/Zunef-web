const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async() => {
    try{
        const URL = process.env.MONGODB_URL;
        await mongoose.connect(URL);
        console.log('database.js| database is connected!');
    }catch(error){
        console.log(error)
    };
}

module.exports = connectDB;