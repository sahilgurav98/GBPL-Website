const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  return next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/auth/login');
  return next();
};

module.exports = { requireAuth, requireAdmin };
