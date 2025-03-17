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
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
        toast.error("Connection error. Please try again.");
      });

      // Listen for incoming messages
      newSocket.on("receive-message", (newMessage) => {
        console.log("Received message via socket:", newMessage);
        if (currentChat && newMessage.conversationId === currentChat.id) {
          setMessages((prev) => [...prev, newMessage]);
        }
      });

      setSocket(newSocket);

      return () => {
        console.log("Disconnecting socket");
        if (newSocket) {
          newSocket.off("receive-message");
          newSocket.disconnect();
        }
      };
    } catch (err) {
      console.error("Error setting up socket:", err);
      setError(`Socket setup error: ${err.message}`);
    }
  }, [isAuth, user, currentChat]);

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

      if (!data || data.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Extract the receiver IDs (excluding the current user)
      const usersToFetch = [];
      const processedConversations = [];

      data.forEach((conversation) => {
        const receiverId = conversation.members.find((id) => id !== user._id);
        if (receiverId) {
          usersToFetch.push(receiverId);
          // Store the conversation with its ID and members
          processedConversations.push({
            id: conversation._id,
            members: conversation.members,
            receiverId: receiverId,
          });
        }
      });
      console.log("conversation k pehle ki id", processedConversations.id);
      console.log("Receiver IDs to fetch:", usersToFetch);

      // Fetch user details for each receiver
      const userDetails = await Promise.all(
        usersToFetch.map(async (id, index) => {
          const response = await axios.get(`${SERVER}/user/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return {
            id,
            name: response.data.name,
            conversationId: processedConversations[index].id,
            members: processedConversations[index].members,
          };
        })
      );

      console.log("User details:", userDetails);
      setConversations(userDetails);
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

  // Start a new conversation
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

      // Get the receiver's name
      const receiverResponse = await axios.get(`${SERVER}/user/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newConversation = {
        id: data._id,
        members: data.members,
        name: receiverResponse.data.name,
      };

      setConversations((prev) => [...prev, newConversation]);
      setCurrentChat(newConversation);
      return newConversation;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error creating conversation:", errorMsg);
      setError(`Failed to create conversation: ${errorMsg}`);
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const getConversationId = async (receiver) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${SERVER}/conversations/find/${user._id}/${receiver}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data?._id || null;
    } catch (err) {
      console.error("Error fetching conversation ID:", err);
      toast.error("Failed to retrieve conversation");
      return null; // Ensure function always returns a valid value
    }
  };

  // Get messages for a conversation
  const getMessages = async (receiverId) => {
    if (!receiverId) return;

    setLoadingMessages(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      setLoadingMessages(false);
      return;
    }

    try {
      const conversationId = await getConversationId(receiverId);

      if (!conversationId) {
        console.error("Conversation ID not found");
        setLoadingMessages(false);
        return;
      }

      const { data } = await axios.get(`${SERVER}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Messages loaded:", data);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message function
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !currentChat || !socket || !isAuth || !user?._id) {
      console.log("Cannot send message - validation failed", {
        messageValid: Boolean(message.trim()),
        currentChatValid: Boolean(currentChat),
        socketValid: Boolean(socket),
        isAuth,
        userId: user?._id,
      });

      if (!socket) {
        toast.error("Connection issue. Please refresh the page.");
      }
      return;
    }

    console.log("Fetching conversation ID for sending message...");

    try {
      setError(null);
      const conversationId = await getConversationId(currentChat.id);

      if (!conversationId) {
        console.error("Conversation ID could not be retrieved");
        toast.error("Failed to retrieve conversation. Please try again.");
        return;
      }

      console.log("Sending message in conversation:", conversationId);

      const messageData = {
        conversationId, // Now correctly resolved
        sender: user._id,
        text: message,
      };

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.post(`${SERVER}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const receiverId = currentChat.members?.find(
        (member) => member !== user._id
      );

      socket.emit("send-message", { ...data, receiverId });

      console.log("Message sent:", data);
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
        socket,
        loading,
        getConversations,
        conversations,
        currentChat,
        setCurrentChat,
        message,
        setMessage,
        messages,
        setMessages,
        sendMessage,
        getMessages,
        loadingMessages,
      }}
    >
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ChatContext.Provider>
  );
};

export const ChatData = () => useContext(ChatContext);
