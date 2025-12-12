const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Invalid email or password' });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user details also
    return res.json({
      msg: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
