import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVideoCall } from "../context/videoContext";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const joinedRef = useRef(false);
  
  const {
    joinRoom,
    callUser,
    acceptCall,
    declineCall,
    endCall,
    myStream,
    remoteStream,
    remoteSocketId,
    callStatus,
    incomingCall
  } = useVideoCall();
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [joinComplete, setJoinComplete] = useState(false);
  const [localJoinInProgress, setLocalJoinInProgress] = useState(false);
  
  // Toggle audio
  const toggleAudio = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };
  
  // Handle leaving the room
  const leaveRoom = () => {
    endCall();
    navigate('/');
  };

  // Ensure we join the room when component mounts
  useEffect(() => {
    if (!joinedRef.current && roomId) {
      // Get user info from localStorage (you can adjust this based on your auth implementation)
      const userInfo = localStorage.getItem('userInfo');
      let email = 'anonymous';
      
      try {
        const user = JSON.parse(userInfo);
        email = user?.email || user?.name || 'anonymous';
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
      
      setLocalJoinInProgress(true);
      joinRoom({ email, room: roomId });
      joinedRef.current = true;
      
      // Set join complete after a short delay to allow socket to connect
      setTimeout(() => {
        setJoinComplete(true);
        setLocalJoinInProgress(false);
      }, 1000);
    }
  }, [roomId, joinRoom]);
  
  // Handle incoming call or initiate call when remote user joins
  useEffect(() => {
    // Don't try to handle calls until room join is complete
    if (!joinComplete) return;
    
    if (incomingCall) {
      acceptCall();
    } else if (remoteSocketId && callStatus === "idle" && !localJoinInProgress) {
      // Small delay to ensure both sides are ready
      setTimeout(() => {
        callUser();
      }, 500);
    }
  }, [incomingCall, remoteSocketId, callStatus, acceptCall, callUser, joinComplete, localJoinInProgress]);
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Room: {roomId}
          </h1>
          <div className="text-sm font-medium text-gray-500">
            {callStatus === "connected" 
              ? "Call Connected" 
              : callStatus === "calling" 
                ? "Connecting..." 
                : remoteSocketId 
                  ? "User Joined" 
                  : "Waiting for someone to join..."}
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        {/* Video containers */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Local video */}
          <div className="relative bg-black rounded-lg overflow-hidden flex-1 min-h-[300px]">
            {myStream ? (
              <video
                className="absolute inset-0 w-full h-full object-cover mirror"
                ref={(video) => {
                  if (video && myStream) {
                    video.srcObject = myStream;
                  }
                }}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {localJoinInProgress ? "Initializing camera..." : "Camera off"}
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm py-1 px-2 rounded">
              You
            </div>
          </div>
          
          {/* Remote video */}
          <div className="relative bg-black rounded-lg overflow-hidden flex-1 min-h-[300px]">
            {remoteStream ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                ref={(video) => {
                  if (video && remoteStream) {
                    video.srcObject = remoteStream;
                  }
                }}
                autoPlay
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {remoteSocketId 
                  ? callStatus === "calling" 
                    ? "Connecting..." 
                    : "Remote camera off"
                  : "Waiting for someone to join"}
              </div>
            )}
            {remoteStream && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm py-1 px-2 rounded">
                Remote User
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Call controls */}
      <footer className="bg-white shadow-md py-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              audioEnabled ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            disabled={!myStream}
          >
            {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              videoEnabled ? "bg-gray-200 hover:bg-gray-300" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            disabled={!myStream}
          >
            {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          
          <button
            onClick={leaveRoom}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
          
          {callStatus === "idle" && remoteSocketId && !localJoinInProgress && (
            <button
              onClick={callUser}
              className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white"
              title="Start call"
            >
              <Phone size={24} />
            </button>
          )}
        </div>
      </footer>
      
      {/* Incoming call notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
            <div className="flex space-x-4">
              <button
                onClick={acceptCall}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={declineCall}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default RoomPage;