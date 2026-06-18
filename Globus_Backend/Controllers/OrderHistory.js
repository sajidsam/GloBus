// User Order and Payment Details
const getUserOrders = async (req, res) => {
    try {
        const { userEmail } = req.query;
        
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: 'User email is required'
            });
        }

        const client = req.app.locals.mongoClient;
        const db = client.db("globusDB");
        const ordersCollection = db.collection("orders");

        const orders = await ordersCollection.find({ "userInfo.email": userEmail })
            .sort({ "timestamps.created": -1 })
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        console.error('Get User Orders Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

module.exports = {
    getUserOrders
};