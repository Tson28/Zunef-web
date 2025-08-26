const UserAccountInfo = require('../models/userAccountInfo.model');
const User = require('../models/user.model');
const Account = require('../models/account.model');

// Lấy danh sách UserAccountInfo với phân trang và tìm kiếm
const getAccountInfoList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Tạo filter query
    let matchQuery = {};

    // Filter theo status
    if (status === 'pending') {
      matchQuery.isReady = false;
      matchQuery.$or = [
        { username: { $exists: false } },
        { username: null },
        { password: { $exists: false } },
        { password: null }
      ];
    } else if (status === 'ready') {
      matchQuery.isReady = true;
    } else if (status === 'delivered') {
      matchQuery.deliveredAt = { $ne: null };
    }

    // Tạo aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      {
        $unwind: '$userId'
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'productId',
          foreignField: '_id',
          as: 'productId'
        }
      },
      {
        $unwind: {
          path: '$productId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: matchQuery
      }
    ];

    // Thêm search filter nếu có
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userId.name': { $regex: search, $options: 'i' } },
            { 'userId.email': { $regex: search, $options: 'i' } },
            { productName: { $regex: search, $options: 'i' } },
            { orderId: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Sắp xếp theo ngày tạo mới nhất
    pipeline.push({
      $sort: { createdAt: -1 }
    });

    // Đếm tổng số records
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await UserAccountInfo.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Thêm phân trang
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    const accounts = await UserAccountInfo.aggregate(pipeline);

    res.json({
      success: true,
      accounts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching account info list:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tài khoản',
      error: error.message
    });
  }
};

// Cập nhật thông tin tài khoản
const updateAccountInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      password,
      email,
      additionalInfo,
      notes,
      expiresAt
    } = req.body;

    const updateData = {
      username: username || null,
      password: password || null,
      email: email || null,
      additionalInfo: additionalInfo || null,
      notes: notes || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      updatedBy: req.user.id,
      lastUpdated: new Date()
    };

    const updatedAccount = await UserAccountInfo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email')
     .populate('productId', 'name');

    if (!updatedAccount) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công',
      account: updatedAccount
    });
  } catch (error) {
    console.error('Error updating account info:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin tài khoản',
      error: error.message
    });
  }
};

// Đánh dấu tài khoản sẵn sàng
const markAccountReady = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await UserAccountInfo.findById(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản'
      });
    }

    // Kiểm tra xem đã có thông tin đăng nhập chưa
    if (!account.username || !account.password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cập nhật thông tin đăng nhập trước khi đánh dấu sẵn sàng'
      });
    }

    const updatedAccount = await UserAccountInfo.findByIdAndUpdate(
      id,
      {
        isReady: true,
        deliveredAt: new Date(),
        updatedBy: req.user.id,
        lastUpdated: new Date()
      },
      { new: true }
    ).populate('userId', 'name email')
     .populate('productId', 'name');

    res.json({
      success: true,
      message: 'Đã đánh dấu tài khoản sẵn sàng',
      account: updatedAccount
    });
  } catch (error) {
    console.error('Error marking account ready:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tài khoản sẵn sàng',
      error: error.message
    });
  }
};

// Lấy chi tiết một tài khoản
const getAccountDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await UserAccountInfo.findById(id)
      .populate('userId', 'name email')
      .populate('productId', 'name');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản'
      });
    }

    res.json({
      success: true,
      account
    });
  } catch (error) {
    console.error('Error fetching account detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết tài khoản',
      error: error.message
    });
  }
};

// Xóa tài khoản (soft delete)
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAccount = await UserAccountInfo.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tài khoản'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông tin tài khoản'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tài khoản',
      error: error.message
    });
  }
};

// Thống kê tài khoản
const getAccountStats = async (req, res) => {
  try {
    const stats = await UserAccountInfo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isReady', false] },
                    {
                      $or: [
                        { $eq: ['$username', null] },
                        { $eq: ['$password', null] }
                      ]
                    }
                  ]
                },
                1,
                0
              ]
            }
          },
          ready: {
            $sum: {
              $cond: [{ $eq: ['$isReady', true] }, 1, 0]
            }
          },
          delivered: {
            $sum: {
              $cond: [{ $ne: ['$deliveredAt', null] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      pending: 0,
      ready: 0,
      delivered: 0
    };

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error fetching account stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê tài khoản',
      error: error.message
    });
  }
};

module.exports = {
  getAccountInfoList,
  updateAccountInfo,
  markAccountReady,
  getAccountDetail,
  deleteAccount,
  getAccountStats
};