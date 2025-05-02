import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/authContext";
import { ChatProvider } from "./context/chatContext";
import { VideoProvider } from "./context/videoContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <ChatProvider>
        <VideoProvider>
          <App />
        </VideoProvider>
      </ChatProvider>
    </UserProvider>
  </StrictMode>
);
