/**
 * RBAC Middleware: Restrict route access to users with 'admin' role
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrative privileges required.',
  });
};

module.exports = { requireAdmin };
