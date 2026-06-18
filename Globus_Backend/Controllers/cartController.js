
const { ObjectId } = require("mongodb");

// Add to cart
const addToCart = async (req, res) => {
  try {
    console.log("ADD TO CART REQUEST BODY:", req.body);

    const { userId, productId, productName, productImage, price, originalPrice, discountPrice, brand, category, quantity } = req.body;

    if (!userId || !productId) {
      console.log("Missing userId or productId");
      return res.status(400).json({ message: "User ID and Product ID are required" });
    }

    const db = req.app.locals.mongoClient.db("globusDB");
    const cartCollection = db.collection("cart");

    console.log("Checking if item exists for user:", userId, "product:", productId);

// Check item existance
    const existingCartItem = await cartCollection.findOne({
      userId: userId,
      productId: productId
    });

    console.log("Existing cart item:", existingCartItem);

    if (existingCartItem) {

      console.log("Updating existing item quantity");
      const result = await cartCollection.updateOne(
        { userId: userId, productId: productId },
        { $inc: { quantity: quantity || 1 } }
      );
      console.log("Update result - matched:", result.matchedCount, "modified:", result.modifiedCount);
      res.status(200).json({
        message: "Cart item quantity updated",
        cartItem: { ...existingCartItem, quantity: existingCartItem.quantity + (quantity || 1) }
      });
    } else {
      console.log("Adding new item to cart");
      const cartItem = {
        userId,
        productId,
        productName,
        productImage,
        price,
        originalPrice,
        discountPrice,
        brand,
        category,
        quantity: quantity || 1,
        addedAt: new Date()
      };

      console.log("Cart item to insert:", cartItem);
      const result = await cartCollection.insertOne(cartItem);
      console.log("Insert result - insertedId:", result.insertedId);

      res.status(201).json({
        message: "Item added to cart successfully",
        cartItem: { ...cartItem, _id: result.insertedId }
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("GET CART REQUEST for user:", userId);

    if (!userId) {
      console.log("Missing userId in getCart");
      return res.status(400).json({ message: "User ID is required" });
    }

    const db = req.app.locals.mongoClient.db("globusDB");
    const cartCollection = db.collection("cart");

    console.log("Querying cart for user:", userId);
    const cartItems = await cartCollection.find({ userId: userId }).toArray();
    console.log("Found cart items count:", cartItems.length);
    console.log("Cart items:", cartItems);

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update cart quantity
const updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    console.log("UPDATE QUANTITY REQUEST - cartItemId:", cartItemId, "quantity:", quantity);

    if (!cartItemId || quantity === undefined) {
      console.log("Missing cartItemId or quantity");
      return res.status(400).json({ message: "Cart item ID and quantity are required" });
    }

    if (quantity < 1) {
      console.log("Quantity less than 1");
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const db = req.app.locals.mongoClient.db("globusDB");
    const cartCollection = db.collection("cart");

    console.log("Updating cart item with ID:", cartItemId);
    const result = await cartCollection.updateOne(
      { _id: new ObjectId(cartItemId) },
      { $set: { quantity: quantity } }
    );

    console.log("Update result - matched:", result.matchedCount, "modified:", result.modifiedCount);

    if (result.matchedCount === 0) {
      console.log("Cart item not found");
      return res.status(404).json({ message: "Cart item not found" });
    }

    console.log("Quantity updated successfully");
    res.status(200).json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    console.log("REMOVE ITEM REQUEST - cartItemId:", cartItemId);

    if (!cartItemId) {
      console.log("Missing cartItemId");
      return res.status(400).json({ message: "Cart item ID is required" });
    }

    const db = req.app.locals.mongoClient.db("globusDB");
    const cartCollection = db.collection("cart");

    console.log("Removing cart item with ID:", cartItemId);
    const result = await cartCollection.deleteOne({ _id: new ObjectId(cartItemId) });

    console.log("Delete result - deletedCount:", result.deletedCount);

    if (result.deletedCount === 0) {
      console.log("Cart item not found for deletion");
      return res.status(404).json({ message: "Cart item not found" });
    }

    console.log("Item removed successfully");
    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clear user cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("CLEAR CART REQUEST for user:", userId);

    if (!userId) {
      console.log("Missing userId in clearCart");
      return res.status(400).json({ message: "User ID is required" });
    }

    const db = req.app.locals.mongoClient.db("globusDB");
    const cartCollection = db.collection("cart");

    console.log("Clearing all cart items for user:", userId);
    const result = await cartCollection.deleteMany({ userId: userId });

    console.log("Clear result - deletedCount:", result.deletedCount);
    res.status(200).json({
      message: "Cart cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};