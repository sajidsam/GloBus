const { ObjectId } = require("mongodb");

const getProductById = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const db = client.db("globusDB");
    const productsCollection = db.collection("products");

    const { id } = req.params;
    console.log(id);
    
    if (!id) return res.status(400).json({ error: "Product ID is required" });

    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("Get Product By ID Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { getProductById};
