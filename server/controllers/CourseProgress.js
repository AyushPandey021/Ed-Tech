const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

exports.updateCourseProgress = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.body;
    const userId = req.user.id;

    if (!courseId || !subsectionId) {
      return res.status(400).json({
        success: false,
        message: "courseId and subsectionId are required",
      });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(subsectionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId or subsectionId",
      });
    }

    // Validate that subsection exists
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    // Find or create course progress document
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });
    }

    // Check if already completed
    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({
        success: false,
        message: "Subsection already marked as complete",
      });
    }

    // Mark subsection as complete
    courseProgress.completedVideos.push(subsectionId);
    await courseProgress.save();

    // Calculate progress percentage
    // Populate courseContent with subsections to count total subsections
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let totalSubsections = 0;
    course.courseContent.forEach((section) => {
      totalSubsections += section.subSection.length;
    });

    const completedCount = courseProgress.completedVideos.length;
    const progressPercentage = totalSubsections
      ? Math.round((completedCount / totalSubsections) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
      progressPercentage,
    });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
