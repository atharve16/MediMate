import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVideoCall } from "../context/videoContext";
import { AuthData } from "../context/authContext";

const LobbyScreen = () => {
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const { joinRoom, initLocalStream, myStream } = useVideoCall();
  const { user } = AuthData();
  const navigate = useNavigate();

  // Initialize camera access when component mounts
  useEffect(() => {
    if (!myStream) {
      initLocalStream()
        .then(stream => {
          if (stream) {
            setCameraReady(true);
          }
        })
        .catch(err => {
          console.error("Failed to initialize camera:", err);
        });
    } else {
      setCameraReady(true);
    }
  }, [initLocalStream, myStream]);

  const handleSubmitForm = useCallback(
    async (e) => {
      e.preventDefault();
      
      if (!room.trim()) {
        alert("Please enter a room number");
        return;
      }
      
      setLoading(true);
      
      // Make sure camera is initialized first
      if (!myStream && !cameraReady) {
        try {
          await initLocalStream();
        } catch (err) {
          console.error("Failed to initialize camera before joining room:", err);
          // Continue anyway - user might not have a camera
        }
      }
      
      // Use user's email or name as identifier
      const email = user?.email || user?.name || "anonymous";
      
      // Save user info to localStorage for later use
      const userInfo = JSON.stringify({
        email: user?.email || "anonymous",
        name: user?.name || "anonymous",
        id: user?._id || "anonymous"
      });
      localStorage.setItem('userInfo', userInfo);
      
      // Join the room
      joinRoom({ email, room });
      
      // Navigate to the room page with a delay to allow socket connection
      setTimeout(() => {
        navigate(`/room/${room}`);
        setLoading(false);
      }, 1000);
    },
    [room, user, joinRoom, navigate, initLocalStream, myStream, cameraReady]
  );

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Start Video Call</h1>
      
      {/* Camera preview */}
      <div className="mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {myStream ? (
            <video
              className="absolute inset-0 w-full h-full object-cover mirror"
              ref={(video) => {
                if (video && myStream) video.srcObject = myStream;
              }}
              autoPlay
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              {loading ? "Initializing camera..." : "Camera preview will appear here"}
            </div>
          )}
        </div>
        {myStream && (
          <p className="mt-1 text-xs text-center text-green-600">
            Camera ready ✓
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmitForm} className="space-y-4">
        <div>
          <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
            Room Number
          </label>
          <input
            type="text"
            id="room"
            placeholder="Enter a unique room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Share this room number with the person you want to call
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 ${
              loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? "Connecting..." : "Join Room"}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Enter a unique room number and share it with your contact</p>
        <p>Both of you need to join the same room to connect</p>
      </div>
      
      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default LobbyScreen;