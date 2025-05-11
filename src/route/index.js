const express = require("express");
var router = express.Router();
const { getCourseDetails, addCourse, getCourseAssignments } = require("../course");

router.get("/getCourseDetails", getCourseDetails);
router.post("/addCourse", addCourse);

//assignments
router.get("/getCourseAssignments", getCourseAssignments)


module.exports = router;