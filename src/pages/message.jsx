import React, { useRef } from "react";
import { ChatData } from "../context/chatContext";
import { LoadingSpinner } from "../Component/assets/loading";

const Message = () => {
  const {
    startNewConversation,
    AllConnections,
    setSocket,
    loading,
    getConversations,
    conversations,
    handleSubmit,
  } = ChatData();

  const messageContainerRef = useRef(null);
  // Scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="messenger-container">
      <div className="messenger-sidebar">
        <div className="sidebar-header">
          <h3>Conversations</h3>
        </div>
        <div className="conversation-list">
          {loading && !conversations.length ? (
            <LoadingSpinner />
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${
                  currentChat?._id === conv._id ? "active" : ""
                }`}
                onClick={() => setCurrentChat(conv)}
              >
                <div className="conversation-name">
                  {getConversationName(conv)}
                </div>
              </div>
            ))
          )}
          {!loading && conversations.length === 0 && (
            <div className="no-conversations">No conversations yet</div>
          )}
        </div>
      </div>

      <div className="messenger-chat">
        {currentChat ? (
          <>
            <div className="chat-header">
              <h3>{getConversationName(currentChat)}</h3>
            </div>

            <div className="message-container" ref={messageContainerRef}>
              {loading && !messages.length ? (
                <div className="loading">Loading messages...</div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`message ${
                      msg.sender === user._id ? "own" : "other"
                    }`}
                  >
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <div className="message-timestamp">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-messages">
                  No messages yet. Start a conversation!
                </div>
              )}
            </div>

            <form className="message-input-container" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" disabled={!message.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Message;
