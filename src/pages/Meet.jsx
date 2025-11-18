import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "https://family-backend-yocb.onrender.com";

const Meet = () => {
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const [localStream, setLocalStream] = useState(null);
  const [users, setUsers] = useState({});
  const [name, setName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // ---- AUTO PIP WHEN PAGE HIDDEN ----
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden) {
        if (localVideoRef.current && !document.pictureInPictureElement) {
          try {
            await localVideoRef.current.requestPictureInPicture();
          } catch (err) {}
        }
      } else {
        if (document.pictureInPictureElement) {
          try {
            await document.exitPictureInPicture();
          } catch (err) {}
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const enablePiP = async () => {
    if (localVideoRef.current) {
      try {
        await localVideoRef.current.requestPictureInPicture();
      } catch (err) {
        alert("PiP not supported on this device.");
      }
    }
  };

  // ------------------------------ JOIN MEETING ------------------------------
  const joinMeeting = async () => {
    if (!name.trim()) return alert("Enter your name");

    setShowNamePrompt(false);
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join-meet", name);
    socketRef.current.on("users-update", (updatedUsers) => setUsers(updatedUsers));

    await setupMedia();
  };

  // ------------------------------ SETUP CAMERA + MIC ------------------------------
  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      socketRef.current.on("offer", handleReceiveOffer);
      socketRef.current.on("answer", handleReceiveAnswer);
      socketRef.current.on("ice-candidate", handleNewICECandidate);

      socketRef.current.on("users-update", async (updatedUsers) => {
        setUsers(updatedUsers);
        const userIds = Object.keys(updatedUsers);
        const myId = socketRef.current.id;

        for (let id of userIds) {
          if (id !== myId && !peersRef.current[id]) {
            createPeer(id, stream);
          }
        }
      });
    } catch (err) {
      alert("Camera or Microphone blocked.");
    }
  };

  // ------------------------------ CREATE PEER ------------------------------
  const createPeer = (userId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Free TURN server
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const remoteVideo = document.getElementById(`video-${userId}`);
      if (remoteVideo) remoteVideo.srcObject = event.streams[0];
    };

    stream.getTracks().forEach((t) => peer.addTrack(t, stream));
    peersRef.current[userId] = peer;
    makeOffer(userId, peer);
  };

  const makeOffer = async (userId, peer) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current.emit("offer", { to: userId, offer });
  };

  const handleReceiveOffer = async ({ from, offer }) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peersRef.current[from] = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { to: from, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      const remoteVideo = document.getElementById(`video-${from}`);
      if (remoteVideo) remoteVideo.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach((t) => peer.addTrack(t, localStream));
    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socketRef.current.emit("answer", { to: from, answer });
  };

  const handleReceiveAnswer = async ({ from, answer }) => {
    const peer = peersRef.current[from];
    if (peer) await peer.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = async ({ from, candidate }) => {
    const peer = peersRef.current[from];
    if (peer && candidate) await peer.addIceCandidate(new RTCIceCandidate(candidate));
  };

  // ------------------------------ MIC / VIDEO / DISCONNECT ------------------------------
  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !micEnabled));
    setMicEnabled(!micEnabled);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !videoEnabled));
    setVideoEnabled(!videoEnabled);
  };

  const disconnect = () => {
    Object.values(peersRef.current).forEach((peer) => peer.close());
    socketRef.current.disconnect();
    window.location.href = "/";
  };

  return (
    <div className="w-full h-screen bg-black text-white p-2">
      {/* NAME INPUT */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-lg w-80">
            <h2 className="text-xl font-bold mb-4">Enter Your Name</h2>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="mt-4 w-full bg-indigo-600 text-white p-2 rounded-lg" onClick={joinMeeting}>
              Join
            </button>
          </div>
        </div>
      )}

      {/* VIDEO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {/* LOCAL VIDEO */}
        <div className="border border-gray-700 rounded-lg p-1">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-40 bg-gray-800 rounded"></video>
          <p className="text-center mt-1">You ({name})</p>
        </div>

        {/* REMOTE USERS */}
        {Object.keys(users)
          .filter((id) => id !== socketRef.current?.id)
          .map((id) => (
            <div key={id} className="border border-gray-700 rounded-lg p-1">
              <video id={`video-${id}`} autoPlay playsInline className="w-full h-40 bg-gray-800 rounded"></video>
              <p className="text-center mt-1">{users[id]?.name || "Guest"}</p>
            </div>
          ))}
      </div>

      {/* CONTROL BUTTONS */}
      {!showNamePrompt && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-4">
          <button onClick={toggleMic} className="bg-gray-700 p-3 rounded-full text-lg">{micEnabled ? "🎤" : "🔇"}</button>
          <button onClick={toggleVideo} className="bg-gray-700 p-3 rounded-full text-lg">{videoEnabled ? "📷" : "🚫"}</button>
          <button onClick={enablePiP} className="bg-yellow-500 p-3 rounded-full text-lg">📺</button>
          <button onClick={disconnect} className="bg-red-600 p-3 rounded-full text-lg">❌</button>
        </div>
      )}
    </div>
  );
};

export default Meet;
