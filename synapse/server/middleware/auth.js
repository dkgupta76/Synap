const User = require("../models/User");

async function protect(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "Please log in to continue.",
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401).json({
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    if (user.status !== "active") {
      req.session.destroy(() => {});
      return res.status(403).json({
        message: "Your account is not active.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
}

module.exports = { protect, authorize };
