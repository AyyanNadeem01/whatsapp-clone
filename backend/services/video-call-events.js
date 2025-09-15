// const handleVideoCallEvent=(socket,io,onlineUsers)=>{

//     //Initiate video call
//     socket.on("initiate_call",
//         ({callerId,receiverId,callType,callerInfo})=>{
//             const receiverSocketId=onlineUsers.get(receiverId)

//             if(receiverSocketId){
//                 const callId=`${callerId}-${receiverId}-${Date.now()}`

//                 io.to(receiverSocketId).emit("incoming_call",{
//                     callerId,
//                     callerName:callerInfo.username,
//                     callerAvatar:callerInfo.profilePicture,
//                     callId,
//                     callType
//                 })
//             }else{
//                 console.log(`server: Receiver ${receiverId} is offline`)
//                 socket.emit("call_failed",{reason:"user is offline"})
//             }
//         })

//         //Accept Call
//         socket.on("accept_call",
//         ({callerId,callId,receiverInfo})=>{
//             const callerSocketId=onlineUsers.get(callerId)

//             if(callerSocketId){

//                 io.to(callerSocketId).emit("call_accepted",{    
//                     callerName:receiverInfo.username,
//                     callerAvatar:receiverInfo.profilePicture,
//                     callId
//                 })
//             }else{
//                 console.log(`server: Caller ${callerId} not found`)
//             }
//         })

//         //Reject Call
//         socket.on("reject_call",
//         ({callerId,callId})=>{
//             const callerSocketId=onlineUsers.get(callerId)

//             if(callerSocketId){
//                 io.to(callerSocketId).emit("call_rejected",{    
//                     callId
//                 })
//             }
//         })

//         //end Call
//         socket.on("end_call",
//         ({callId,participantId})=>{
//             const participantSocketId=onlineUsers.get(participantId)

//             if(participantSocketId){
//                 io.to(participantSocketId).emit("call_ended",{    
//                     callId
//                 })
//             }
//         })


//         //webRTC signaling event with proper user Id
//         socket.on("webrtc_offer",({offer,receiverId,callId})=>{
//             const receiverSocketId=onlineUsers.get(receiverId)

//             if(receiverSocketId){
//                 io.to(receiverSocketId).emit("webrtc_offer",{
//                     offer,
//                     senderId:socket.userId,
//                     callId
//                 })
//             console.log(`servver offer forwarded to ${receiverId}`)
//             }else{
//                 console.log(`server: Receiver ${receiverId} not found the offer`)
//             }
//         })

//         //webrtc signaling event with proper userId
//         socket.on("webrtc_answer",({answer,receiverId,callId})=>{
//             const receiverSocketId=onlineUsers.get(receiverId)

//             if(receiverSocketId){
//                 io.to(receiverSocketId).emit("webrtc_answer",{
//                     answer,
//                     senderId:socket.userId,
//                     callId
//                 })
//              console.log(`servver answer forwarded to ${receiverId}`)
           
//             }else{
//             console.log(`server: Receiver ${receiverId} not found the answer`)
//              }
//         })


//         socket.on("webrtc_ice_candidate",({candidate,receiverId,callId})=>{
//             const receiverSocketId=onlineUsers.get(receiverId)

//             if(receiverSocketId){
//                 io.to(receiverSocketId).emit("webrtc_ice_candidate",{
//                     candidate,
//                     senderId:socket.userId,
//                     callId
//                 })
           
//             }else{
//             console.log(`server: Receiver ${receiverId} not found the ICE candidate`)
//              }
//         })

// }

// module.exports=handleVideoCallEvent
const handleVideoCallEvent=(socket,io,onlineUsers)=>{
    //Initiate video call
    socket.on("initiate_call",
        ({callerId,receiverId,callType,callerInfo})=>{
            console.log(`Server: initiate_call received from ${callerId} to ${receiverId}`);
            const receiverSocketId=onlineUsers.get(receiverId)

            if(receiverSocketId){
                const callId=`${callerId}-${receiverId}-${Date.now()}`
                console.log(`Server: Forwarding incoming_call to receiver ${receiverId} with socket ID ${receiverSocketId}`);
                io.to(receiverSocketId).emit("incoming_call",{
                    callerId,
                    callerName:callerInfo.username,
                    callerAvatar:callerInfo.profilePicture,
                    callId,
                    callType
                })
            }else{
                console.log(`Server: Receiver ${receiverId} is offline`);
                socket.emit("call_failed",{reason:"user is offline"})
            }
        })

    //Accept Call
    socket.on("accept_call",
        ({callerId,callId,receiverInfo})=>{
            console.log(`Server: accept_call received from ${receiverInfo.username} to ${callerId}`);
            const callerSocketId=onlineUsers.get(callerId)

            if(callerSocketId){
                console.log(`Server: Forwarding call_accepted to caller ${callerId} with socket ID ${callerSocketId}`);
                io.to(callerSocketId).emit("call_accepted",{   
                    callerName:receiverInfo.username,
                    callerAvatar:receiverInfo.profilePicture,
                    callId
                })
            }else{
                console.log(`Server: Caller ${callerId} not found`);
            }
        })

    //Reject Call
    socket.on("reject_call",
        ({callerId,callId})=>{
            console.log(`Server: reject_call received for call ${callId}`);
            const callerSocketId=onlineUsers.get(callerId)

            if(callerSocketId){
                console.log(`Server: Forwarding call_rejected to caller ${callerId}`);
                io.to(callerSocketId).emit("call_rejected",{   
                    callId
                })
            }
        })

    //end Call
    socket.on("end_call",
        ({callId,participantId})=>{
            console.log(`Server: end_call received for call ${callId} from ${participantId}`);
            const participantSocketId=onlineUsers.get(participantId)

            if(participantSocketId){
                console.log(`Server: Forwarding call_ended to participant ${participantId}`);
                io.to(participantSocketId).emit("call_ended",{   
                    callId
                })
            }
        })

    //webRTC signaling event with proper user Id
    socket.on("webrtc_offer",({offer,receiverId,callId})=>{
            console.log(`Server: webrtc_offer received for call ${callId} from ${socket.userId} to ${receiverId}`);
            const receiverSocketId=onlineUsers.get(receiverId)

            if(receiverSocketId){
                io.to(receiverSocketId).emit("webrtc_offer",{
                    offer,
                    senderId:socket.userId,
                    callId
                })
            console.log(`Server: offer forwarded to ${receiverId}`)
            }else{
                console.log(`Server: Receiver ${receiverId} not found for the offer`)
            }
        })

    //webrtc signaling event with proper userId
    socket.on("webrtc_answer",({answer,receiverId,callId})=>{
            console.log(`Server: webrtc_answer received for call ${callId} from ${socket.userId} to ${receiverId}`);
            const receiverSocketId=onlineUsers.get(receiverId)

            if(receiverSocketId){
                io.to(receiverSocketId).emit("webrtc_answer",{
                    answer,
                    senderId:socket.userId,
                    callId
                })
             console.log(`Server: answer forwarded to ${receiverId}`)
            }else{
            console.log(`Server: Receiver ${receiverId} not found for the answer`)
             }
        })

    socket.on("webrtc_ice_candidate",({candidate,receiverId,callId})=>{
            console.log(`Server: webrtc_ice_candidate received for call ${callId} from ${socket.userId} to ${receiverId}`);
            const receiverSocketId=onlineUsers.get(receiverId)

            if(receiverSocketId){
                io.to(receiverSocketId).emit("webrtc_ice_candidate",{
                    candidate,
                    senderId:socket.userId,
                    callId
                })
            }else{
            console.log(`Server: Receiver ${receiverId} not found for the ICE candidate`)
             }
        })
}

module.exports=handleVideoCallEvent