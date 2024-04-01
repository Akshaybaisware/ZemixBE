const router = require('express').Router();

const {
    add_user,
    userlogin,
    forgot_password
} = require('../Controllers/User');


router.post('/adduser', add_user);
router.post('/login', userlogin);
router.post('/forgetpassword', forgot_password);

module.exports = router;