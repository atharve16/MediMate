import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { AuthData } from "./authContext";
import { io } from "socket.io-client";

const ChatContext = createContext();
const SERVER = "http://localhost:8080/api";

export const ChatProvider = ({ children }) => {
  const { user, isAuth } = AuthData();
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [currentChat, setCurrentChat] = useState({});

  // Initialize socket connection
  useEffect(() => {
    if (!isAuth || !user?._id) {
      console.log("Not connecting socket - user not authenticated");
      return;
    }

    console.log("Initializing socket connection");
    try {
      const newSocket = io("http://localhost:8080", {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        newSocket.emit("add-user", user._id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(`Socket connection error: ${err.message}`);
      });

      setSocket(newSocket);

      return () => {
        console.log("Disconnecting socket");
        if (newSocket) newSocket.disconnect();
      };
    } catch (err) {
      console.error("Error setting up socket:", err);
      setError(`Socket setup error: ${err.message}`);
    }
  }, [isAuth, user]);

  const getConversations = async () => {
    if (!isAuth || !user?._id) {
      console.log("Not fetching conversations - user not authenticated");
      return;
    }

    console.log("Fetching conversations for user:", user._id);
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const { data } = await axios.get(`${SERVER}/conversations/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Conversations loaded:", data);
      setConversations(data);
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error loading conversations:", errorMsg);
      setError(`Failed to load conversations: ${errorMsg}`);
      toast.error("Failed to load conversations");
      setLoading(false);
    }
  };

  useEffect(() => {
    getConversations();
  }, [user, isAuth]);

  // start a conversation
  const startNewConversation = async (receiverId) => {
    if (!isAuth || !user?._id) {
      console.log("Cannot start conversation - not authenticated");
      return;
    }

    console.log("Starting new conversation with user:", receiverId);
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const { data } = await axios.post(
        `${SERVER}/conversations`,
        { senderId: user._id, receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Conversation created:", data);
      setConversations((prev) => [...prev, data]);
      setCurrentChat(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error creating conversation:", errorMsg);
      setError(`Failed to create conversation: ${errorMsg}`);
      toast.error("Failed to create conversation");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChat || !socket || !isAuth || !user?._id) {
      console.log("Cannot send message - validation failed", {
        messageValid: Boolean(message.trim()),
        currentChatValid: Boolean(currentChat),
        socketValid: Boolean(socket),
        isAuth,
        userId: user?._id,
      });
      return;
    }

    console.log("Sending message in conversation:", currentChat._id);
    const messageData = {
      conversationId: currentChat._id,
      sender: user._id,
      text: message,
    };

    try {
      setError(null);
      // Send message to server
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const { data } = await axios.post(`${SERVER}/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Find the receiver ID from the conversation
      const receiverId = currentChat.members.find(
        (member) => member !== user._id
      );

      // Emit message to socket server
      socket.emit("send-message", {
        ...data,
        receiverId,
      });

      console.log("Message sent:", data);

      // Update local messages
      setMessages((prev) => [...prev, data]);
      setMessage("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error sending message:", errorMsg);
      setError(`Failed to send message: ${errorMsg}`);
      toast.error("Failed to send message");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        startNewConversation,
        setSocket,
        loading,
        getConversations,
        conversations,
        handleSubmit,
      }}
    >
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ChatContext.Provider>
  );
};
export const ChatData = () => useContext(ChatContext);
