/* This code snippet is setting up a router using Express.js framework in a Node.js application. Here's
a breakdown of what each part is doing: */
const router = require("express").Router();

const {
    add_assignment,
    get_assignments,
    get_totalAssignment,
    get_assignment_details,
    refresh_get_assignment_details,

} = require("../Controllers/Assignment");

const {
    update_assignment_Details
} = require("../Controllers/UpdateAssignment");

router.post("/addassignment", add_assignment);
router.get("/getassignments", get_assignments);
router.get("/gettotalassignment", get_totalAssignment);
router.post("/getassignmentdetails", get_assignment_details);
router.post("/refreshgetassignmentdetails/:assignmentId", refresh_get_assignment_details);

router.post("/updateassignmentdetails", update_assignment_Details);

module.exports = router;