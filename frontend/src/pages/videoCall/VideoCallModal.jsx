import React, { useEffect, useMemo, useRef } from 'react'
import useVideoCallStore from '../../store/videoCallStore'
import useUserStore from '../../store/useUserStore'
import useThemeStore from '../../store/themeStore'

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

    return (
    <div>
      
    </div>
  )
}

export default VideoCallModal
