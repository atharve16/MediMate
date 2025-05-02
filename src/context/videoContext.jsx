import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { ChatData } from "./chatContext";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const { socket } = ChatData();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, connected
  const [incomingCall, setIncomingCall] = useState(null);

  // Keep a ref to the current room to avoid stale closures
  const currentRoomRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);

  // Initialize peer connection when needed
  const createPeerConnection = useCallback(() => {
    // Close any existing connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    console.log("Creating new peer connection");
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
        // Add TURN servers for more reliable connections
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    // Log ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);

      // Handle disconnections
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "closed"
      ) {
        console.warn("ICE connection failed or closed");
        setCallStatus("idle");
      }
    };

    // Handle ICE gathering state changes
    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering state:", pc.iceGatheringState);
    };

    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      console.log("Signaling state:", pc.signalingState);
    };

    // Handle and send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);

        if (remoteSocketId && socket) {
          console.log("Sending ICE candidate to:", remoteSocketId);
          socket.emit("ice:candidate", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        } else {
          // Queue ICE candidates if we can't send them yet
          console.log("Queueing ICE candidate - no remote socket ID yet");
          iceCandidatesQueueRef.current.push(event.candidate);
        }
      } else {
        console.log("ICE candidate gathering complete");
      }
    };

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log("Track received:", event);

      if (event.streams && event.streams[0]) {
        console.log("Setting remote stream", event.streams[0]);
        setRemoteStream(event.streams[0]);
      } else {
        console.warn("Received track without stream", event);
      }
    };

    // Handle negotiation needs
    pc.onnegotiationneeded = async () => {
      console.log("Negotiation needed");
      if (
        remoteSocketId &&
        (callStatus === "connected" || callStatus === "calling")
      ) {
        try {
          console.log("Creating offer due to negotiation needed");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("peer:nego:needed", {
            to: remoteSocketId,
            offer: pc.localDescription,
          });
        } catch (err) {
          console.error("Error during negotiation:", err);
        }
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [remoteSocketId, callStatus, socket]);

  // Process any queued ICE candidates
  const processIceCandidateQueue = useCallback(() => {
    if (
      peerConnectionRef.current &&
      remoteSocketId &&
      iceCandidatesQueueRef.current.length > 0
    ) {
      console.log(
        `Processing ${iceCandidatesQueueRef.current.length} queued ICE candidates`
      );

      iceCandidatesQueueRef.current.forEach((candidate) => {
        socket.emit("ice:candidate", {
          to: remoteSocketId,
          candidate,
        });
      });

      iceCandidatesQueueRef.current = [];
    }
  }, [remoteSocketId, socket]);

  // Handle received ICE candidate
  const handleIceCandidate = useCallback(({ from, candidate }) => {
    console.log("Received ICE candidate from:", from, candidate);

    if (
      peerConnectionRef.current &&
      peerConnectionRef.current.remoteDescription
    ) {
      try {
        peerConnectionRef.current
          .addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log("Added ICE candidate successfully"))
          .catch((e) =>
            console.error("Error adding received ICE candidate", e)
          );
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    } else {
      console.warn(
        "Received ICE candidate but peer connection not ready, queueing"
      );
      iceCandidatesQueueRef.current.push(candidate);
    }
  }, []);

  // Join a room to start video call
  const joinRoom = useCallback(
    ({ email, room }) => {
      if (socket && email && room) {
        console.log(`Joining room ${room} as ${email}`);
        socket.emit("room:join", { email, room });
        currentRoomRef.current = room;
      } else {
        console.error("Cannot join room - missing data:", {
          socket: !!socket,
          email,
          room,
        });
      }
    },
    [socket]
  );

  // Handle user joined event
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User ${email} joined with socket ID: ${id}`);
    setRemoteSocketId(id);
  }, []);

  // Pre-initialize local media stream
  const initLocalStream = useCallback(async () => {
    try {
      if (myStream && myStream.active) {
        // Stream already exists and is active
        return myStream;
      }

      // Clear any existing stream that might be inactive
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }

      console.log("Initializing local media stream");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      console.log("Local stream obtained:", stream);
      setMyStream(stream);
      return stream;
    } catch (err) {
      console.error("Error getting local media stream:", err);

      // Try fallback to just audio if video fails
      try {
        console.log("Trying audio-only as fallback");
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setMyStream(audioStream);
        return audioStream;
      } catch (audioErr) {
        console.error("Audio fallback also failed:", audioErr);
        return null;
      }
    }
  }, [myStream]);

  // Initiate a call to another user
  const callUser = useCallback(async () => {
    if (!remoteSocketId || !socket) {
      console.error(
        "Cannot call user - no remote socket ID or socket connection"
      );
      return;
    }

    try {
      setCallStatus("calling");
      console.log("Initiating call to:", remoteSocketId);

      // Create peer connection
      const pc = createPeerConnection();

      // Get user media or use existing stream
      let stream = myStream;

      if (!stream || !stream.active) {
        console.log("No active stream, getting a new one");
        stream = await initLocalStream();
        if (!stream) {
          throw new Error("Failed to get local media stream");
        }
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track.kind);
        pc.addTrack(track, stream);
      });

      // Create and send offer
      console.log("Creating offer");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Calling user:", remoteSocketId, "with offer");
      socket.emit("user:call", {
        to: remoteSocketId,
        offer: pc.localDescription,
      });

      // Process any queued ICE candidates
      processIceCandidateQueue();
    } catch (err) {
      console.error("Error calling user:", err);
      setCallStatus("idle");
    }
  }, [
    remoteSocketId,
    socket,
    createPeerConnection,
    myStream,
    initLocalStream,
    processIceCandidateQueue,
  ]);

  // Handle incoming call
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    console.log("Incoming call from:", from, "with offer");
    setRemoteSocketId(from);
    setIncomingCall({ from, offer });
  }, []);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) {
      console.error(
        "Cannot accept call - no incoming call or socket connection"
      );
      return;
    }

    try {
      console.log("Accepting call from:", incomingCall.from);

      // Create peer connection
      const pc = createPeerConnection();

      // Get local media stream or use existing stream
      let stream = myStream;

      if (!stream || !stream.active) {
        console.log("No active stream for accepting call, getting a new one");
        stream = await initLocalStream();
        if (!stream) {
          throw new Error("Failed to get local media stream");
        }
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log(
          "Adding track to peer connection for accepting call:",
          track.kind
        );
        pc.addTrack(track, stream);
      });

      // Set remote description (the offer)
      console.log("Setting remote description (offer)");
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Process any queued ICE candidates after setting remote description
      if (iceCandidatesQueueRef.current.length > 0) {
        console.log(
          `Adding ${iceCandidatesQueueRef.current.length} queued ICE candidates after setting remote description`
        );
        for (const candidate of iceCandidatesQueueRef.current) {
          await pc
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch((e) =>
              console.error("Error adding queued ICE candidate", e)
            );
        }
        iceCandidatesQueueRef.current = [];
      }

      // Create answer
      console.log("Creating answer");
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to caller
      console.log("Sending answer to:", incomingCall.from);
      socket.emit("call:accepted", {
        to: incomingCall.from,
        ans: pc.localDescription,
      });

      setCallStatus("connected");
      setIncomingCall(null);

      // Process any new ICE candidates
      processIceCandidateQueue();
    } catch (err) {
      console.error("Error accepting call:", err);
      setIncomingCall(null);
      setCallStatus("idle");
    }
  }, [
    incomingCall,
    socket,
    createPeerConnection,
    myStream,
    initLocalStream,
    processIceCandidateQueue,
  ]);

  // Decline an incoming call
  const declineCall = useCallback(() => {
    if (incomingCall && socket) {
      console.log("Declining call from:", incomingCall.from);
      socket.emit("call:declined", { to: incomingCall.from });
      setIncomingCall(null);
    }
  }, [incomingCall, socket]);

  // Handle when our call is accepted
  const handleCallAccepted = useCallback(({ from, ans }) => {
    console.log("Call accepted by:", from);

    if (peerConnectionRef.current) {
      console.log("Setting remote description (answer)");
      peerConnectionRef.current
        .setRemoteDescription(new RTCSessionDescription(ans))
        .then(() => {
          setCallStatus("connected");
          console.log("Remote description set successfully");

          // Process any queued ICE candidates after setting remote description
          if (iceCandidatesQueueRef.current.length > 0) {
            console.log(
              `Adding ${iceCandidatesQueueRef.current.length} queued ICE candidates after call accepted`
            );
            iceCandidatesQueueRef.current.forEach((candidate) => {
              peerConnectionRef.current
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch((e) =>
                  console.error(
                    "Error adding queued ICE candidate after call accepted",
                    e
                  )
                );
            });
            iceCandidatesQueueRef.current = [];
          }
        })
        .catch((err) => {
          console.error("Error setting remote description:", err);
          setCallStatus("idle");
        });
    } else {
      console.error("No peer connection when call was accepted");
      setCallStatus("idle");
    }
  }, []);

  // Handle negotiation needed from peer
  const handleNegoNeeded = useCallback(
    async ({ from, offer }) => {
      console.log("Negotiation needed from:", from);

      if (peerConnectionRef.current) {
        try {
          console.log("Setting remote description for negotiation");
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          // Process any queued ICE candidates
          if (iceCandidatesQueueRef.current.length > 0) {
            console.log(
              `Adding ${iceCandidatesQueueRef.current.length} queued ICE candidates during negotiation`
            );
            for (const candidate of iceCandidatesQueueRef.current) {
              await peerConnectionRef.current
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch((e) =>
                  console.error(
                    "Error adding queued ICE candidate during negotiation",
                    e
                  )
                );
            }
            iceCandidatesQueueRef.current = [];
          }

          console.log("Creating negotiation answer");
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          console.log("Sending negotiation answer to:", from);
          socket.emit("peer:nego:done", {
            to: from,
            ans: peerConnectionRef.current.localDescription,
          });
        } catch (err) {
          console.error("Error during negotiation:", err);
        }
      } else {
        console.error("No peer connection for negotiation");
      }
    },
    [socket]
  );

  // Handle final negotiation
  const handleNegoFinal = useCallback(({ from, ans }) => {
    console.log("Final negotiation from:", from);

    if (peerConnectionRef.current) {
      console.log("Setting final remote description");
      peerConnectionRef.current
        .setRemoteDescription(new RTCSessionDescription(ans))
        .then(() => {
          console.log("Final remote description set successfully");

          // Process any queued ICE candidates
          if (iceCandidatesQueueRef.current.length > 0) {
            console.log(
              `Adding ${iceCandidatesQueueRef.current.length} queued ICE candidates after final negotiation`
            );
            iceCandidatesQueueRef.current.forEach((candidate) => {
              peerConnectionRef.current
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch((e) =>
                  console.error(
                    "Error adding queued ICE candidate after final negotiation",
                    e
                  )
                );
            });
            iceCandidatesQueueRef.current = [];
          }
        })
        .catch((err) => {
          console.error("Error setting final remote description:", err);
        });
    } else {
      console.error("No peer connection for final negotiation");
    }
  }, []);

  // End call
  const endCall = useCallback(() => {
    console.log("Ending call");

    if (myStream) {
      console.log("Stopping local tracks");
      myStream.getTracks().forEach((track) => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
      setMyStream(null);
    }

    if (peerConnectionRef.current) {
      console.log("Closing peer connection");
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setCallStatus("idle");

    // Notify peer that call has ended
    if (socket && remoteSocketId) {
      console.log("Sending call ended to:", remoteSocketId);
      socket.emit("call:ended", { to: remoteSocketId });
    }

    setRemoteSocketId(null);
    currentRoomRef.current = null;
    iceCandidatesQueueRef.current = [];
  }, [myStream, socket, remoteSocketId]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log("Socket not available for video context");
      return;
    }

    console.log("Setting up video socket event listeners");

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeeded);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("ice:candidate", handleIceCandidate);
    socket.on("call:ended", endCall);

    return () => {
      console.log("Removing video socket event listeners");

      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeeded);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("ice:candidate", handleIceCandidate);
      socket.off("call:ended", endCall);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeeded,
    handleNegoFinal,
    handleIceCandidate,
    endCall,
  ]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      console.log("VideoProvider unmounting, cleaning up");

      if (myStream) {
        console.log("Stopping tracks on unmount");
        myStream.getTracks().forEach((track) => track.stop());
      }

      if (peerConnectionRef.current) {
        console.log("Closing peer connection on unmount");
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [myStream]);

  return (
    <VideoContext.Provider
      value={{
        joinRoom,
        callUser,
        acceptCall,
        declineCall,
        endCall,
        myStream,
        remoteStream,
        remoteSocketId,
        callStatus,
        incomingCall,
        initLocalStream,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoCall = () => useContext(VideoContext);
