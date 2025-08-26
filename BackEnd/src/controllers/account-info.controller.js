const Order = require('../models/order.model');
const Account = require('../models/account.model');
const UserAccountInfo = require('../models/userAccountInfo.model');

class AccountInfoController {
    // Lấy thông tin đăng nhập account
    async getAccountInfo(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            // Tìm thông tin account từ UserAccountInfo
            const userAccountInfo = await UserAccountInfo.findByOrderAndUser(orderId, userId);
            
            if (!userAccountInfo) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tài khoản hoặc đơn hàng chưa được thanh toán'
                });
            }
            
            // Kiểm tra xem account đã sẵn sàng chưa
            if (!userAccountInfo.isReady) {
                return res.status(202).json({
                    success: true,
                    message: 'Tài khoản đang được chuẩn bị. Vui lòng quay lại sau.',
                    data: {
                        orderId: userAccountInfo.orderId,
                        productName: userAccountInfo.productName,
                        status: 'preparing',
                        estimatedTime: '24-48 giờ'
                    }
                });
            }
            
            // Cập nhật trạng thái đã giao hàng nếu chưa
            if (!userAccountInfo.deliveredAt) {
                await userAccountInfo.markAsDelivered();
            }
            
            // Lấy thông tin product để có policy
            const account = await Account.findById(userAccountInfo.productId);
            
            // Trả về thông tin đăng nhập
            res.status(200).json({
                success: true,
                data: {
                    orderId: userAccountInfo.orderId,
                    productName: userAccountInfo.productName,
                    loginInfo: {
                        username: userAccountInfo.username,
                        password: userAccountInfo.password,
                        email: userAccountInfo.email,
                        additionalInfo: userAccountInfo.additionalInfo
                    },
                    deliveredAt: userAccountInfo.deliveredAt,
                    expiresAt: userAccountInfo.expiresAt,
                    policy: account ? account.policy : []
                }
            });
            
        } catch (error) {
            console.error('Get account info error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Kiểm tra trạng thái account
    async checkAccountStatus(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const userAccountInfo = await UserAccountInfo.findByOrderAndUser(orderId, userId);
            
            if (!userAccountInfo) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin tài khoản'
                });
            }
            
            res.status(200).json({
                success: true,
                data: {
                    orderId: userAccountInfo.orderId,
                    productName: userAccountInfo.productName,
                    isReady: userAccountInfo.isReady,
                    isDelivered: !!userAccountInfo.deliveredAt,
                    lastUpdated: userAccountInfo.updatedAt,
                    expiresAt: userAccountInfo.expiresAt,
                    status: userAccountInfo.isReady ? 'ready' : 'preparing'
                }
            });
            
        } catch (error) {
            console.error('Check account status error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AccountInfoController();