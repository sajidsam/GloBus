const { ObjectId } = require("mongodb");

const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingInfo.fullName': { $regex: search, $options: 'i' } },
        { 'shippingInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    
    const [orders, totalCount] = await Promise.all([
      ordersCollection.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      ordersCollection.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalOrders: totalCount,
          hasNext: pageNum < Math.ceil(totalCount / limitNum),
          hasPrev: pageNum > 1
        }
      },
      message: "Orders fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({
      success: true,
      data: order,
      message: "Order fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    console.log('Updating order status:', { id, status, adminNotes });
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided. Must be one of: " + validStatuses.join(', ')
      });
    }
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    // First check if order exists
    const existingOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    //  update operation 
    const updateOperation = {
      $set: {
        orderStatus: status,
        updatedAt: new Date()
      }
    };
    
    
    if (adminNotes) {
      updateOperation.$set.adminNotes = adminNotes;
    }
    
    // Add status history 
    const statusHistoryEntry = {
      status: status,
      updatedAt: new Date(),
      updatedBy: 'admin', 
      notes: adminNotes || ''
    };
    
    updateOperation.$push = {
      statusHistory: statusHistoryEntry
    };
    
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Get updated order to return
    const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status: " + error.message
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query; 
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    // Date filters for period
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter.createdAt = { $gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter.createdAt = { $gte: monthAgo };
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter.createdAt = { $gte: yearAgo };
        break;
      
    }
    
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      recentOrders
    ] = await Promise.all([
      ordersCollection.countDocuments(dateFilter),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'pending' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'processing' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'shipped' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'delivered' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'cancelled' }),
      ordersCollection.aggregate([
        { $match: { ...dateFilter, orderStatus: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$orderSummary.totalAmount' } } }
      ]).toArray(),
      ordersCollection.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get monthly revenue for charts
    const monthlyRevenue = await ordersCollection.aggregate([
      { $match: { orderStatus: 'delivered' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$orderSummary.totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        totalRevenue: totalRevenue,
        recentOrders: recentOrders,
        monthlyRevenue: monthlyRevenue,
        period: period
      },
      message: "Order statistics fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics"
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order"
    });
  }
};


module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
  
};