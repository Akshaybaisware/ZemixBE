const router = require('express').Router();
const {
    add_terms,
    get_terms,
    get_terms_by_id,
    getTodaysRegistrations,
    search_agreement
} = require("../Controllers/Terms");

router.post("/addterms", add_terms);
router.get("/getterms", get_terms);
router.get("/gettermsbyid/:id", get_terms_by_id);
router.post("/searchagreement", search_agreement);
router.get("/gettodaysregistrations", getTodaysRegistrations);




module.exports = router;