const mongoose=require("mongoose");


const ratingandReviews=new mongoose.Schema({
    user:{
        type:String,
        ref:"User",
    },
    rating:{
        type:Number,
        required:true,
        
    },
    review:{
        type:String,
        required:true,
    }
})

module.exports = mongoose.model("RatingAndReview", ratingandReviews);