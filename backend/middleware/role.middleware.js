// middleware/role.middleware.js
module.exports = {
  allowRoles: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).send({ message: "Not authenticated" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).send({ message: "Access denied" });
      }

      next();
    };
  }
};



