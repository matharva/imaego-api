const router = require('express').Router();
const adminController = require('../controllers/admin');
const authConrtoller = require('../custom/authmiddleware');

// sign up
router.post('/signup', adminController.signup);

//Some Action To Login with OTP!
router.post('/login', adminController.login);

//Some Action To Refesh Token!
router.post('/refresh', adminController.refresh);

module.exports = router;
