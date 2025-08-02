const User = require("../models/User");
const sendOtpToEmail = require("../services/emailService");
const otpGenerator = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService =require("../services/twilioService");
const generateToken = require("../utils/generateToken");

//Step 1: Send Otp
const sendOtp=async(req,res)=>{
    const {phoneNumber,phoneSuffix,email}=req.body;
    const otp= otpGenerator();
    const expiry=new Date(Date.now()+5*60*1000);
    let user;
    try{
        if(email){
            user=await User.findOne({email});

            if(!user){
                user= new User({email});
            }
            user.emailOtp=otp;
            user.emailOtpExpiry=expiry;
            await user.save();
        await sendOtpToEmail(email,otp);
            return response(res,200,"Otp Sent to your email",{email});
        }
        if(!phoneNumber || !phoneSuffix){
            return response(res,400,"Phone number and phone Suffix are required");
        }
        const fullPhoneNumber=`${phoneSuffix}${phoneNumber}`;
        user=await User.findOne({phoneNumber});
        if(!user){
            user=new User({phoneNumber,phoneSuffix})
        }
        await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);
        await user.save();
        return response(res,200,"Otp sent sucessfully",user)
    }
    catch(error){
        console.log(error);
        return response(res,500,"Internal Server Error");
    }
}

//step 2 verify otp

const verifyOtp=async (req,res)=>{
    const{phoneNumber,phoneSuffix,email,otp}=req.body;
    try{
        let user;
        if(email){
            user=await User.findOne({email});
            if(!user){
                return response(res,404,"User Not found")
            }
            const now=new Date();
            if(!user.emailOtp || user.emailOtp !== otp || now > new Date(user.emailOtpExpiry)){
                return response(res,400,"Invalid or expired otp")
            }
            user.isVerified=true;
            user.emailOtp=null;
            user.emailOtpExpiry=null;
            await user.save();
        }else{
        if(!phoneNumber || !phoneSuffix){
            return response(res,400,"Phone number and phone Suffix are required");
        }
        const fullPhoneNumber=`${phoneSuffix}${phoneNumber}`;
        user=await User.findOne({phoneNumber});
        if(!user){
            return response(res,404,"user not found")
        }
        const result=await twilioService.verifyOtp(fullPhoneNumber,otp);
        if(result.status!=="approved"){
            return response(res,400,"invalid otp")
        }
        user.isVerified=true;
        await user.save();
        }
        const token =generateToken(user._id);
        res.cookie("auth_token",token,{
            httpOnly:true,
            maxAge:1000*60*60*24*365
        });
        return response(res,200,"otp verified successfully")
    }catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
        }
}

module.exports={
    sendOtp,verifyOtp
}