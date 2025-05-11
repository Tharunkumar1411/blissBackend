const express = require("express");
var router = express.Router();
const { getCourseDetails, addCourse, getCourseAssignments, deleteAssignment } = require("../course");

router.get("/getCourseDetails", getCourseDetails);
router.post("/addCourse", addCourse);

//assignments
router.get("/getCourseAssignments", getCourseAssignments)
router.delete("/deleteAssignment", deleteAssignment)

module.exports = router;