const Account = require('../models/account.model');

// Create a new account item
const createAccount = async (payload) => {
    const { name, price, Discount, stock, duration, category, thumbnail, imagepreview, videopreview, policy, description } = payload;

    try {
        const doc = await Account.create({
            name,
            price,
            Discount,
            stock,
            duration,
            category,
            thumbnail,
            imagepreview,
            videopreview,
            policy,
            description,
        });
        return doc;
    } catch (error) {
        if (error.code === 11000) {
            const err = new Error('Tên tài khoản đã tồn tại!');
            err.status = 409;
            throw err;
        }
        throw error;
    }
};

// Get all accounts with optional pagination and search
const getAccounts = async (options = {}) => {
    const { page, limit, search, category } = options;

    const query = {};
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
        query.category = { $in: Array.isArray(category) ? category : [category] };
    }

    // If page or limit not provided, keep old behavior: return full list
    if (!page || !limit) {
        const items = await Account.find(query).sort({ createdAt: -1 });
        return items;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

    const [items, total] = await Promise.all([
        Account.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize),
        Account.countDocuments(query),
    ]);

    return {
        items,
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

// Delete account by id
const deleteAccount = async (id) => {
    const deletedAccount = await Account.findByIdAndDelete(id);
    if (!deletedAccount) {
        const err = new Error('Không tìm thấy tài khoản để xóa!');
        err.status = 404;
        throw err;
    }
    return deletedAccount;
};

// Update account by id
const updateAccount = async (id, payload) => {
    const { name, price, Discount, stock, category, thumbnail, imagepreview, videopreview, policy, description } = payload;
    
    const updatedAccount = await Account.findByIdAndUpdate(
        id,
        {
            name,
            price,
            Discount,
            stock,
            category,
            thumbnail,
            imagepreview,
            videopreview,
            policy,
            description,
        },
        { new: true, runValidators: true }
    );
    
    if (!updatedAccount) {
        const err = new Error('Không tìm thấy tài khoản để cập nhật!');
        err.status = 404;
        throw err;
    }
    
    return updatedAccount;
};

// Get account by id
const getAccountById = async (id) => {
    const account = await Account.findById(id);
    if (!account) {
        const err = new Error('Không tìm thấy tài khoản!');
        err.status = 404;
        throw err;
    }
    return account;
};

// Check if account exists by name
const checkAccountExists = async (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const existingAccount = await Account.findOne(query);
    return !!existingAccount;
};

module.exports = {
    createAccount,
    getAccounts,
    getAccountById,
    deleteAccount,
    updateAccount,
    checkAccountExists,
};