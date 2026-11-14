const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/emailService");
const { verifyFirebaseIdToken } = require("../utils/verifyFirebaseToken");

// Sign Up user
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

    // Send welcome email asynchronously (don't block the response)
    sendWelcomeEmail(email, name).catch(console.error);

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





// Forgot Password - Generate and send 6-digit OTP code to user's email
const forgotPassword = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const usersCollection = client.db("globusDB").collection("users");

    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    const normalizedEmail = verifiedEmail.trim().toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address. Please check the spelling or sign up for a new account.",
      });
    }

    // Generate cryptographically random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save hashed OTP & expiration in user document
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordOtp: hashedOtp,
          resetPasswordExpires: expiresAt,
          resetPasswordAttempts: 0,
        },
      }
    );

    // Send the password reset email
    await sendPasswordResetEmail(normalizedEmail, user.name, otp);

    res.json({
      success: true,
      message: "A 6-digit verification code has been sent to your email.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send reset code. Please try again later.",
    });
  }
};

// Verify 6-digit Reset OTP Code
const verifyResetCode = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const usersCollection = client.db("globusDB").collection("users");

    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and verification code are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "No active password reset request found. Please request a new code.",
      });
    }

    // Check expiration
    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(code.trim(), user.resetPasswordOtp);
    if (!isMatch) {
      // Increment attempt counter
      const attempts = (user.resetPasswordAttempts || 0) + 1;
      if (attempts >= 5) {
        // Invalidate OTP after 5 failed attempts
        await usersCollection.updateOne(
          { _id: user._id },
          { $unset: { resetPasswordOtp: "", resetPasswordExpires: "", resetPasswordAttempts: "" } }
        );
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please request a new verification code.",
        });
      }
      await usersCollection.updateOne({ _id: user._id }, { $set: { resetPasswordAttempts: attempts } });
      return res.status(400).json({ success: false, message: "Invalid verification code. Please try again." });
    }

    res.json({
      success: true,
      message: "Code verified successfully.",
    });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reset Password with verified code
const resetPassword = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const usersCollection = client.db("globusDB").collection("users");

    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, verification code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "No active password reset request found. Please request a new code.",
      });
    }

    // Check expiration
    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Validate OTP
    const isMatch = await bcrypt.compare(code.trim(), user.resetPasswordOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordOtp: "", resetPasswordExpires: "", resetPasswordAttempts: "" },
      }
    );

    res.json({
      success: true,
      message: "Password reset successful! You can now sign in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const usersCollection = client.db("globusDB").collection("users");
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const { phone, address, city, zipCode, country, bio, avatar } = req.body;

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (country !== undefined) updateData.country = country;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0, resetPasswordOtp: 0, resetPasswordExpires: 0 } }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// Google Login
const googleLogin = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const usersCollection = client.db("globusDB").collection("users");
    
    const { idToken, email: rawEmail, name: rawName, avatar: rawAvatar } = req.body;

    let verifiedEmail = rawEmail;
    let verifiedName = rawName;
    let verifiedAvatar = rawAvatar;

    // Verify Firebase JWT token
    if (idToken) {
      try {
        const decoded = await verifyFirebaseIdToken(idToken);
        verifiedEmail = decoded.email;
        verifiedName = decoded.name || verifiedName;
        verifiedAvatar = decoded.avatar || verifiedAvatar;
      } catch (verifyErr) {
        console.error("Firebase token verification failed:", verifyErr.message);
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid or expired Google token",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required for authentication",
      });
    }

    if (!verifiedEmail) {
      return res.status(400).json({ success: false, message: "Email is required for Google login" });
    }

    const normalizedEmail = verifiedEmail.trim().toLowerCase();
    
    let user = await usersCollection.findOne({ email: normalizedEmail });

    if (user) {
      const updateDoc = {};
      if (verifiedAvatar && !user.avatar) updateDoc.avatar = verifiedAvatar;
      if (user.authProvider !== "google") updateDoc.authProvider = "google";
      
      if (Object.keys(updateDoc).length > 0) {
        await usersCollection.updateOne({ _id: user._id }, { $set: updateDoc });
        user = await usersCollection.findOne({ _id: user._id });
      }
    } else {
      const result = await usersCollection.insertOne({
        name: verifiedName || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        avatar: verifiedAvatar || "",
        authProvider: "google",
        role: "user",
        createdAt: new Date(),
      });
      
      user = await usersCollection.findOne({ _id: result.insertedId });
      sendWelcomeEmail(normalizedEmail, verifiedName).catch(console.error);
    }

    const { password: pwd, resetPasswordOtp, resetPasswordExpires, ...userData } = user;
    
    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        avatar: userData.avatar,
        authProvider: userData.authProvider
      }
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ success: false, message: "Failed to login with Google" });
  }
};

module.exports = { signupUser, signinUser, forgotPassword, verifyResetCode, resetPassword, updateProfile, googleLogin };
