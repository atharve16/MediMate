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
  const [onlineUsers, setOnlineUsers] = useState([]);
  // New state for tracking unread messages
  const [unreadCounts, setUnreadCounts] = useState({});

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
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        newSocket.emit("add-user", user._id);
        toast.success("Connected to chat server");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(`Socket connection error: ${err.message}`);
        toast.error("Connection error. Please try again.");
      });

      // Listen for incoming messages
      newSocket.on("receive-message", (newMessage) => {
        console.log("Received message via socket:", newMessage);
        
        // Always update messages if we're in the right conversation
        if (currentChat && newMessage.conversationId === currentChat.id) {
          setMessages((prev) => [...prev, newMessage]);
        } else {
          // If not in the conversation, increment unread count
          setUnreadCounts(prev => ({
            ...prev,
            [newMessage.conversationId]: (prev[newMessage.conversationId] || 0) + 1
          }));
          
          // Notification for messages in other conversations
          const conversationName = conversations.find(
            (c) => c.id === newMessage.conversationId
          )?.name;

          if (conversationName) {
            toast(`New message from ${conversationName}`, {
              icon: '💬',
              style: {
                background: '#4B5563',
                color: '#fff',
              },
            });
          }
        }
      });

      // Track online users
      newSocket.on("users-online", (userList) => {
        console.log("Online users updated:", userList);
        setOnlineUsers(userList.map((u) => u.userId));
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        toast.error("Disconnected from chat server");
      });

      newSocket.on("reconnect", (attempt) => {
        console.log(`Reconnected after ${attempt} attempts`);
        // Re-register user after reconnection
        newSocket.emit("add-user", user._id);
        toast.success("Reconnected to chat server");
      });

      setSocket(newSocket);

      return () => {
        console.log("Disconnecting socket");
        if (newSocket) {
          newSocket.off("receive-message");
          newSocket.off("users-online");
          newSocket.disconnect();
        }
      };
    } catch (err) {
      console.error("Error setting up socket:", err);
      setError(`Socket setup error: ${err.message}`);
      toast.error("Failed to connect to chat server");
    }
  }, [isAuth, user?._id]);

  // Handle current chat change
  useEffect(() => {
    // Reset message array when changing conversations
    if (currentChat) {
      setMessages([]);
      getMessages(currentChat.id);
      
      // Clear unread count when entering a conversation
      if (unreadCounts[currentChat.id]) {
        setUnreadCounts(prev => ({
          ...prev,
          [currentChat.id]: 0
        }));
      }
    }
  }, [currentChat?.id]);

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

      // Process conversations
      const processedConversations = [];
      const userRequests = [];

      data.forEach((conversation) => {
        const receiverId = conversation.members.find((id) => id !== user._id);
        if (receiverId) {
          processedConversations.push({
            id: conversation._id,
            members: conversation.members,
            receiverId: receiverId,
          });

          // Prepare user detail requests
          const token = localStorage.getItem("token");
          userRequests.push(
            axios.get(`${SERVER}/user/${receiverId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
        }
      });

      // Fetch all user details in parallel
      const userResponses = await Promise.all(userRequests);

      // Combine conversation and user data
      const conversationsWithUserDetails = processedConversations.map(
        (conv, index) => ({
          id: conv.id,
          members: conv.members,
          receiverId: conv.receiverId,
          name: userResponses[index].data.name,
        })
      );

      console.log("Processed conversations:", conversationsWithUserDetails);
      setConversations(conversationsWithUserDetails);
      
      // Initialize unread counts for new conversations
      const initialUnreadCounts = {};
      
      // If we had some init logic for loading past unread counts from server
      // we would do it here
      
      setUnreadCounts(initialUnreadCounts);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error loading conversations:", errorMsg);
      setError(`Failed to load conversations: ${errorMsg}`);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth && user?._id) {
      getConversations();
    }
  }, [isAuth, user?._id]);

  // Start a new conversation
  const startNewConversation = async (receiverId) => {
    if (!isAuth || !user?._id) {
      toast.error("You must be logged in to start a conversation");
      return null;
    }

    if (!receiverId) {
      toast.error("Invalid recipient");
      return null;
    }

    console.log("Starting new conversation with user:", receiverId);
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // First check if a conversation already exists
      const existingConvId = await getConversationId(receiverId);
      if (existingConvId) {
        // Find the existing conversation in our list
        const existingConv = conversations.find((c) => c.id === existingConvId);
        if (existingConv) {
          setCurrentChat(existingConv);
          return existingConv;
        }
      }

      // Create new conversation if needed
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
        receiverId: receiverId,
        name: receiverResponse.data.name,
      };

      setConversations((prev) => [...prev, newConversation]);
      setCurrentChat(newConversation);
      
      // Initialize unread count for new conversation
      setUnreadCounts(prev => ({
        ...prev,
        [data._id]: 0
      }));
      
      return newConversation;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error creating conversation:", errorMsg);
      setError(`Failed to create conversation: ${errorMsg}`);
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const getConversationId = async (receiverId) => {
    if (!isAuth || !user?._id) return null;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        `${SERVER}/conversations/find/${user._id}/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data?._id || null;
    } catch (err) {
      if (err.response?.status === 404) {
        // No conversation found is an expected response
        return null;
      }

      console.error("Error fetching conversation ID:", err);
      return null;
    }
  };

  // Get messages for a conversation
  const getMessages = async (conversationId) => {
    if (!conversationId || !isAuth) return;

    setLoadingMessages(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(`${SERVER}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Messages loaded:", data);
      setMessages(data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error fetching messages:", errorMsg);
      setError(`Failed to load messages: ${errorMsg}`);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message function
  const sendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!message.trim() || !currentChat || !socket || !isAuth || !user?._id) {
      console.log("Cannot send message - validation failed", {
        messageValid: Boolean(message.trim()),
        currentChatValid: Boolean(currentChat),
        socketValid: Boolean(socket),
        isAuth,
        userId: user?._id,
      });

      if (!message.trim()) {
        return; // Silent fail for empty messages
      }

      if (!socket) {
        toast.error("Connection issue. Please refresh the page.");
      }
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const messageData = {
        conversationId: currentChat.id,
        sender: user._id,
        text: message,
      };

      // Clear message input early for better UX
      const currentMessage = message;
      setMessage("");

      const { data } = await axios.post(`${SERVER}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get receiver ID from current chat
      const receiverId = currentChat.members.find(
        (member) => member !== user._id
      );

      if (!receiverId) {
        console.error("Cannot find receiver in conversation members");
        return;
      }

      socket.emit("send-message", {
        ...data,
        receiverId,
        conversationId: currentChat.id, // Ensure this is included
      });

      console.log("Message sent:", data);
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("Error sending message:", errorMsg);
      setError(`Failed to send message: ${errorMsg}`);
      toast.error("Failed to send message");

      // Restore the message if it failed to send
      setMessage(message);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };
  
  // Get unread count for a specific conversation
  const getUnreadCount = (conversationId) => {
    return unreadCounts[conversationId] || 0;
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
        onlineUsers,
        isUserOnline,
        error,
        unreadCounts,
        getUnreadCount,
      }}
    >
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ChatContext.Provider>
  );
};

export const ChatData = () => useContext(ChatContext);