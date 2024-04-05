const router = require('express').Router();

const {
    add_package
} = require('../Controllers/Package.controller');

router.post('/addpackage', add_package);

module.exports = router;