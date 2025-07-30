import React, { useState, useEffect, useRef } from "react";
import { IoSend, IoClose } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY } from "/config";
import "./ChatBot.css";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function ChatBot() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState([{ type: "bot", message: "Hi, How can I help you?" }]); // Initial welcome message
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    scrollToBottom(); // Ensure the initial message is visible
  };

  const handleUserInput = (e) => setUserInput(e.target.value);

  const handleSubmit = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage = userInput;
    setResponse((prevResponse) => [
      ...prevResponse,
      { type: "user", message: userMessage }
    ]);
    setUserInput("");
    setLoading(true);

    const res = await generateContent(userMessage);
    setResponse((prevResponse) => [
      ...prevResponse,
      { type: "bot", message: res }
    ]);
    setLoading(false);
  };

  const generateContent = async (prompt) => {
    try {
      const result = await model.generateContent(prompt);
      if (
        result &&
        result.response &&
        result.response.candidates &&
        result.response.candidates.length > 0 &&
        result.response.candidates[0].content.parts.length > 0
      ) {
        return result.response.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      console.error("Error generating response:", error);
    }
    return "Sorry, I couldn't process that. Please try again.";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response]);

  return (
    <>
      <div className={`chatbot-container ${isChatOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <img src="assets/taxallnewww22n.png" alt="Chatbot Logo" className="chatbot-logo" />
          <button className="close-button-chat" onClick={toggleChat}>
            <IoClose size={20} />
          </button>
        </div>
        <div className="chatbot-body">
          {response.map((msg, index) => (
            <div
              key={index}
              className={`chatbot-message-container ${
                msg.type === "user" ? "user-message" : "bot-message"
              }`}
            >
              <div className={`chatbot-message ${msg.type}`}>
                <ReactMarkdown>{msg.message}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="loading-container">
              <div className="typing-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
        <div className="chatbot-footer">
          <input
            type="text"
            value={userInput}
            onChange={handleUserInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="chatbot-input"
            disabled={loading}
          />
          <button onClick={handleSubmit} className="chatbot-send-button" disabled={loading}>
            <IoSend size={20} />
          </button>
        </div>
      </div>

      <button className="chatbot-floating-button" onClick={toggleChat}>
        💬
      </button>
    </>
  );
}
