const bcrypt = require("bcrypt");

// Sign Up
const signupUser = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const usersCollection = database.collection("users");

    const { name, email, phone, password } = req.body;

    const exists = await usersCollection.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists!" });

    
    const hashedPassword = await bcrypt.hash(password, 10); 

    const result = await usersCollection.insertOne({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user" 
    });

    res.json({
      _id: result.insertedId,
      name,
      email,
      phone,
      role: "user" 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SignIn 
const signinUser = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const usersCollection = client.db("globusDB").collection("users");

    const { email, password } = req.body;

    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    
    const { password: pwd, ...userData } = user;
    res.json({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





module.exports = { signupUser, signinUser };
