import React, { useState, useEffect, useMemo, useRef } from 'react'
import useVideoCallStore from '../../store/videoCallStore'
import useUserStore from '../../store/useUserStore'
import useThemeStore from '../../store/themeStore'
import { FaPhoneSlash } from 'react-icons/fa'
const VideoCallModal = ({socket}) => {
    const localVideoRef=useRef(null)
    const remoteVideoRef=useRef(null)

    const{
        currentCall,
        callType,
        incomingCall,
        isCallActive,
        localStream,
        remoteStream,
        isVideoEnabled,
        peerConnection,
        iceCandidateQueue,
        setIncomingCall,
        isAudioEnabled,
        setCurrentCall,
        setCallType,
        setCallModalType,
        endCall,
        setCallStatus,
        setCallActive,
        setLocalStream, SetRemoteStream,
        setPeerConnection,
        isCallModelOpen,
        callStatus,
        addIceCandidate,
        processQueuedCandidates,
        toggleVideo,
        toggleAudio,
        clearIncomingCall
    }=useVideoCallStore()

    const {user}=useUserStore()
    const {theme}=useThemeStore()

    const rtcConfiguration={
        iceServers:[
            {
                urls:"stun:stun.l.google.com:19302"
            },
            {
                urls:"stun:stun1.l.google.com:19302"
            },
            {
                urls:"stun:stun2.l.google.com:19302"
            }
        ]
    }

    //memorize display the user info and it is proved the unneccesary re-render
    const displayInfo=useMemo(()=>{
        if(incomingCall && !isCallActive){
            return {
                name:incomingCall.callerName,
                avatar:incomingCall.callerAvatar,

            }
        }else if(currentCall){
            return {
                name:currentCall.participantName,
                avatar:currentCall.participantAvatar
            }
        }
    },[incomingCall,currentCall,isCallActive])

    useEffect(()=>{
        if(peerConnection && remoteStream){
            console.log("both peer connection and remote stream")
            setCallStatus("connected")
            setCallActive(true)
        }
    },[peerConnection,remoteStream,setCallStatus,setCallActive])
  
  
    //set up local stream when local stream change
    useEffect(()=>{
        if(localStream && localVideoRef.current){
            localVideoRef.current.srcObject=localStream;
        }
    },[localStream])

    //set up remote video stream when remote stream changes
    useEffect(()=>{
        if(remoteStream && remoteVideoRef.current){
            remoteVideoRef.current.srcObject=remoteStream
        }
    },[remoteStream])


    //initialize media stream
    const initializeMedia=async (video=true)=>{
        try {
            const stream=await navigator.mediaDevices.getUserMedia({
                video:video?{width:640,height:480}:false,
                audio:true,
            }) 
            console.log("local media stream",stream.getTracks())
            setLocalStream(stream)
        } catch (error) {
            console.error("media error:",error)
            throw error
        }
    }

    //create peer connection
    const createPeerConnection=(stream,role)=>{
        const pc=new RTCPeerConnection(rtcConfiguration)

        //add local tracks immediately
        if(stream){
            stream.getTracks().forEach((track)=>{
                console.log(`${role} adding ${track.kind}`,track.id.slice(0,8))
                pc.addTrack(track,stream)
            })
        }

    //handle ice candidate
    pc.onicecandidate=(event)=>{
        if(event.candidate && socket){
            const participantId=currentCall?.participantId|| incomingCall?.callerId;
            const callId=currentCall?.callId||incomingCall?.callId

            if(participantId && callId){
                socket.emit("webrtc_ice_candidate",{
                    candidate:event.candidate,
                    receiverId:participantId,
                    callId:callId
                })
            }
        }
    }


    //handle remote stream
    pc.ontrack=(event)=>{
        if(event.streams && event.streams[0]){
            SetRemoteStream(event.streams[0])
        }else{
            const stream=new MediaStream([event.track])
            SetRemoteStream(stream)
        }
    }


    pc.onconnectionstatechange=()=>{
        console.log(`role: ${role} : connection state`,pc.connectionState)
        if(pc.connectionState==="failed"){
            setCallStatus("failed")
            setTimeout(handleEndCall,2000)
        }
    }

    pc.onconnectionstatechange=()=>{
        console.log(`${role}: ICE state`,pc.iceConnectionState)
    }

    pc.onsignalingstatechange=()=>{
        console.log(`${role}: Signalling state`,pc.signalingState)
    }

    setPeerConnection(pc)
    return pc
}

//caller : initialize call after acceptance
    const initializCallerCall=async()=>{
        try {
            setCallStatus("connecting")
            
            //get media
            const stream=await initializeMedia(callType==="video")
            
            //create peer connection with offer
            const pc=createPeerConnection(stream,"CALLER")

            const offer=await pc.createOffet({
                offerToReceiveAudio:true,
                offerToReceiveVideo:callType==="video"
            })

            await pc.setLocalDescription(offer)

            socket.emit("website_offer",{
                offer,
                receiverId:currentCall?.participantId,
                callId:currentCall?.callId
            })
        } catch (error) {
            console.error("caller error",error)
            setCallStatus("failed")
            setTimeout(handleEndCall,2000)
        }
    }

    //Receiver : Answer Call
    const handleAnswerCall=async()=>{
        try {
         setCallStatus("connecting")    
            //get media
            const stream=await initializeMedia(callType==="video")
            createPeerConnection(stream,"RECEIVER")

            socket.emit("accept_call",{
                callerId:incomingCall?.callerId,
                callId:incomingCall?.callId,
                receiverInfo:{
                    username:user?.username,
                    profilePicture:user?.profilePicture
                }
            })

            setCurrentCall({
                callId:incomingCall?.callId,
                participantId:incomingCall?.callerId,
                participantName:incomingCall?.callerName,
                participantAvatar:incomingCall?.callerAvatar
            })
            clearIncomingCall()
        } catch (error) {
            console.error("Receiver Error",error)
            handleEndCall()
        }
    }

    const handleRejectCall=()=>{
        if(incomingCall){
            socket.emit("reject_call",{
                callerId:incomingCall?.callerId,
                callId:incomingCall?.callId
            })
        }
        endCall()
    }

    const handleEndCall=()=>{
        const participantId=currentCall?.participantId|| incomingCall?.callerId;
        const callId=currentCall?.callId||incomingCall?.callId

        if(participantId && callId){
            socket.emit("end_call",{
                callId:callId,
                participantId:participantId
            })
        }
        endCall()
    }


    //socket event listeners
    useEffect(()=>{
        if(socket) return;

        //call accepted start caller flow
        const handleCallAccepted=({receiverName})=>{
            if(currentCall){
                setTimeout(()=>{
                    initializCallerCall()
                },500)
            }
        }

        const handleCallRejected=()=>{
            setCallStatus("rejected")
            setTimeout(endCall,2000)
        }

        const handleCallEnded=()=>{
            endCall()
        }

        const handleWebRTCOffer=async({offer,senderId,callId})=>{
            if(!peerConnection) return;

            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                //process queued ICE candidate
                await processQueuedCandidates()


                //create answer
                const answer=await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answer)

                socket.emit("webrtc_answer",{
                    answer,
                    receiverId:senderId,
                    callId
                })

                console.log("Receiver: Answer send waiting for ice candidates")

            } catch (error) {
                console.error("Receiver offer error",error)
            }
        }

        //Receiver answer (Caller)
        const handleWebRTCAnswer=async({answer,senderId,callId})=>{
                if(!peerConnection) return;
                if(peerConnection.signalingState==="closed"){
                    console.log("Caller: Peer connection is closed")
                    return;
                }   
                
        try {
            //current caller signing
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
            
            //processQueued the ICE Candidates
            await processQueuedCandidates()

            const receivers=peerConnection.getReceuvers()
            console.log("Receivers".receivers)

        } catch (error) {
            console.error("Caller answer error",error)
        }
        }

        //receiver ice candidate
        const handleWebRTCCandidates=async({candidate,senderId})=>{
            if(peerConnection && peerConnection.signalingState!=="closed"){
                if(peerConnection.remoteDescription){
                    try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                        console.log("ICE candidate added")
                    } catch (error) {
                        console.log("ICE candidate error",error)
                    }
                }else{
                    console.log("queueing ice candidate")
                    addIceCandidate(candidate)
                }
            }
        }

        //request all events listeners
        socket.on("call_accepted",handleCallAccepted)
        socket.on("call_rejected",handleCallRejected)
        socket.on("call_ended",handleCallEnded)
        socket.on("webrtc_offer",handleWebRTCOffer)
        socket.on("webrtc_answer",handleWebRTCAnswer)
        socket.on("webrtc_ice_candidate",handleWebRTCCandidates)

        console.log("socket listeners registers")
        return ()=>{
        socket.off("call_accepted",handleCallAccepted)
        socket.off("call_rejected",handleCallRejected)
        socket.off("call_ended",handleCallEnded)
        socket.off("webrtc_offer",handleWebRTCOffer)
        socket.off("webrtc_answer",handleWebRTCAnswer)
        socket.off("webrtc_ice_candidate",handleWebRTCCandidates)
        }
    },[socket,peerConnection,currentCall,incomingCall,user])

    if(!isCallModelOpen && !incomingCall) return null;

    const shouldShowActiveCall=isCallActive||callStatus==="calling"||callStatus==="connecting"
    
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
    bg-black bg-opacity-75">
      <div className={`relative w-full h-full max-w-4xl max-h-3xl rounded-lg
        overflow-hidden ${theme==="dark"?"bg-gray-900":"bg-white"}`}>
            {/* incoming call ui */}
            {incomingCall && !isCallActive && (
                <div className='flex flex-col items-center justify-center
                 h-full p-8'>
                    <div className='text-center mb-8'>
                        <div className='w-32 h-32 rounded-full
                         bg-gray-300 mx-auto mb-4 overflow-hidden'>
                            <img src={displayInfo?.avatar} 
                            alt={displayInfo?.name} 
                            className='w-full h-full object-cover'/>
                        </div>
                        <h2 
                        className={`text-2xl font-semibold mb-2 ${theme==="dark"?
                            "text-white":"text-gray-900"
                        }`}>
                            {displayInfo?.name}
                        </h2>
                        <p className={`text-lg ${theme==="dark"?"text-gray-300":"text-gray-600"}`}>
                            Incoming {callType} call...
                        </p>
                    </div>
                    <div className='flex space-x-6'>
                        <button>
                            <FaPhoneSlash/>
                        </button>
                    </div>
                </div>
            )}
   
      </div>
    </div>
  )
}

export default VideoCallModal
