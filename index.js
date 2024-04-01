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
app.use('/api/user', require('./Routes/user'));
app.use('/api/employee', require('./Routes/employees'));
app.use('/api/assignment', require('./Routes/assignment'));
app.use('/api/auth', require('./Routes/auth'));
/* The line `app.use('/api/terms', require('./Routes/terms'));` is setting up a route in the Express
application. When a request is made to the '/api/terms' endpoint, it will be handled by the routes
defined in the './Routes/terms' file. This allows for modularizing the routes in the application and
organizing them based on their functionality. */
app.use('/api/terms', require('./Routes/terms'));


app.get("/", (req, res) => {
    res.send("Hello World");
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});