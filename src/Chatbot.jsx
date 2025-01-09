import React, { useRef, useState } from "react";
import { IoSend, IoClose } from "react-icons/io5";

const Chatbot = ({ isChatbotVisible, setIsChatbotVisible }) => {
  const chatBodyRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = "AIzaSyAY6RK4zHRko5y-Urif1Es8zDspjCTzzMc";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = {
      role: "user",
      text: userMessage,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, newMessage]);
    setUserMessage("");
    scrollToBottom();

    await fetchBotResponse([...chatHistory, newMessage]);
  };

  const fetchBotResponse = async (conversation) => {
    setIsLoading(true);

    const payload = {
      contents: conversation.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch response from API. Status:", response.status, "Response:", errorText);
        throw new Error("Failed to fetch response from API.");
      }

      const data = await response.json();
      const botText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm not sure how to respond to that.";

      const botMessage = {
        role: "bot",
        text: botText,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "bot",
        text: "Oops! Something went wrong. Please try again later.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {isChatbotVisible && (
        <div className="chatbot-container max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Chat Header */}
          <div className="chat-header flex items-center justify-between bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-4">
            <h2 className="text-xl font-semibold">VATask</h2>
            <button onClick={() => setIsChatbotVisible(false)}>
              <IoClose className="text-2xl" />
            </button>
          </div>

          {/* Chat Body */}
          <div
            className="chat-body overflow-y-auto bg-gray-50 p-4 space-y-4"
            ref={chatBodyRef}
            style={{ height: "370px" }}
          >
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#915f78] to-[#882054] text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="dot-flashing"></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input flex items-center bg-white border-t border-gray-200 p-4">
            <input
              type="text"
              className="flex-grow bg-gray-100 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#882054]"
              placeholder="Type a message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <button
              className="ml-2 bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full hover:opacity-90 transition-opacity"
              onClick={handleSendMessage}
            >
              <IoSend className="text-xl" />
            </button>
          </div>
        </div>
      )}
      {!isChatbotVisible && (
        <button
          className="fixed bottom-4 right-4 bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-4 rounded-full shadow-lg"
          onClick={() => setIsChatbotVisible(true)}
        >
          Open Chatbot
        </button>
      )}
    </>
  );
};

export default Chatbot;
