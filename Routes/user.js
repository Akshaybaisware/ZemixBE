const router = require('express').Router();

const {
    add_user
} = require('../Controllers/User');


router.post('/adduser', add_user);

module.exports = router;