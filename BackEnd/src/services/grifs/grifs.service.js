const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

const conn = mongoose.connection;
let gfs;
conn.once('open',() => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

const uploadFile = (file) => {
    return new Promise((resolve,reject) => {
        gfs.createWriteStream({
            filename: file.originalname,
        }).on('finish',() => {
            resolve({
                filename: file.originalname,
            })
        }).on('error',(err) => {
            reject(err);
        }).end(file.buffer);
    })
}

const getFile = (filename) => {
    return new Promise((resolve,reject) => {
        gfs.files.findOne({filename},(err,file) => {
            if(err){
                reject(err);
            }
            resolve(file);
        })
    })
}

const getFileReadStream = (filename) => {
    return gfs.createReadStream(filename);
}

const deleteFile = (filename) => {
    return new Promise((resolve,reject) => {
        gfs.files.deleteOne({filename},(err,file) => {
            if(err){
                reject(err);
            }
            resolve(file);
        })
    })
}

const deleteFileById = (id) => {
    return new Promise((resolve,reject) => {
        gfs.files.deleteOne({_id: id},(err,file) => {
            if(err){
                reject(err);
            }
            resolve(file);
        })
    })
}

const getFileById = (id) => {
    return new Promise((resolve,reject) => {
        gfs.files.findOne({_id: id},(err,file) => {
            if(err){
                reject(err);
            }
            resolve(file);
        })
    })
}

const getFileByIdReadStream = (id) => {
    return gfs.createReadStream({_id: id});
}   

module.exports = {
    uploadFile,
    getFile,
    getFileReadStream,
    deleteFile,
    deleteFileById,
    getFileById,
    getFileByIdReadStream,
}
