const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
require("dotenv").config();

// Create admin 
const createAdmin = async (db) => {
  try {
    const usersCollection = db.collection("users");

    const adminExists = await usersCollection.findOne({ email: process.env.ADMIN_EMAIL });
    if (adminExists) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = {
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      status: "active" 
    };

    await usersCollection.insertOne(admin);
    console.log("Admin created successfully!");
  } catch (err) {
    console.error("Error creating admin:", err.message);
  }
};

// Get user role
const getRole = async (req, res) => {
  try {
    const db = req.app.locals.mongoClient.db("globusDB"); 
    const usersCollection = db.collection("users");

    const email = req.query.email; 
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await usersCollection.findOne({ email }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ role: user.role });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};

// Show all users
const showUsers = async (req, res) => {
  try {
    const db = req.app.locals.mongoClient.db("globusDB");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({ role: "user" }).toArray();

    
    const cleanUsers = users.map(({ password, ...rest }) => rest);

    res.json(cleanUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete  user
const deleteUser = async (req, res) => {
  try {
    const db = req.app.locals.mongoClient.db("globusDB");
    const usersCollection = db.collection("users");

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid user ID" });

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Suspend or unsuspend user
const toggleUserStatus = async (req, res) => {
  try {
    const db = req.app.locals.mongoClient.db("globusDB");
    const usersCollection = db.collection("users");

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newStatus = user.status === "active" ? "suspended" : "active";
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: newStatus } }
    );

    res.json({ message: `User ${newStatus} successfully`, status: newStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAdmin, getRole, showUsers, deleteUser, toggleUserStatus };
