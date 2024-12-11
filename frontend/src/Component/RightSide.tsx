import React, { useState, useEffect, useRef } from "react";
import wh from "../Images/wh.avif";
import { useUser } from "./UserContext";
import SendIcon from "@mui/icons-material/Send";
import socket from "../socketConnection/Socket";

interface Message {
  roomId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

const RightSide: React.FC = () => {
  const { selectedUser, currentUserId } = useUser();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastActive, setLastActive] = useState<string>("Offline");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser && currentUserId) {
      const roomId = [currentUserId, selectedUser._id].sort().join("_");
      socket.emit("join_room", roomId);

      // Clear messages and load previous ones
      setMessages([]);
      socket.once("previous_messages", (previousMessages: Message[]) => {
        setMessages(previousMessages.sort((a, b) => a.timestamp - b.timestamp));
      });

      // Listen for last active status
      socket.on("user_last_active", (lastActiveTimestamp: number | null) => {
        setLastActive(
          lastActiveTimestamp
            ? new Date(lastActiveTimestamp).toLocaleString()
            : "Offline"
        );
      });

      return () => {
        socket.off("previous_messages");
        socket.off("user_last_active");
      };
    }
  }, [selectedUser, currentUserId]);

  const handleSendMessage = () => {
    if (message.trim() && selectedUser && currentUserId) {
      const roomId = [currentUserId, selectedUser._id].sort().join("_");
      const userMessage: Message = {
        roomId,
        senderId: selectedUser._id,
        text: message.trim(),
        timestamp: Date.now()
      };

      socket.emit("private_message", userMessage);
      // console.log(userMessage, "userMessage");
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (incomingMessage: Message) => {
      // alert("hhi");
      setMessages((prevMessages) =>
        [...prevMessages, incomingMessage].sort(
          (a, b) => a.timestamp - b.timestamp
        )
      );
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedUser]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {!selectedUser && (
        <img
          src={wh}
          alt="Background"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1
          }}
        />
      )}

      {/* Chat Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 15px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ddd"
        }}
      >
        {selectedUser ? (
          <>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                marginRight: "10px",
                fontWeight: "bold"
              }}
            >
              {selectedUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>
                {" "}
                Conversation Of{" "}
                <span style={{ color: "rebeccapurple" }}>
                  {selectedUser.username}{" "}
                </span>{" "}
                and <span style={{ color: "rebeccapurple" }}>Open Ai</span>
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                online
              </p>
            </div>
          </>
        ) : (
          <h3 style={{ margin: 0 }}>Select a user to start chatting</h3>
        )}
      </div>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          backgroundColor: "#f9f9f9"
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection:
                msg.senderId === currentUserId ? "row-reverse" : "row",
              marginBottom: "10px"
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "10px",
                borderRadius: "20px",
                backgroundColor:
                  msg.senderId === currentUserId
                    ? "#DCF8C6"
                    : msg.senderId === "bot"
                    ? "#EFEFEF"
                    : "#FFFFFF",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                wordWrap: "break-word"
              }}
            >
              <p style={{ margin: 0 }}>{msg.text}</p>
              <small
                style={{
                  fontSize: "10px",
                  color: "#888",
                  marginTop: "5px",
                  display: "block",
                  textAlign: "right"
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      {selectedUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            backgroundColor: "#fff",
            borderTop: "1px solid #ddd",
            gap: "10px"
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #ddd"
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              padding: "10px",
              cursor: "pointer"
            }}
          >
            <SendIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default RightSide;
