const User = require('../models/User');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const getSignup = (req, res) => res.render('auth/signup', { title: 'Sign Up' });

const postSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await User.create({
      name: (name || '').trim(),
      email: normalizeEmail(email),
      password,
      role: 'user'
    });
    res.redirect('/auth/login');
  } catch (error) {
    res.render('auth/signup', { title: 'Sign Up', error: 'Signup failed. Email may already exist.' });
  }
};

const getLogin = (req, res) => res.render('auth/login', { title: 'Login' });

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user || !(await user.matchPassword(password))) {
      return res.render('auth/login', { title: 'Login', error: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.name = user.name;
    return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/');
  } catch (error) {
    return res.render('auth/login', { title: 'Login', error: 'Login failed' });
  }
};

const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};

module.exports = { getSignup, postSignup, getLogin, postLogin, logout };
