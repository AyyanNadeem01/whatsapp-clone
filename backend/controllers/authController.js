const User = require("../models/User");
const sendOtpToEmail = require("../services/emailService");
const otpGenerator = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService =require("../services/twilioService");
const generateToken = require("../utils/generateToken");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
//Step 1: Send Otp
const sendOtp=async(req,res)=>{
     console.log("Request received for sendOtp from front end!");
    console.log("Request body:", req.body);
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
            if(!user.emailOtp || user.emailOtp != otp || now > new Date(user.emailOtpExpiry)){
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
        return response(res,200,"otp verified successfully",{user})
    }catch(error){
        console.error(error);
        return response(res,500,"Internal server error");
        }
}
const updateProfile = async (req, res) => {
    const { username, agreed, about } = req.body;
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId);
        if (!user) return response(res, 404, "User not found");

        const file = req.file;

        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            user.profilePicture = uploadResult?.secure_url;
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        if (username) user.username = username;
        if (agreed) user.agreed = agreed;
        if (about) user.about = about;

        await user.save();
        return response(res, 200, "User profile updated successfully", user);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};


const logout = (req, res) => {
    try {
        res.cookie("auth_token", "", { expires: new Date(0), httpOnly: true });
        return response(res, 200, "User logged out successfully");
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};
const checkAuthenticate = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return response(res, 401, "User unauthorized! Please login before accessing the app.");
        }

        const user = await User.findById(userId);
        if (!user) {
            return response(res, 404, "User not found.");
        }

        return response(res, 200, "User authenticated. Access granted to WhatsApp.", user);
    } catch (error) {
        console.log(error);
        return response(res, 500, "Internal server error.");
    }
}

const getAllUsers = async (req, res) => {
    const loggedInUser = req.user.userId;

    try {
        const users = await User.find({ _id: { $ne: loggedInUser } })
            .select("username profilePicture lastSeen isOnline about phoneNumber phoneSuffix")
            .lean();

        const usersWithConversation = await Promise.all(
            users.map(async (user) => {
                const convo = await Conversation.findOne({
                    participants: { $all: [loggedInUser, user._id] }
                })
                .populate({
                    path: "lastMessage",
                    select: "content createdAt sender receiver"
                })
                .lean();

                return {
                    ...user,
                    conversation: convo || null
                };
            })
        );

        return response(res, 200, "Users retrieved successfully", usersWithConversation);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};
module.exports={
    sendOtp,verifyOtp,updateProfile,logout,checkAuthenticate,getAllUsers
}