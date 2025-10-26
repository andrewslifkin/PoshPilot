const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme-admin-token';

function adminAuth(req, res, next) {
  const providedToken = req.headers['x-admin-token'];
  if (!providedToken || providedToken !== ADMIN_TOKEN) {
    if (req.accepts('html')) {
      res.status(401).send('<h1>Unauthorized</h1><p>Admin token missing or invalid.</p>');
    } else {
      res.status(401).json({ error: 'unauthorized' });
    }
    return;
  }
  next();
}

module.exports = {
  adminAuth
};
