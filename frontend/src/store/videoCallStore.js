// import {create} from "zustand"
// import { subscribeWithSelector } from "zustand/middleware"

// const useVideoCallStore = create(
//     subscribeWithSelector((set,get)=>(
//         {
//             //call store
//             currentCall:null,
//             incomingCall:null,
//             isCallerActive:false,
//             callType:null,//video and audio

//             //media state
//             localStream:null,
//             remoteStream:null,
//             isVideoEnabled:true,
//             isAudioEnabled:true,

//             //webRTC
//             peerConnection:null,
//             iceCandidateQueue:[],//queue for ice candidate

//             isCallModalOpen:false,
//             callStatus:"idle",//idle,calling,ringing connecting,connected,ended

//             //Actions

//             setCurrentCall:(call)=>{
//                 set({currentCall:call})
//             },
//             setIncomingCall:(call)=>{
//                 set({incomingCall:call})
//             },
//             setCallActive:(active)=>{
//                 set({isCallActive:active})
//             },
//             setCallType:(type)=> set({callType:type}),

//             setLocalStream:(stream)=>{
//                 set({localStream:stream})
//             },

//            setRemoteStream:(stream)=>{
//                 set({remoteStream:stream})
//             },

//             setPeerConnection:(pc)=>{
//                 set({peerConnection:pc})
//             },

//             setCallModalOpen:(open)=>{
//                 set({isCallModalOpen:open})
//             },

//             setCallStatus:(status)=>{
//                 set({callStatus:status})
//             },

//             addIceCandidate:(candidate)=>{
//                 const {iceCandidateQueue}=get()
//                 set({iceCandidateQueue:[...iceCandidateQueue,candidate]})
//             },

//             processQueuedIceCandidates:async()=>{
//                 const {peerConnection,iceCandidateQueue}=get()
//                 if(peerConnection && peerConnection.remoteDescription 
//                     && iceCandidateQueue.length>0){
//                         for(const candidate of iceCandidateQueue){
//                             try {
//                                 await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
//                             } catch (error) {
//                                 console.error("ICE candidate error")
//                             }
//                         }
//                         set({iceCandidateQueue:[]})
//                     }
//             },

//             toggleVideo:()=>{
//                 const {localStream,isVideoEnabled}=get()
//                 if(localStream){
//                     const videoTrack=localStream.getVideoTracks()[0]
//                     if(videoTrack){
//                         videoTrack.enabled=!isVideoEnabled
//                         set({isVideoEnabled:!isVideoEnabled})
//                     }
//                 }
//             },
//             toggleAudio:()=>{
//                 const {localStream,isAudioEnabled}=get()
//                 if(localStream){
//                     const audioTrack=localStream.getAudioTracks()[0]
//                     if(audioTrack){
//                         audioTrack.enabled=!isAudioEnabled
//                         set({isAudioEnabled:!isAudioEnabled})
//                     }
//                 }
//             },

//             endCall:()=>{
//                 const {localStream,peerConnection}=get()

//                 if(localStream){
//                     localStream.getTracks().forEach((track)=>track.stop())
//                 }

//                 if(peerConnection){
//                     peerConnection.close()
//                 }
                
//                 set({
//             currentCall:null,
//             incomingCall:null,
//             isCallerActive:false,
//             callType:null,
//             localStream:null,
//             remoteStream:null,
//             isVideoEnabled:true,
//             isAudioEnabled:true,
//             peerConnection:null,
//             iceCandidateQueue:[],
//             isCallModalOpen:false,
//             callStatus:"idle",
//                 })

//             },
        
//         clearIncomingCall:()=>{
//                 set({incomingCall:null})
//         }

//         }
//     ))
// )

// export default useVideoCallStore
import {create} from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

const useVideoCallStore = create(
    subscribeWithSelector((set,get)=>(
        {
            //call store
            currentCall:null,
            incomingCall:null,
            isCallerActive:false,
            callType:null,//video and audio
            //media state
            localStream:null,
            remoteStream:null,
            isVideoEnabled:true,
            isAudioEnabled:true,
            //webRTC
            peerConnection:null,
            iceCandidateQueue:[],//queue for ice candidate
            isCallModalOpen:false,
            callStatus:"idle",//idle,calling,ringing connecting,connected,ended

            //Actions
            setCurrentCall:(call)=>{
                console.log("Store: Setting currentCall", call);
                set({currentCall:call})
            },
            setIncomingCall:(call)=>{
                console.log("Store: Setting incomingCall", call);
                set({incomingCall:call})
            },
            setCallActive:(active)=>{
                console.log("Store: Setting isCallActive", active);
                set({isCallActive:active})
            },
            setCallType:(type)=> {
                console.log("Store: Setting callType", type);
                set({callType:type})
            },
            setLocalStream:(stream)=>{
                console.log("Store: Setting localStream");
                set({localStream:stream})
            },
           setRemoteStream:(stream)=>{
                console.log("Store: Setting remoteStream");
                set({remoteStream:stream})
            },
            setPeerConnection:(pc)=>{
                console.log("Store: Setting peerConnection");
                set({peerConnection:pc})
            },
            setCallModalOpen:(open)=>{
                console.log("Store: Setting isCallModalOpen", open);
                set({isCallModalOpen:open})
            },
            setCallStatus:(status)=>{
                console.log("Store: Setting callStatus to", status);
                set({callStatus:status})
            },
            addIceCandidate:(candidate)=>{
                console.log("Store: Adding ICE candidate to queue");
                const {iceCandidateQueue}=get()
                set({iceCandidateQueue:[...iceCandidateQueue,candidate]})
            },
            processQueuedIceCandidates:async()=>{
                console.log("Store: Processing queued ICE candidates");
                const {peerConnection,iceCandidateQueue}=get()
                if(peerConnection && peerConnection.remoteDescription 
                    && iceCandidateQueue.length>0){
                        for(const candidate of iceCandidateQueue){
                            try {
                                console.log("Store: Adding queued ICE candidate");
                                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                            } catch (error) {
                                console.error("Store: ICE candidate error", error);
                            }
                        }
                        console.log("Store: Clearing ICE candidate queue");
                        set({iceCandidateQueue:[]})
                    }
            },
            toggleVideo:()=>{
                const {localStream,isVideoEnabled}=get()
                console.log("Store: Toggling video. Current status:", isVideoEnabled);
                if(localStream){
                    const videoTrack=localStream.getVideoTracks()[0]
                    if(videoTrack){
                        videoTrack.enabled=!isVideoEnabled
                        set({isVideoEnabled:!isVideoEnabled})
                    }
                }
            },
            toggleAudio:()=>{
                const {localStream,isAudioEnabled}=get()
                console.log("Store: Toggling audio. Current status:", isAudioEnabled);
                if(localStream){
                    const audioTrack=localStream.getAudioTracks()[0]
                    if(audioTrack){
                        audioTrack.enabled=!isAudioEnabled
                        set({isAudioEnabled:!isAudioEnabled})
                    }
                }
            },
            endCall:()=>{
                console.log("Store: Ending call. Cleaning up streams and connections.");
                const {localStream,peerConnection}=get()

                if(localStream){
                    console.log("Store: Stopping local stream tracks");
                    localStream.getTracks().forEach((track)=>track.stop())
                }

                if(peerConnection){
                    console.log("Store: Closing peer connection");
                    peerConnection.close()
                }
                
                set({
            currentCall:null,
            incomingCall:null,
            isCallerActive:false,
            callType:null,
            localStream:null,
            remoteStream:null,
            isVideoEnabled:true,
            isAudioEnabled:true,
            peerConnection:null,
            iceCandidateQueue:[],
            isCallModalOpen:false,
            callStatus:"idle",
                })
            },
        
            clearIncomingCall:()=>{
                console.log("Store: Clearing incoming call");
                set({incomingCall:null})
            }
        }
    ))
)

export default useVideoCallStore