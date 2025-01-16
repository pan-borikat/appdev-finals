import React, { useRef, useState } from "react";
import { IoSend, IoClose } from "react-icons/io5";
import { LuBotMessageSquare } from "react-icons/lu";


const Chatbot = ({ isChatbotVisible, setIsChatbotVisible }) => {
  const chatBodyRef = useRef(null);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "bot",
      text: `Hola! I am VATask, your AI Task Assistant here to help you organize your tasks. 
      
      Your tasks, my mission—let's conquer them together! 😎
      
      🤖 Commands for creating, showing, and deleting a task 🤖
    
      📝Create <taskdesc> <duedate> 
      ex: "Create 3km jog 2025-01-12"

      📝Show tasks - shows all the current task of the user

      Type in "Show commands" in case you forgot the commands.
      `,
      timestamp: new Date(),
    },
  ]);
  
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:5000/task");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();
        // const tasksMessage = {
        //   role: "bot",
        //   text: "Here are your current tasks:\n" + tasks.map((task) => `${task.task_desc} (Due: ${new Date(task.task_due_date).toLocaleDateString()})`).join("\n"),
        //   timestamp: new Date(),
        // };
        // setChatHistory((prev) => [...prev, tasksMessage]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        const errorMessage = {
          role: "bot",
          text: "Oops! Something went wrong while fetching the tasks. Please try again later.",
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      }
    };

    fetchTasks();
  }, []);

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

  const showCommands = () => {
    const commands = {
      role: "bot",
      text: `🤖 Commands for creating, showing, and deleting a task 🤖
      
      📝Create <taskdesc> <duedate> 
      ex: "Create 3km jog 2025-01-12"

      📝Show tasks - shows all the current task of the user

      `,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, commands]);
  };

  const parseCreateCommand = (message) => {
    const parts = message.trim().split(" ");
    if (parts.length < 3) return null;
    
    const dueDate = parts[parts.length - 1];
    const taskDesc = parts.slice(1, parts.length - 1).join(" ");
  
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; 
    if (!dateRegex.test(dueDate)) {
      return null;
    }
    return { description: taskDesc, dueDate };
  };
  
  const createTask = async (description, dueDate) => {
    try {
      const newTask = {
        task_desc: description,
        task_due_date: dueDate,
        task_status: "Pending"
      };

      const response = await fetch('http://localhost:5000/api/task', { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
  
      const data = await response.json();
      const successMessage = {
        role: "bot",
        text: `Task created successfully: "${data.task_desc}" due on ${new Date(data.task_due_date).toLocaleDateString()}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error("Error creating task:", error);
      const errorMessage = {
        role: "bot",
        text: "Oops! Something went wrong while creating the task. Please try again later.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    }
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
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${msg.role === "user"
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
          <LuBotMessageSquare />
        </button>
      )}
    </>
  );
};

export default Chatbot;
