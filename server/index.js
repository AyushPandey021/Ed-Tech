 const express=require("express");
 const app=express();
 const cors=require("cors");
 const useRoutes=require("./routes/User");
 const profileRoutes = require("./routes/Profile");
 const paymentRoutes = require("./routes/Payment");
 const courseRoutes = require("./routes/Course");
 const contactUsRoute = require("./routes/Contact");

 const database=require("./config/database");
 const cookieParser=require("cookie-parser");
 const cors=require("cors");
const {cloudinaryConnect}=require("./config/cloudinary");
const fileUpload=require("express-fileupload");
const dotenv=require("dotenv");



dotenv.config();
const PORT =process.env.PORT || 4000;

//database connect
database.connect();
//middlewars
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  const allowedOrigins = [
    "http://localhost:3000",
    "https://study-notion-rouge.vercel.app"
  ];

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))


//cloudinary connect
cloudinaryConnect();


//routes
app.use("/api/v1/auth",useRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/reach", contactUsRoute);

//def route
app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running...."
    });
});





app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

