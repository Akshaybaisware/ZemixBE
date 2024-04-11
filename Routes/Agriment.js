const router = require("express").Router();

const {
    getaggrimentdetails
} = require("../Controllers/Aggiriment");

router.post("/getaggrimentdetails", getaggrimentdetails);
module.exports = router;