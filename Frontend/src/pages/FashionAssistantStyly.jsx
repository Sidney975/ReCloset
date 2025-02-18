import React, { useState, useEffect } from "react";
import axios from "axios";
import http from "../http";

const FashionConsultant = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I assist you today?" }
  ]); // Default greeting message
  const [input, setInput] = useState(""); // User input
  const [loading, setLoading] = useState(false); // Loader for API calls
  const [dots, setDots] = useState(""); // Dots animation for typing indicator

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots("");
    }
  }, [loading]);

  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent empty messages

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]); // Add user message to chat
    setLoading(true);

    try {
      const response = await http.post("FashionAdvice/advice", {
        Input: input,
      });

      const botReply = { sender: "bot", text: response.data.advice };
      setMessages([...messages, newMessage, botReply]); // Update chat
    } catch (error) {
      console.error("Error fetching advice:", error);
      const errorMessage = { sender: "bot", text: "Sorry, something went wrong!" };
      setMessages([...messages, newMessage, errorMessage]); // Show error message
    }

    setInput(""); // Clear input field
    setLoading(false);
  };

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.title}>Fashion AI Consultant</h1>
      <p style={styles.subtitle}>Ask me anything about fashion, styling, and outfit recommendations!</p>

      <div style={styles.chatContainer}>
        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={styles.typingIndicator}>
              Typing<span>{dots}</span>
            </div>
          )}
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for fashion advice..."
            style={styles.input}
          />
          <button onClick={sendMessage} disabled={loading} style={styles.button}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// **Improved Styling for Chat UI**
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
    padding: "20px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "25px",
  },
  chatContainer: {
    width: "500px",
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  chatBox: {
    height: "400px",
    overflowY: "auto",
    padding: "15px",
    background: "#fafafa",
    borderRadius: "10px",
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userMessage: {
    background: "#a67c52", // Keep user message this color
    color: "#fff",
    padding: "12px 15px",
    borderRadius: "18px 18px 0px 18px", // Rounded bubble style
    textAlign: "right",
    alignSelf: "flex-end",
    maxWidth: "75%",
    wordWrap: "break-word",
  },
  botMessage: {
    background: "#e0e0e0",
    color: "#000",
    padding: "12px 15px",
    borderRadius: "18px 18px 18px 0px", // Rounded bubble style
    textAlign: "left",
    alignSelf: "flex-start",
    maxWidth: "75%",
    wordWrap: "break-word",
  },
  typingIndicator: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingBottom: "5px",
    paddingLeft: "5px", // Ensuring input box has spacing inside the chat container
    paddingRight: "5px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    marginRight: "10px", // Spacing between input and button
  },
  button: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    background: "#a67c52",
    color: "#fff",
    cursor: "pointer",
  },
};

export default FashionConsultant;
