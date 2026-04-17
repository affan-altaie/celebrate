const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const isProvider = (req, res, next) => {
  if (req.session.user && req.session.user.role === "provider") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = { isAuthenticated, isProvider };
