const router = require("express").Router();






const {
    add_assignment,
    get_assignments,
    get_totalAssignment,
    get_assignment_details,
    refresh_get_assignment_details,

} = require("../Controllers/Assignment");


router.post("/addassignment", add_assignment);
router.get("/getassignments", get_assignments);
router.get("/gettotalassignment", get_totalAssignment);
router.post("/getassignmentdetails", get_assignment_details);
router.post("/refreshgetassignmentdetails/:assignmentId", refresh_get_assignment_details);


module.exports = router;