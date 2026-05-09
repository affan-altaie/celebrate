const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "your_jwt_secret", (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
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
