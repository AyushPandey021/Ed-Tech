// Import required modules and configurations
const { instance } = require("../config/razorpay");
const Razorpay = require("razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/MailSender");
const mongoose = require("mongoose");
const { courseEnrollmentEmail } = require("../Mail/Template/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../Mail/Template/PaymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");
require("dotenv").config();

// Controller to initiate a payment order
// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;

    // Validate course list
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid list of course IDs.",
      });
    }

    let total_amount = 0;
    const validCourses = [];

    // Process all courses concurrently
    await Promise.all(
      courses.map(async (course_id) => {
        const course = await Course.findById(course_id);
        if (!course) {
          throw new Error(`Course not found: ${course_id}`);
        }

        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnroled.includes(uid)) {
          throw new Error(`Student is already enrolled in course: ${course.title}`);
        }

        total_amount += course.price;
        validCourses.push(course);
      })
    );

    // Proceed with Razorpay order creation here (not included in your snippet)
        // Razorpay order creation
     options = {
      amount: total_amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        courseIds: validCourses.map((course) => course._id.toString()),
      },
    };

    const paymentResponse = await razorpayInstance.orders.create(options);
    // Example: call Razorpay API to generate the order with `total_amount`
  console.log("Payment Response from Razorpay:", paymentResponse);
    
 return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully.",
      data: {
        paymentResponse,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
        courses: validCourses.map((course) => course._id),
      },
    });

  } catch (error) {
    console.error("Error in capturePayment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during payment capture.",
    });
  }
};



// Controller to verify payment signature


exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    } = req.body;

    const userId = req.user.id;

    console.log("Received payment verification data:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      courses,
    });

    // Step 1: Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    // Step 2: Generate signature and compare
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    // Step 3: If signature is valid, enroll user in courses
    if (isValidSignature) {
      await enrollStudents(courses, userId); // Your custom logic
      return res.status(200).json({
        success: true,
        message: "Payment Verified and user enrolled successfully.",
      });
    }

    // Step 4: Invalid signature
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while verifying payment",
    });
  }
};


// Controller to send success email after payment
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  // Validate request body
  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    if (!enrolledStudent) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send payment success email
    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        (amount / 100).toFixed(2), // convert from paise to rupees, e.g. ₹499.00
        orderId,
        paymentId
      )
    );

    return res.status(200).json({
      success: true,
      message: "Payment success email sent successfully",
    });

  } catch (error) {
    console.error("Error in sending mail:", error);
    return res.status(500).json({ success: false, message: "Could not send email" });
  }
};



// Internal utility to enroll user into courses and update database
const enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    throw new Error("Please provide Course ID and User ID");
  }

  for (const courseId of courses) {
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { studentsEnroled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      throw new Error("Course not found");
    }

    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId,
      completedVideos: [],
    });

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    await mailSender(
      enrolledStudent.email,
      `Successfully Enrolled into ${enrolledCourse.courseName}`,
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
      )
    );
  }
};



// Public API to get Razorpay key
exports.getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Sample order creation (can be used for testing)
exports.getRazorpayOrder = async (req, res) => {
  try {
    const options = {
      amount,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    };
    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
