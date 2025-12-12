const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // we create JWT with { userId: user._id }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
