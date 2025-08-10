require("dotenv").config();
const twilio =require("twilio");
//YKYW29JDHDH6RXK7H5B4GXLR
const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;
const serviceSid=process.env.TWILIO_SERVICE_SID;

const client = twilio (accountSid,authToken);

const sendOtpToPhoneNumber =async(phoneNumber)=>{
    try{
        console.log("Sending OTP to this number",phoneNumber);
        if(!phoneNumber){
            throw new Error("phone number is required");
        }
        const response = await client.verify.v2.services(serviceSid).verifications.create({
            to:phoneNumber,
            channel:"sms"
        });
        console.log("this is my otp response",response);
        return response;
    }catch(error){
        console.error(error);
        throw new Error("Failed to send otp")
    }
}

const verifyOtp =async(phoneNumber,otp)=>{
    try{
        console.log("this is my otp",otp);
        console.log("this number",phoneNumber);
        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to:phoneNumber,
            code:otp
        });
        console.log("this is my otp response",response);
        return response;
    }catch(error){
        console.error(error);
        throw new Error("otp verification failed")
    }
}

module.exports={
    sendOtpToPhoneNumber,
    verifyOtp
}