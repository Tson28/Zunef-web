const orderService = require('../services/order.service');

class OrderController {
    // Lấy danh sách đơn hàng của user
    async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await orderService.getUserOrders(userId, page, limit);
            
            res.status(200).json({
                success: true,
                data: result.orders,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error getting user orders:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Lấy thông tin đơn hàng theo orderId
    async getOrderById(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.id;
            
            const order = await orderService.getOrderById(orderId);
            
            // Kiểm tra quyền truy cập
            if (order.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập đơn hàng này'
                });
            }
            
            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Error getting order:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Cập nhật trạng thái đơn hàng (Admin only)
    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không được để trống'
                });
            }
            
            const validStatuses = ['pending', 'paid', 'processing', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ'
                });
            }
            
            const order = await orderService.updateOrderStatus(orderId, status);
            
            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái đơn hàng thành công',
                data: order
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Lấy đơn hàng account chưa có thông tin (Admin only)
    async getPendingAccountOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await orderService.getPendingAccountOrders(page, limit);
            
            res.status(200).json({
                success: true,
                data: result.orders,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error getting pending account orders:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Cập nhật thông tin account cho đơn hàng (Admin only)
    async updateAccountInfo(req, res) {
        try {
            const { orderId } = req.params;
            const { username, password, email, additionalInfo } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username và password là bắt buộc'
                });
            }
            
            const accountInfo = {
                username,
                password,
                email,
                additionalInfo
            };
            
            const order = await orderService.updateAccountInfo(orderId, accountInfo);
            
            res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin account thành công',
                data: order
            });
        } catch (error) {
            console.error('Error updating account info:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new OrderController();