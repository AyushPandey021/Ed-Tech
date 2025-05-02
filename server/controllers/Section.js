const Section=require('../models/Section');
const Course=require('../models/Course');

exports.createSection = async (req, res) => {
    try {
      const { sectionName, courseId } = req.body;
        console.log(req.body);
      // Validation
      if (!sectionName || !courseId) {
        return res.status(400).json({
          success: false,
          message: "Missing Properties",
        });
      }
  
      // Create section
      const newSection = await Section.create({ sectionName });
  
      // Update course with section ID
      const updatedCourseDetails = await Course.findByIdAndUpdate(
        courseId,
        {
          $push: {
            courseContent: newSection._id,
          },
        },
        { new: true }
      ).populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
  
      // Send response
      return res.status(200).json({
        success: true,
        message: "Section created successfully",
        updatedCourseDetails,
      });
    } catch (error) {
      console.error("Error in createSection:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to create section, please try again",
      });
    }
  };
  


exports.updateSection=async(req,res)=>{
    try{
         //data input
         const {sectionName,sectionId,courseId}=req.body;

         //data validation
         if (!sectionName || !courseId){
             return res.status(400).json({
                 success:true,
                 message:"Missing Poperies",
             })
         }
         //update data
         const section= await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})
           const course=await Course.findById(courseId)
            .populate({
              path:"courseContent",
              populate:{
                path:"subSection"
              },
            })
           .exec();
            
           
         //return res
         return res.status(200).json({
            success:true,
            message:'Section Update SuccessFully',
            data:course,
             
         })
    } 
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section,please try again",
        })
      }
    
}


exports.deleteSection= async(req,res)=>{
    try{
       //get id
       const {sectionId,courseId}= req.body;
       //data validation  
        if(!sectionId){
          return res.status(400).json({
              success:false,
              message:"Missing Properties sectionId not found",
          })
        }

       // use find by id delete
       await Section.findByIdAndDelete(sectionId);
        
       const course=await Course.findById(courseId)
       .populate({
         path:"courseContent",
         populate:{
           path:"subSection"
         },
       })
      .exec();
       //   return response
    return res.status(200).json({
        success:true,
        message:'Section Deleted SuccessFully',
        data:course,
     })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section,please try again",
        })
      }
}