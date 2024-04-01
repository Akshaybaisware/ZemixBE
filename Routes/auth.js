const router = require('express').Router();

const {


    signin,
    signup,
    adminsignin,
    changePassword

} = require("../Controllers/Auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/adminsignin", adminsignin);
router.post("/changepassword", changePassword);



module.exports = router;