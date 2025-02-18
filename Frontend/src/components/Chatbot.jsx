import React, { useState, useEffect, useRef } from "react";
import http from "../http";
import {
    Box,
    IconButton,
    TextField,
    Typography,
    Paper,
    Button,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi! How can I assist you today?" },
    ]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);

    // Scroll to latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send message to chatbot API
    const sendMessage = async () => {
        if (input.trim() === "") return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await http.post("chat/ask", {
                question: input,
            });

            const botMessage = {
                sender: "bot",
                text: response.data.response || "I'm sorry, I couldn't understand that.",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Error fetching response. Please try again." },
            ]);
        }
    };

    return (
        <Box>
            {/* Floating Chatbot Button */}
            <IconButton
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 80, // Move it 60px to the left from the original position
                    backgroundColor: "#a67c52",
                    color: "white",
                    width: 60,
                    height: 60,
                    zIndex: isOpen ? 0 : 1000, // Hide button when chat window is open
                    "&:hover": { backgroundColor: "#8b5e3c" },
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ChatIcon fontSize="large" />
            </IconButton>


            {/* Chat Window */}
            {isOpen && (
                <Paper
                    sx={{
                        position: "fixed",
                        bottom: 20, // Adjusted to overlap the button
                        right: 20,
                        width: 320,
                        height: 400,
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: 3,
                        borderRadius: 2,
                        backgroundColor: "#f9f9f9", // Lighter background color
                        zIndex: 1000, // Ensure chat window is above other elements
                    }}
                    elevation={5}
                >
                    {/* Chat Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#a67c52",
                            color: "white",
                            padding: "10px",
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                        }}
                    >
                        <Typography variant="h6">Styly</Typography>
                        <IconButton onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Chat Messages */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "10px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {messages.map((msg, index) => (
                            <Typography
                                key={index}
                                sx={{
                                    padding: "8px",
                                    margin: "5px 0",
                                    borderRadius: "10px",
                                    maxWidth: "80%",
                                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                    backgroundColor: msg.sender === "user" ? "#d9bfa2" : "#f1f1f1", // Lighter color for user messages
                                    color: msg.sender === "user" ? "white" : "black",
                                }}
                            >
                                {msg.text}
                            </Typography>
                        ))}
                        <div ref={chatEndRef} />
                    </Box>

                    {/* Chat Input */}
                    <Box sx={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd" }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <Button onClick={sendMessage} sx={{ marginLeft: "5px" }} variant="contained">
                            <SendIcon />
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default Chatbot;