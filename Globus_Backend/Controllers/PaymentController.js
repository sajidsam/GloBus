const SSLCommerzPayment = require('sslcommerz-lts');
require('dotenv').config();

// Initialize SSL Commerz Payment
const initSSLCommerz = async (req, res) => {
    const store_id = process.env.SSLCOMMERZ_STORE_ID || 'globu6921ba3578f20';
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'globu6921ba3578f20@ssl';
    const is_live = false;

    const pay = req.body;
    console.log('Received payment data:', pay);

    const {
        total_amount,
        currency,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_city,
        customer_country,
        shipping_info,
        cart_items,
        source,
        user_email,
        user_id
    } = pay;

    // Unique IDs
    const tran_id = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const order_number = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    try {
        const client = req.app.locals.mongoClient;
        const db = client.db("globusDB");
        
        // 1. Create Order collection
        const orderData = {
            orderNumber: order_number,
            userInfo: {
                email: user_email,
                userId: user_id
            },
            shippingInfo: {
                fullName: customer_name,
                email: customer_email,
                phone: customer_phone,
                address: customer_address,
                city: customer_city,
                state: shipping_info.state || 'Dhaka',
                zipCode: shipping_info.zipCode || '1000',
                country: customer_country
            },
            items: cart_items.map(item => ({
                productId: item._id || item.productId,
                name: item.productName || item.name,
                price: item.discountPrice || item.price,
                quantity: item.quantity || 1,
                image: item.productImage || item.images?.[0],
                variant: item.selectedVariant
            })),
            orderSummary: {
                subtotal: total_amount,
                shipping: 0,
                tax: 0,
                discount: 0,
                totalAmount: total_amount,
                currency: currency,
                itemsCount: cart_items.reduce((sum, item) => sum + (item.quantity || 1), 0)
            },
            orderStatus: 'pending',
            source: source,
            timestamps: {
                created: new Date(),
                updated: new Date()
            }
        };

        // Insert order
        const ordersCollection = db.collection("orders");
        const orderResult = await ordersCollection.insertOne(orderData);
        console.log('Order created with ID:', orderResult.insertedId);

        // 2. Create Transaction collection
        const transactionData = {
            orderId: orderResult.insertedId,
            orderNumber: order_number,
            userEmail: user_email,
            transactionId: tran_id,
            amount: total_amount,
            currency: currency,
            paymentMethod: 'SSLCommerz',
            paymentStatus: 'pending',
            timestamps: {
                initiated: new Date()
            }
        };

        // Insert transaction
        const transactionsCollection = db.collection("transactions");
        await transactionsCollection.insertOne(transactionData);
        console.log('Transaction created with ID:', tran_id);

        // SSL Commerz data
        const data = {
            total_amount: total_amount,
            currency: currency,
            tran_id: tran_id,
            success_url: `http://localhost:5000/api/sslcommerz/success/${tran_id}`,
            fail_url: `http://localhost:5000/api/sslcommerz/fail/${tran_id}`,
            cancel_url: `http://localhost:5000/api/sslcommerz/cancel/${tran_id}`,
            ipn_url: `http://localhost:5000/api/sslcommerz/ipn`,
            shipping_method: 'Courier',
            product_name: cart_items.length === 1 ? cart_items[0].name : `Multiple Items (${cart_items.length})`,
            product_category: 'Ecommerce',
            product_profile: 'general',
            
            // Customer information 
            cus_name: customer_name,
            cus_email: customer_email,
            cus_add1: customer_address,
            cus_add2: customer_address,
            cus_city: customer_city,
            cus_state: shipping_info.state || 'Dhaka',
            cus_postcode: shipping_info.zipCode || '1000',
            cus_country: customer_country,
            cus_phone: customer_phone,
            cus_fax: customer_phone,
            
            // Shipping information 
            ship_name: shipping_info.fullName,
            ship_add1: shipping_info.address,
            ship_add2: shipping_info.address,
            ship_city: shipping_info.city,
            ship_state: shipping_info.state || 'Dhaka',
            ship_postcode: shipping_info.zipCode || 1000,
            ship_country: shipping_info.country || 'Bangladesh',
        };

        console.log('SSL Commerz request data:', data);

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse?.GatewayPageURL) {
            res.json({
                GatewayPageURL: apiResponse.GatewayPageURL,
                status: "SUCCESS",
                transactionId: tran_id,
                orderId: orderResult.insertedId,
                orderNumber: order_number
            });
        } else {
            
            await ordersCollection.updateOne(
                { _id: orderResult.insertedId },
                { 
                    $set: { 
                        "orderStatus": 'cancelled',
                        "timestamps.updated": new Date()
                    } 
                }
            );
            
            await transactionsCollection.updateOne(
                { transactionId: tran_id },
                { 
                    $set: { 
                        "paymentStatus": 'failed',
                        "timestamps.updated": new Date()
                    } 
                }
            );
            
            res.status(400).json({
                status: "FAILED",
                message: "Payment initialization failed"
            });
        }
    } catch (error) {
        console.error('SSL Commerz initialization error:', error);
        res.status(500).json({
            status: "FAILED",
            message: "Payment initialization failed",
            error: error.message
        });
    }
}

// IPN Handler
const handleIPN = async (req, res) => {
    try {
        console.log('IPN Request Received:', req.body);
        const paymentData = req.body;
        
        if (paymentData.status === 'VALID') {
            const client = req.app.locals.mongoClient;
            const db = client.db("globusDB");
            const transactionsCollection = db.collection("transactions");
            const ordersCollection = db.collection("orders");
            
            // Update transaction with SSL response
            await transactionsCollection.updateOne(
                { transactionId: paymentData.tran_id },
                { 
                    $set: { 
                        "paymentStatus": 'paid',
                        "sslResponse": paymentData,
                        "timestamps.completed": new Date(),
                        "timestamps.updated": new Date()
                    } 
                }
            );
            
            // Update order status
            const transaction = await transactionsCollection.findOne({ transactionId: paymentData.tran_id });
            if (transaction) {
                await ordersCollection.updateOne(
                    { _id: transaction.orderId },
                    { 
                        $set: { 
                            "orderStatus": 'processing',
                            "timestamps.updated": new Date()
                        } 
                    }
                );
            }
            
            console.log('Transaction updated via IPN');
        }
        
        return res.status(200).json({
            success: true,
            message: 'IPN received successfully'
        });
    } catch (error) {
        console.error('IPN Handler Error:', error);
        return res.status(500).json({
            success: false,
            message: 'IPN processing failed'
        });
    }
};

// Payment Success Handler
const paymentSuccess = async (req, res) => {
    try {
        const { tran_id } = req.params;
        console.log('Payment Success for tran_id:', tran_id);

        const client = req.app.locals.mongoClient;
        const db = client.db("globusDB");
        const transactionsCollection = db.collection("transactions");
        const ordersCollection = db.collection("orders");
        
        // Update transaction status
        await transactionsCollection.updateOne(
            { transactionId: tran_id },
            { 
                $set: { 
                    "paymentStatus": 'paid',
                    "timestamps.completed": new Date(),
                    "timestamps.updated": new Date()
                } 
            }
        );
        
        // Update order status
        const transaction = await transactionsCollection.findOne({ transactionId: tran_id });
        if (transaction) {
            await ordersCollection.updateOne(
                { _id: transaction.orderId },
                { 
                    $set: { 
                        "orderStatus": 'processing',
                        "timestamps.updated": new Date()
                    } 
                }
            );
            
            // Clear user cart if from cart
            const order = await ordersCollection.findOne({ _id: transaction.orderId });
            if (order && order.source === 'cart') {
                const cartCollection = db.collection("cart");
                await cartCollection.updateOne(
                    { userEmail: order.userInfo.email },
                    { $set: { items: [] } }
                );
                console.log('Cart cleared for user:', order.userInfo.email);
            }
        }

        return res.redirect(`http://localhost:3000/payment-success?tran_id=${tran_id}&status=success`);
    } catch (error) {
        console.error('Payment Success Error:', error);
        return res.redirect(`http://localhost:3000/payment-failed?error=Payment verification failed`);
    }
};

// Payment Failed Handler
const paymentFailed = async (req, res) => {
    try {
        const { tran_id } = req.params;
        console.log('Payment Failed for tran_id:', tran_id);

        const client = req.app.locals.mongoClient;
        const db = client.db("globusDB");
        const transactionsCollection = db.collection("transactions");
        const ordersCollection = db.collection("orders");
        
        // Update transaction status
        await transactionsCollection.updateOne(
            { transactionId: tran_id },
            { 
                $set: { 
                    "paymentStatus": 'failed',
                    "timestamps.updated": new Date()
                } 
            }
        );
        
        // Update order status
        const transaction = await transactionsCollection.findOne({ transactionId: tran_id });
        if (transaction) {
            await ordersCollection.updateOne(
                { _id: transaction.orderId },
                { 
                    $set: { 
                        "orderStatus": 'cancelled',
                        "timestamps.updated": new Date()
                    } 
                }
            );
        }

        return res.redirect(`http://localhost:3000/payment-failed?tran_id=${tran_id}&status=failed`);
    } catch (error) {
        console.error('Payment Failed Error:', error);
        return res.redirect(`http://localhost:3000/payment-failed?error=Payment processing error`);
    }
};

// Payment Cancel Handler
const paymentCancel = async (req, res) => {
    try {
        const { tran_id } = req.params;
        console.log('Payment Cancelled for tran_id:', tran_id);

        const client = req.app.locals.mongoClient;
        const db = client.db("globusDB");
        const transactionsCollection = db.collection("transactions");
        const ordersCollection = db.collection("orders");
        
        // Update transaction status
        await transactionsCollection.updateOne(
            { transactionId: tran_id },
            { 
                $set: { 
                    "paymentStatus": 'cancelled',
                    "timestamps.updated": new Date()
                } 
            }
        );
        
        // Update order status
        const transaction = await transactionsCollection.findOne({ transactionId: tran_id });
        if (transaction) {
            await ordersCollection.updateOne(
                { _id: transaction.orderId },
                { 
                    $set: { 
                        "orderStatus": 'cancelled',
                        "timestamps.updated": new Date()
                    } 
                }
            );
        }

        return res.redirect(`http://localhost:3000/cart?message=Payment cancelled&tran_id=${tran_id}`);
    } catch (error) {
        console.error('Payment Cancel Error:', error);
        return res.redirect(`http://localhost:3000/cart?message=Payment cancellation failed`);
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const { userEmail } = req.query;
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
    initSSLCommerz,
    handleIPN,
    paymentSuccess,
    paymentFailed,
    paymentCancel,
    getUserOrders
};