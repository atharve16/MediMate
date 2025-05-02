import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useVideoCall } from "../../context/videoContext";
import { AuthData } from "../../context/authContext";
import { Video } from "lucide-react";

const VideoCallButton = ({ receiverId, receiverName }) => {
  const navigate = useNavigate();
  const { joinRoom } = useVideoCall();
  const { user } = AuthData();

  const startVideoCall = useCallback(() => {
    if (!user?._id || !receiverId) {
      console.error("Missing user ID or receiver ID");
      return;
    }

    // Create a unique room ID based on user IDs
    // Sort IDs to ensure both users generate the same room ID
    const ids = [user._id, receiverId].sort();
    const roomId = `${ids[0]}_${ids[1]}`;

    // Join the room with user's email/name
    const email = user?.email || user?.name || user._id;
    joinRoom({ email, room: roomId });

    // Navigate to the room
    navigate(`/room/${roomId}`);
  }, [user, receiverId, joinRoom, navigate]);

  return (
    <button
      onClick={startVideoCall}
      className="flex items-center justify-center p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      title={`Start video call with ${receiverName || "user"}`}
    >
      <Video size={20} />
    </button>
  );
};

export default VideoCallButton;
