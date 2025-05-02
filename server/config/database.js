const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }).then(()=>console.log("DB connection succesfull"))
    .catch((err)=>{
        console.log("DB coonection faild");
        console.log(err);
        process.exit(1);
    })
}