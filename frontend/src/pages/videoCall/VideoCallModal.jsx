import React, { useEffect, useMemo, useRef } from 'react'
import useVideoCallStore from '../../store/videoCallStore'
import useUserStore from '../../store/useUserStore'
import useThemeStore from '../../store/themeStore'

const VideoCallModal = ({socket}) => {
    const localVideoRef=useRef(null)
    const remoteVideoRef=useRef(null)

    const{
        currentCall,
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
  return (
    <div>
      
    </div>
  )
}

export default VideoCallModal
