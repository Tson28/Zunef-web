const emailValidate = (email) => {
    if (typeof email !== 'string') return false;
    const value = email.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(value);
};
module.exports = emailValidate;