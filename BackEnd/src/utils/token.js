const crypto = require('crypto');

const GenerateToken = async() => {
    return crypto.randomBytes(120).toString("hex");
}
module.exports = GenerateToken;