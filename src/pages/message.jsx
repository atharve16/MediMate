import React, { useRef, useEffect, useState } from "react";
import { ChatData } from "../context/chatContext";
import { AuthData } from "../context/authContext";
import { LoadingSpinner } from "../Component/assets/loading";

const Message = () => {
  const {
    loading,
    conversations,
    currentChat,
    setCurrentChat,
    message,
    setMessage,
    messages,
    sendMessage,
    getMessages,
    loadingMessages,
    socket,
    isUserOnline,
    error,
    unreadCounts,
    getUnreadCount,
  } = ChatData();

  const { user } = AuthData();
  const messageContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({});

  // Function to get the name and online status of a conversation
  const getConversationInfo = (conversation) => {
    if (!conversation || !conversation.id) {
      return { name: "Unknown", isOnline: false };
    }

    // Find the conversation in our list
    const conv = conversations.find((c) => c.id === conversation.id);
    if (!conv) return { name: "Unknown", isOnline: false };

    // Get receiver ID (the user we're chatting with)
    const receiverId = conv.members.find((id) => id !== user._id);

    return {
      name: conv.name || "Unknown",
      isOnline: isUserOnline(receiverId),
    };
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();

    // Check if message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return (
        messageDate.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }) +
        " " +
        messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  };

  // Track last message timestamps for each conversation
  useEffect(() => {
    if (messages.length > 0 && currentChat?.id) {
      const lastMessage = messages[messages.length - 1];
      setLastMessageTimestamps((prev) => ({
        ...prev,
        [currentChat.id]: lastMessage.createdAt,
      }));
    }
  }, [messages, currentChat?.id]);

  // Fetch messages when current chat changes
  useEffect(() => {
    if (currentChat?.id) {
      getMessages(currentChat.id);

      // Focus input when changing conversations
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  }, [currentChat?.id]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Enter key for sending messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // Format last message time for conversation list
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-blue-600">
          <h3 className="text-lg font-semibold text-white">Conversations</h3>
        </div>
        <div className="flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            conversations.map((conv) => {
              const receiverId = conv.members.find((id) => id !== user._id);
              const online = isUserOnline(receiverId);
              const unreadCount = getUnreadCount(conv.id);
              const lastMessageTime = lastMessageTimestamps[conv.id];

              return (
                <div
                  key={conv.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    currentChat?.id === conv.id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : unreadCount > 0
                      ? "bg-blue-50 border-l-2 border-blue-300"
                      : ""
                  }`}
                  onClick={() => setCurrentChat(conv)}
                >
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold mr-3">
                      {conv.name.charAt(0).toUpperCase()}
                      {online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{conv.name}</span>
                        {lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          {online ? (
                            <span className="text-green-500">Online</span>
                          ) : (
                            <span>Offline</span>
                          )}
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {!loading && conversations.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-grow flex flex-col bg-white">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center">
              {(() => {
                const { name, isOnline } = getConversationInfo(currentChat);
                return (
                  <>
                    <div className="relative h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold mr-3">
                      {name.charAt(0).toUpperCase()}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{name}</h3>
                      <span className="text-sm text-gray-500">
                        {isOnline ? (
                          <span className="text-green-500">Online</span>
                        ) : (
                          <span>Offline</span>
                        )}
                      </span>
                    </div>
                  </>
                );
              })()}

              {!socket && (
                <span className="ml-auto text-sm px-2 py-1 bg-red-100 text-red-600 rounded-md">
                  Disconnected
                </span>
              )}
            </div>

            {/* Messages */}
            <div
              className="flex-grow p-4 overflow-y-auto bg-gray-50"
              ref={messageContainerRef}
            >
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.sender === user._id;
                    const showDate =
                      index === 0 ||
                      new Date(msg.createdAt).toDateString() !==
                        new Date(messages[index - 1].createdAt).toDateString();

                    return (
                      <React.Fragment key={msg._id || index}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                            <div
                              className={`text-xs mt-1 ${
                                isCurrentUser
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Message input */}
            <form
              className="p-4 border-t border-gray-200"
              onSubmit={sendMessage}
            >
              <div className="flex items-center">
                <textarea
                  ref={messageInputRef}
                  rows="1"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  style={{ minHeight: "45px", maxHeight: "120px" }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || !socket}
                  className="bg-blue-500 text-white p-3 px-4 rounded-r-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed h-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              {!socket && (
                <div className="text-xs text-red-500 mt-1">
                  You're disconnected. Messages won't be delivered.
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center flex-col p-6 text-gray-500 bg-gray-50">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-lg mb-2">Select a conversation</p>
            <p className="text-sm">
              Choose a conversation from the sidebar or start a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
