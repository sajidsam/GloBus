const { ObjectId } = require("mongodb");

// Get all products
const browseProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const products = await productsCollection.find({}).toArray();

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const product = req.body;
    
    product.slug = product.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    product.createdAt = new Date();
    product.updatedAt = new Date();

    const result = await productsCollection.insertOne(product);

    res.status(201).json({ message: "Product created", productId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const id = req.params.id;
    const updateData = req.body;
    updateData.updatedAt = new Date();

    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }

    await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    res.status(200).json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const id = req.params.id;
    await productsCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { browseProduct, createProduct, updateProduct, deleteProduct };
