const Account = require('../models/account.model');
const Order = require('../models/order.model');
const UserAccountInfo = require('../models/userAccountInfo.model');

class AdminAccountController {
    // Lấy danh sách UserAccountInfo cần cập nhật thông tin đăng nhập
    async getPendingAccounts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            // Tìm các UserAccountInfo chưa sẵn sàng
            const userAccounts = await UserAccountInfo.find({
                isReady: false
            })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
            const totalCount = await UserAccountInfo.countDocuments({
                isReady: false
            });
            
            res.status(200).json({
                success: true,
                data: {
                    userAccounts,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / limit),
                        totalCount,
                        hasNext: page < Math.ceil(totalCount / limit),
                        hasPrev: page > 1
                    }
                }
            });
            
        } catch (error) {
            console.error('Get pending accounts error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Cập nhật thông tin đăng nhập cho UserAccountInfo
    async updateAccountLoginInfo(req, res) {
        try {
            const { id } = req.params;
            const { username, password, email, additionalInfo } = req.body;
            
            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username và password là bắt buộc'
                });
            }
            
            const userAccount = await UserAccountInfo.findById(id);
            if (!userAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tài khoản'
                });
            }
            
            // Cập nhật thông tin đăng nhập
            await userAccount.updateLoginInfo({
                username,
                password,
                email,
                additionalInfo
            });
            
            res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin đăng nhập thành công',
                data: userAccount
            });
            
        } catch (error) {
            console.error('Update account login info error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Lấy thông tin chi tiết UserAccountInfo
    async getAccountDetail(req, res) {
        try {
            const { id } = req.params;
            
            const userAccount = await UserAccountInfo.findById(id)
                .populate('userId', 'fullName email');
                
            if (!userAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tài khoản'
                });
            }
            
            // Lấy thông tin product để có thêm chi tiết
            const account = await Account.findById(userAccount.productId);
            
            res.status(200).json({
                success: true,
                data: {
                    userAccount,
                    productInfo: account ? {
                        name: account.name,
                        price: account.price,
                        duration: account.duration,
                        category: account.category,
                        policy: account.policy
                    } : null
                }
            });
            
        } catch (error) {
            console.error('Get account detail error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Đánh dấu tài khoản đã sẵn sàng
    async markAccountReady(req, res) {
        try {
            const { id } = req.params;
            
            const userAccount = await UserAccountInfo.findById(id);
            if (!userAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tài khoản'
                });
            }
            
            // Kiểm tra xem đã có thông tin đăng nhập chưa
            if (!userAccount.username || !userAccount.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cập nhật thông tin đăng nhập trước khi đánh dấu sẵn sàng'
                });
            }
            
            await userAccount.markAsReady();
            
            res.status(200).json({
                success: true,
                message: 'Đánh dấu tài khoản sẵn sàng thành công',
                data: userAccount
            });
            
        } catch (error) {
            console.error('Mark account ready error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Tìm kiếm UserAccountInfo
    async searchUserAccounts(req, res) {
        try {
            const { query, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập từ khóa tìm kiếm'
                });
            }
            
            // Tìm kiếm theo orderId, productName hoặc thông tin user
            const searchFilter = {
                $or: [
                    { orderId: { $regex: query, $options: 'i' } },
                    { productName: { $regex: query, $options: 'i' } },
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            };
            
            const userAccounts = await UserAccountInfo.find(searchFilter)
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
                
            const total = await UserAccountInfo.countDocuments(searchFilter);
            
            res.status(200).json({
                success: true,
                data: {
                    userAccounts,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
            
        } catch (error) {
            console.error('Search user accounts error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AdminAccountController();