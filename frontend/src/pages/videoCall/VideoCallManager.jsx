// import React, { useEffect,useCallback } from 'react'
// import useVideoCallStore from '../../store/videoCallStore'
// import useUserStore from '../../store/useUserStore'
// import VideoCallModal from "./VideoCallModal"
// const VideoCallManager = ({socket}) => {
//   const {setIncomingCall,setCurrentCall,setCallType,
//     setCallModalOpen,endCall,setCallStatus
//   }=useVideoCallStore()
  
//   const {user}=useUserStore()

//   useEffect(()=>{
//     if(!socket) return;

//     //handle incoming call
//     const handleIncomingCall=({callerId,callerName,callerAvatar,
//         callType,callId
//     })=>{
//         setIncomingCall({
//             callerId,
//             callerName,
//             callerAvatar,
//             callId
//         })
//         setCallType(callType)
//         setCallModalOpen(true)
//         setCallStatus("ringing")
//     }

//     const handleCallEnded=({reason})=>{
//         setCallStatus("failed")
//         setTimeout(()=>{
//             endCall()
//         },2000)
//     }

//     socket.on("incoming_call",handleIncomingCall)
//     socket.on("call_failed",handleCallEnded)
    
//     return ()=>{
//         socket.off("incoming_call",handleIncomingCall)
//         socket.off("call_failed",handleCallEnded)
//     }
//   },[socket,setIncomingCall,setCallType,setCallModalOpen,setCallStatus,endCall])
//   //memozed function to initial call
//   const initiateCall=useCallback((receiverId,receiverName,receiverAvatar,callType="video")=>{
//     const callId=`${user?._id}-${receiverId}-${Date.now()}`

//     const callData={
//         callId,
//         participantId:receiverId,
//         participantName:receiverName,
//         participantAvatar:receiverAvatar
//     }
//     setCurrentCall(callData)
//     setCallType(callType)
//     setCallModalOpen(true)
//     setCallStatus("calling")

//     socket.emit("initiate_call",{
//         callerId:user?._id,
//         receiverId,
//         callType,
//         callerInfo:{
//             username:user.username,
//             profilePicture:user.profilePicture
//         }
//     })

//   },[user,socket,setCurrentCall,setCallType,setCallModalOpen,setCallStatus])
  
//   useEffect(()=>{
//     useVideoCallStore.getState().initiateCall=initiateCall
//   },[initiateCall])


//   return (
//     <VideoCallModal socket={socket}/>
//   )

// }
// export default VideoCallManager
import React, { useEffect,useCallback } from 'react'
import useVideoCallStore from '../../store/videoCallStore'
import useUserStore from '../../store/useUserStore'
import VideoCallModal from "./VideoCallModal"

const VideoCallManager = ({socket}) => {
  const {setIncomingCall,setCurrentCall,setCallType,
    setCallModalOpen,endCall,setCallStatus
  }=useVideoCallStore()
  
  const {user}=useUserStore()

  useEffect(()=>{
    if(!socket) {
      console.log("Manager: Socket is not available, cannot register listeners.");
      return;
    }

    //handle incoming call
    const handleIncomingCall=({callerId,callerName,callerAvatar,
        callType,callId
    })=>{
        console.log("Manager: incoming_call event received.");
        setIncomingCall({
            callerId,
            callerName,
            callerAvatar,
            callId
        })
        setCallType(callType)
        setCallModalOpen(true)
        setCallStatus("ringing")
    }

    const handleCallEnded=({reason})=>{
        console.log(`Manager: call_failed event received. Reason: ${reason}`);
        setCallStatus("failed")
        setTimeout(()=>{
            endCall()
        },2000)
    }

    socket.on("incoming_call",handleIncomingCall)
    socket.on("call_failed",handleCallEnded)
    
    console.log("Manager: Socket listeners for incoming_call and call_failed registered.");
    return ()=>{
        socket.off("incoming_call",handleIncomingCall)
        socket.off("call_failed",handleCallEnded)
        console.log("Manager: Socket listeners for incoming_call and call_failed unregistered.");
    }
  },[socket,setIncomingCall,setCallType,setCallModalOpen,setCallStatus,endCall])
  
  //memozed function to initial call
  const initiateCall=useCallback((receiverId,receiverName,receiverAvatar,callType="video")=>{
    console.log("Manager: initiateCall function called.");
    const callId=`${user?._id}-${receiverId}-${Date.now()}`

    const callData={
        callId,
        participantId:receiverId,
        participantName:receiverName,
        participantAvatar:receiverAvatar
    }
    setCurrentCall(callData)
    setCallType(callType)
    setCallModalOpen(true)
    setCallStatus("calling")

    socket.emit("initiate_call",{
        callerId:user?._id,
        receiverId,
        callType,
        callerInfo:{
            username:user.username,
            profilePicture:user.profilePicture
        }
    })
    console.log("Manager: initiate_call event emitted to server.");
  },[user,socket,setCurrentCall,setCallType,setCallModalOpen,setCallStatus])
  
  useEffect(()=>{
    useVideoCallStore.getState().initiateCall=initiateCall
  },[initiateCall])

  return (
    <VideoCallModal socket={socket}/>
  )
}
export default VideoCallManager