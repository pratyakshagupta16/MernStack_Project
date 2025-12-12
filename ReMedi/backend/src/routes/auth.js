const express = require('express');
const router = express.Router();

const register = require('../controllers/authRegister');
const login = require('../controllers/authLogin');

router.post('/register', register.register);
router.post('/login', login.login);

module.exports = router;
