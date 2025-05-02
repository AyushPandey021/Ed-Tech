const express=require('express');
const router=express.Router();
const {auth,isInstructor}=require('../middleware/Auth');

const {
    deleteAccount,
    updateProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard,
    
  } = require('../controllers/Profile');


  router.delete("/deleteProfile", auth, deleteAccount);
  router.put("/updateProfile", auth, updateProfile);
  router.get("/getUserDetails", auth, getAllUserDetails);
  router.get("/getEnrolledCourses", auth, getEnrolledCourses);
 router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);
 router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports=router;