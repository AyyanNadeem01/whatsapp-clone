//src/pages/videoCall/VideoCallModal
import React, { useEffect, useMemo, useRef } from "react";
import useVideoCallStore from "../../store/videoCallStore";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/themeStore";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaTimes,
  FaVideo,
} from "react-icons/fa";

const VideoCallModal = ({ socket }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    currentCall,
    callType,
    incomingCall,
    isCallActive,
    localStream,
    remoteStream,
    isVideoEnabled,
    peerConnection,
    setIncomingCall,
    isAudioEnabled,
    setCurrentCall,
    setCallModalOpen,
    endCall,
    setCallStatus,
    setCallActive,
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    isCallModalOpen,
    callStatus,
    addIceCandidate,
    processQueuedIceCandidates,
    toggleVideo,
    toggleAudio,
    clearIncomingCall,
  } = useVideoCallStore();

  const { user } = useUserStore();
  const { theme } = useThemeStore();

//   const rtcConfiguration = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       { urls: "stun:stun1.l.google.com:19302" },
//       { urls: "stun:stun2.l.google.com:19302" },
//     ],
//   };
const rtcConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:relay1.expressturn.com:3478", username: "efY...", credential: "abc..." }
  ]
};

  // user display info
  const displayInfo = useMemo(() => {
    if (incomingCall && !isCallActive) {
      return {
        name: incomingCall.callerName,
        avatar: incomingCall.callerAvatar,
      };
    } else if (currentCall) {
      return {
        name: currentCall.participantName,
        avatar: currentCall.participantAvatar,
      };
    }
  }, [incomingCall, currentCall, isCallActive]);

  useEffect(() => {
    if (peerConnection && remoteStream) {
      console.log("Peer connection and remote stream set.");
      setCallStatus("connected");
      setCallActive(true);
    }
  }, [peerConnection, remoteStream, setCallStatus, setCallActive]);

  // setup local/remote video elements
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // cleanup before opening mic/camera
  const stopStream = (stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // initialize local media
  const initializeMedia = async (video = true) => {
    try {
      if (localStream) stopStream(localStream);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: true,
      });
      console.log("local media stream", stream.getTracks());
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("media error:", error);
      throw error;
    }
  };

  // create peer connection
  const createPeerConnection = (stream, role) => {
    const pc = new RTCPeerConnection(rtcConfiguration);

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log(`${role} adding ${track.kind}`, track.id.slice(0, 8));
        pc.addTrack(track, stream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const participantId =
          currentCall?.participantId || incomingCall?.callerId;
        const callId = currentCall?.callId || incomingCall?.callId;

        if (participantId && callId) {
          socket.emit("webrtc_ice_candidate", {
            candidate: event.candidate,
            receiverId: participantId,
            callId: callId,
          });
        }
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const stream = new MediaStream([event.track]);
        setRemoteStream(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`${role}: connection state`, pc.connectionState);
      if (pc.connectionState === "failed") {
        setCallStatus("failed");
        setTimeout(handleEndCall, 2000);
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  // caller flow (only once)
  const initializeCallerCall = async () => {
    try {
      setCallStatus("calling");

      const stream = await initializeMedia(callType === "video");
      const pc = createPeerConnection(stream, "CALLER");

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === "video",
      });

      await pc.setLocalDescription(offer);

      socket.emit("webrtc_offer", {
        offer,
        receiverId: currentCall?.participantId,
        callId: currentCall?.callId,
      });
    } catch (error) {
      console.error("caller error", error);
      setCallStatus("failed");
      setTimeout(handleEndCall, 2000);
    }
  };

  // receiver flow
  const handleAnswerCall = async () => {
    try {
      setCallStatus("connecting");
      const stream = await initializeMedia(callType === "video");
      createPeerConnection(stream, "RECEIVER");

      socket.emit("accept_call", {
        callerId: incomingCall?.callerId,
        callId: incomingCall?.callId,
        receiverInfo: {
          username: user?.username,
          profilePicture: user?.profilePicture,
        },
      });

      setCurrentCall({
        callId: incomingCall?.callId,
        participantId: incomingCall?.callerId,
        participantName: incomingCall?.callerName,
        participantAvatar: incomingCall?.callerAvatar,
      });
      clearIncomingCall();
    } catch (error) {
      console.error("Receiver Error", error);
      handleEndCall();
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socket.emit("reject_call", {
        callerId: incomingCall?.callerId,
        callId: incomingCall?.callId,
      });
    }
    endCall();
  };

  const handleEndCall = () => {
    const participantId = currentCall?.participantId || incomingCall?.callerId;
    const callId = currentCall?.callId || incomingCall?.callId;

    if (participantId && callId) {
      socket.emit("end_call", {
        callId,
        participantId,
      });
    }
    endCall();
  };

  // socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = () => {
      console.log("Call accepted by receiver");
      setCallStatus("connecting");
      initializeCallerCall()
    };

    const handleCallRejected = () => {
      setCallStatus("rejected");
      setTimeout(endCall, 2000);
    };

    const handleCallEnded = () => {
      endCall();
    };

    const handleWebRTCOffer = async ({ offer, senderId, callId }) => {
      if (!peerConnection) return;

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        await processQueuedIceCandidates();

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("webrtc_answer", {
          answer,
          receiverId: senderId,
          callId,
        });

        console.log("Receiver: Answer sent, waiting for ICE candidates.");
      } catch (error) {
        console.error("Receiver offer error", error);
      }
    };

    const handleWebRTCAnswer = async ({ answer }) => {
      if (!peerConnection) return;
      if (peerConnection.signalingState === "closed") {
        console.log("Caller: Peer connection is closed");
        return;
      }

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        await processQueuedIceCandidates();

        console.log("Caller: Remote answer set");
      } catch (error) {
        console.error("Caller answer error", error);
      }
    };

    const handleWebRTCCandidates = async ({ candidate }) => {
      if (peerConnection && peerConnection.signalingState !== "closed") {
        if (peerConnection.remoteDescription) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("ICE candidate added");
          } catch (error) {
            console.log("ICE candidate error", error);
          }
        } else {
          console.log("queueing ice candidate");
          addIceCandidate(candidate);
        }
      }
    };

    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("webrtc_offer", handleWebRTCOffer);
    socket.on("webrtc_answer", handleWebRTCAnswer);
    socket.on("webrtc_ice_candidate", handleWebRTCCandidates);

    console.log("socket listeners registered");
    return () => {
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("webrtc_offer", handleWebRTCOffer);
      socket.off("webrtc_answer", handleWebRTCAnswer);
      socket.off("webrtc_ice_candidate", handleWebRTCCandidates);
    };
  }, [socket, peerConnection, currentCall, incomingCall, user]);

  if (!isCallModalOpen && !incomingCall) return null;

  const shouldShowActiveCall =
    isCallActive || callStatus === "calling" || callStatus === "connecting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div
        className={`relative w-full h-full max-w-4xl max-h-3xl rounded-lg overflow-hidden ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Incoming call */}
        {incomingCall && !isCallActive && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                <img
                  src={displayInfo?.avatar}
                  alt={displayInfo?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {displayInfo?.name}
              </h2>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Incoming {callType} call...
              </p>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={handleRejectCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FaPhoneSlash className="w-6 h-6" />
              </button>
              <button
                onClick={handleAnswerCall}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FaVideo className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Active call */}
        {shouldShowActiveCall && (
          <div className="relative w-full h-full">
            {callType === "video" && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover bg-gray-800 ${
                  remoteStream ? "block" : "hidden"
                }`}
              />
            )}

            {/* Avatar/status */}
            {(!remoteStream || callType !== "video") && (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={displayInfo?.avatar}
                      alt={displayInfo?.name}
                    />
                  </div>
                  <p className="text-white text-xl">
                    {callStatus === "calling"
                      ? `Calling ${displayInfo?.name}...`
                      : callStatus === "connecting"
                      ? "Connecting..."
                      : callStatus === "connected"
                      ? displayInfo?.name
                      : callStatus === "failed"
                      ? "Connection failed"
                      : displayInfo?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Local video */}
            {callType === "video" && localStream && (
              <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Call status */}
            <div className="absolute top-4 left-4">
              <div
                className={`px-4 py-2 rounded-full ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } bg-opacity-75`}
              >
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {callStatus === "connected" ? "Connected" : callStatus}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-4">
                {callType === "video" && (
                  <button
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isVideoEnabled
                        ? "bg-gray-600 hover:bg-gray-200 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {isVideoEnabled ? <FaVideo /> : <FaVideo />}
                  </button>
                )}
                <button
                  onClick={toggleAudio}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isAudioEnabled
                      ? "bg-gray-600 hover:bg-gray-200 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <FaPhoneSlash className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {callStatus === "calling" && (
          <button
            onClick={handleEndCall}
            className="absolute top-4 right-4 w-16 h-16 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
