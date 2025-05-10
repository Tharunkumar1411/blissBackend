const express = require("express");
var router = express.Router();
const { getCourseDetails } = require("../course");

router.get("/getCourseDetails", getCourseDetails);

module.exports = router;