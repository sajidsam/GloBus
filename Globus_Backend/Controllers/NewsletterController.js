// Controllers/NewsletterController.js
const { ObjectId } = require('mongodb');

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Email validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        // MongoDB connection
        const client = req.app.locals.mongoClient;
        const db = client.db("globusDB");
        const subscribers = db.collection("newsletter_subscribers");

        // Check if email already exists
        const existingSubscriber = await subscribers.findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        if (existingSubscriber) {
            return res.status(409).json({ 
                success: false, 
                message: 'This email is already subscribed to our newsletter' 
            });
        }

        // Insert new subscriber
        const result = await subscribers.insertOne({
            email: email.toLowerCase().trim(),
            subscribedAt: new Date(),
            isActive: true,
            source: 'website'
        });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to our newsletter!',
            data: {
                id: result.insertedId,
                email: email.toLowerCase().trim()
            }
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

module.exports = { subscribeNewsletter };