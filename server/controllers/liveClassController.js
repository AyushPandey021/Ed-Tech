const LiveClass = require("../models/LiveClass");
const { v4: uuidv4 } = require("uuid");

// Create Live Class - Instructor
exports.createLiveClass = async (req, res) => {
  try {
    const { topic, scheduledAt, course } = req.body;
    const instructorId = req.user.id; // from auth middleware

    const roomId = uuidv4();

    const liveClass = await LiveClass.create({
      instructor: instructorId,
      roomId,
      topic,
      scheduledAt,
      course,
    });

    return res.status(201).json({
      success: true,
      message: "Live class created successfully",
      data: liveClass,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error creating live class",
    });
  }
};

// Get All Upcoming Classes - For Students
exports.getUpcomingLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find({
      scheduledAt: { $gte: new Date() },
      isActive: true,
    })
      .populate("instructor", "firstName lastName email")
      .populate("course", "title");

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error fetching live classes",
    });
  }
};

// Join Live Class - Student
exports.joinLiveClass = async (req, res) => {
  try {
    const { roomId } = req.body;
    const studentId = req.user.id;

    const liveClass = await LiveClass.findOne({ roomId });

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: "Live class not found",
      });
    }

    // Avoid duplicates
    if (!liveClass.students.includes(studentId)) {
      liveClass.students.push(studentId);
      await liveClass.save();
    }

    return res.status(200).json({
      success: true,
      message: "Joined live class successfully",
      roomId: liveClass.roomId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error joining live class",
    });
  }
};
