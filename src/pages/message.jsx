import React, { useRef, useEffect } from "react";
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
  } = ChatData();

  const { user } = AuthData();
  const messageContainerRef = useRef(null);

  // Function to get the name of a conversation
  const getConversationName = (conversation) => {
    if (!conversation || !conversation.id) return "Unknown";

    // Find the conversation in our list
    const conv = conversations.find((c) => c.id === conversation.id);
    return conv ? conv.name : "Unknown";
  };

  // Fetch messages when current chat changes
  useEffect(() => {
    if (currentChat?.id) {
      getMessages(currentChat.id);
    }
  }, [currentChat]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Debug socket status
  useEffect(() => {
    console.log("Socket status:", socket ? "Connected" : "Disconnected");
  }, [socket]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-blue-600">
          <h3 className="text-lg font-semibold text-white">Conversations</h3>
        </div>
        <div className="flex-grow overflow-y-auto">
          {loading ? (
            <LoadingSpinner />
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentChat?.id === conv.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => setCurrentChat(conv)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold mr-3">
                    {conv.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{conv.name}</div>
                    <div className="text-xs text-gray-500">
                      Click to view messages
                    </div>
                  </div>
                </div>
              </div>
            ))
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
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold mr-3">
                {getConversationName(currentChat).charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-medium">
                {getConversationName(currentChat)}
              </h3>
              {!socket && (
                <span className="ml-2 text-sm text-red-500">
                  (Disconnected)
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
                  {messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`flex ${
                        msg.sender === user._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === user._id
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender === user._id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>

            {/* Message input */}
            <form
              className="p-4 border-t border-gray-200 flex items-center"
              onSubmit={sendMessage}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!message.trim() || !socket}
                className="bg-blue-500 text-white p-2 px-4 rounded-r-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                Send
              </button>
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
            <p className="text-lg mb-2">No conversation selected</p>
            <p className="text-sm">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
