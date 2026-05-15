const jwt = require("jsonwebtoken");
const User = require("../modals/User");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "your_jwt_secret", async (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }

      try {
        const user = await User.findById(decoded.id);
        if (!user || user.status === "suspended") {
          return res.status(403).json({
            message: "Your account has been suspended or no longer exists. Please contact support.",
          });
        }
        req.user = decoded;
        next();
      } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Server error during authentication" });
      }
    });
  } else {
    res.sendStatus(401);
  }
};

const isProvider = (req, res, next) => {
  if (req.user && req.user.role === "provider") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = { isAuthenticated, isProvider };
