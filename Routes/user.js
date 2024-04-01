const router = require('express').Router();

const {
    add_user,
    userlogin
} = require('../Controllers/User');


router.post('/adduser', add_user);
router.post('/login', userlogin);

module.exports = router;