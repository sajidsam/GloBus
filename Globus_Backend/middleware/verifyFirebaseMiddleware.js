const { verifyFirebaseIdToken } = require("../utils/verifyFirebaseToken");

/**
 * Express middleware to verify Firebase ID Token (JWT) in Authorization header.
 * Usage: router.get("/protected-route", verifyFirebaseMiddleware, controllerFunction);
 */
const verifyFirebaseMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required (Bearer <token>)",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verifiedUser = await verifyFirebaseIdToken(token);
    req.user = verifiedUser; // { uid, email, name, avatar }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token",
    });
  }
};

module.exports = { verifyFirebaseMiddleware };

