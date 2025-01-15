import React, { useEffect, useState } from "react";
import { FaPlus, FaRegUserCircle } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { RiEditCircleFill } from "react-icons/ri";
import { MdDelete, MdHistory } from "react-icons/md";
import Chatbot from "./Chatbot.jsx";
import { LuBotMessageSquare } from "react-icons/lu";
import { useNavigate } from "react-router-dom"; // Assuming you are using React Router


const AddTask = () => {
  const [tasks, setTasks] = useState([]);
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(true);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); // New state for History toggle
  const [historyTasks, setHistoryTasks] = useState([]); // State for history tasks

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data (e.g., tokens)
    localStorage.removeItem("authToken");
    navigate("/"); // Redirect to login page
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/task");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleSaveBtn = async () => {
    if (taskDescription && dueDate) {
      const newTask = {
        task_desc: taskDescription,
        task_due_date: dueDate,
        task_status: taskStatus,
      };

      try {
        const response = await fetch("http://localhost:5000/api/task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          const savedTask = await response.json();
          setTasks([...tasks, savedTask]);
          setFieldsVisible(false);
          setTaskDescription("");
          setDueDate("");
          setTaskStatus("Pending");
        } else {
          alert("Failed to save the task.");
        }
      } catch (error) {
        console.error("Error saving task:", error);
        alert("Failed to save the task.");
      }
    } else {
      alert("Please fill in both fields.");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
        setTasks(updatedTasks);
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete the task.");
    }
  };
   // Fetch active tasks
   useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:5000/task");
        const data = await response.json();
        setTasks(data.filter(task => !task.task_is_history));
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      }
    };

    fetchTasks();
  }, []);

//    Fetch history tasks when the History button is clicked
   useEffect(() => {
    const fetchHistory = async () => {
      if (isHistoryVisible) {
        try {
          const response = await fetch("http://localhost:5000/task/history");
          const data = await response.json();
          setHistoryTasks(data); // Update history tasks state
        } catch (error) {
          console.error("Error fetching history tasks: ", error);
        }
      }
    };

    fetchHistory();
  }, [isHistoryVisible]); 

  const handleEditSave = async () => {
    if (selectedTask) {
      const updatedTask = {
        task_desc: taskDescription,
        task_due_date: dueDate,
        task_status: taskStatus,
      };

      try {
        const response = await fetch(
          `http://localhost:5000/task/${selectedTask.task_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTask),
          }
        );

        if (response.ok) {
          const updatedTaskData = await response.json();
          setTasks(
            tasks.map((task) =>
              task.task_id === updatedTaskData.task_id ? updatedTaskData : task
            )
          );
          setIsEditing(false);
          setFieldsVisible(false);
          setSelectedTask(null);
          setTaskDescription("");
          setDueDate("");
          setTaskStatus("Pending");
        } else {
          alert("Failed to update task.");
        }
      } catch (error) {
        console.error("Error updating task: ", error);
        alert("Failed to update task.");
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/task/${taskId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_history: true }), // Mark the task as complete
      });

      if (response.ok) {
        const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
        window.location.reload();
        setTasks(updatedTasks);
      } else {
        alert("Failed to mark task as complete.");
      }
    } catch (error) {
      console.error("Error completing task: ", error);
      alert("Failed to complete the task.");
    }
  };

  const handleEditBtn = (task) => {
    setIsEditing(true);
    setSelectedTask(task);
    setTaskDescription(task.task_desc);
    setDueDate(task.task_due_date.split("T")[0]);
    setTaskStatus(task.task_status);
    setFieldsVisible(true);
  };

  const handleAddBtn = () => {
    setFieldsVisible(true);
  };

  const handleCancelBtn = () => {
    setFieldsVisible(false);
    setIsEditing(false);
    setSelectedTask(null);
    setTaskDescription("");
    setDueDate("");
    setTaskStatus("Pending");
  };

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible); // Toggle history visibility
  };

  const displayTasks = isHistoryVisible ? historyTasks : tasks;


  return (
    <div className="bg-[#dcc5d3] min-h-screen overflow-x-hidden flex flex-col">
      <nav className="bg-[#c6a0b6] w-full p-4 shadow-md flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">VATask</h1>
        <div className="relative flex space-x-4">
        <button
            onClick={toggleHistory}
            className={`bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform ${
              isHistoryVisible ? 'bg-[#f6f4d2] text-[#915f78]' : ''
            }`}
          >
            <MdHistory />
          </button>
          <button
            className="bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform"
            onClick={() => setIsChatbotVisible(!isChatbotVisible)}
          >
            <LuBotMessageSquare />
          </button>
          <div className="relative">
            <button
              className="bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform"
              onClick={() => setIsProfileDropdownVisible(!isProfileDropdownVisible)}
            >
              <FaRegUserCircle />
            </button>
            {isProfileDropdownVisible && (
              <div className="absolute right-0 mt-2 w-35 bg-white rounded-md shadow-md z-10">
                <button
                  className="w-full text-sm px-4 py-2 text-left text-[#6e4658] hover:bg-[#c6a0b6] hover:text-white transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="flex flex-col lg:flex-row flex-grow p-4 gap-4">
        <div
          className={`bg-[#915f78] rounded-2xl overflow-hidden flex flex-col shadow-lg ${
            isChatbotVisible ? "w-full lg:w-3/5" : "w-full"
          }`}
        >
          <h2 className="text-xl text-white p-5">
            {isHistoryVisible ? "Completed Tasks" : "To-Do List"}
          </h2>

          {!isHistoryVisible && (
            <div className="flex px-4 sm:px-6 py-2 bg-[#6e4658]">
              <input
                type="text"
                placeholder="Search tasks..."
                className="flex-grow p-2.5 border-none bg-transparent text-white placeholder-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-[#f6f4d2]"
              />
              <button
                onClick={handleAddBtn}
                className="bg-white text-[#6d597a] text-base p-3 rounded-full ml-2 transition-colors duration-300 hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform"
              >
                <FaPlus />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto flex-grow">
            {displayTasks.map((task) => (
              <div
                key={task.task_id}
                className="bg-[#6e4658] rounded-xl p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-grow">
                  <p className="text-white text-sm">
                    Due: {new Date(task.task_due_date).toLocaleDateString("en-CA")}
                  </p>
                  <p className="text-white text-sm">
                    Status: {isHistoryVisible ? "Completed" : task.task_status}
                  </p>
                  <p className="text-white font-semibold mt-2 mb-1">Task:</p>
                  <p className="text-white break-words overflow-y-auto max-h-[100px]">
                    {task.task_desc}
                  </p>
                </div>

                {!isHistoryVisible && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      className="p-2 rounded-full bg-[#c6a0b6] hover:bg-[#b189a3] transition-transform duration-200 hover:scale-105"
                      onClick={() => handleCompleteTask(task.task_id)}
                    >
                      <IoCheckmarkDoneCircleSharp className="text-xl text-white" />
                    </button>
                    <button
                      onClick={() => handleEditBtn(task)}
                      className="p-2 rounded-full bg-[#c6a0b6] hover:bg-[#b189a3] transition-transform duration-200 hover:scale-105"
                    >
                      <RiEditCircleFill className="text-xl text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.task_id)}
                      className="p-2 rounded-full bg-[#c6a0b6] hover:bg-[#b189a3] transition-transform duration-200 hover:scale-105"
                    >
                      <MdDelete className="text-xl text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {isChatbotVisible && (
          <div className="w-full lg:w-2/5 mt-4 lg:mt-0">
            <Chatbot
              isChatbotVisible={isChatbotVisible}
              setIsChatbotVisible={setIsChatbotVisible}
            />
          </div>
        )}
      </div>

      {fieldsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#6e4658] rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-2xl text-white mb-4">
              {isEditing ? "Edit Task" : "Add Task"}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-white mb-1">Due Date</p>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-white text-[#6e4658]"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <p className="text-white mb-1">Task Description</p>
                <textarea
                  placeholder="Enter task description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full p-2 h-32 rounded resize-none bg-white text-[#6e4658]"
                />
              </div>
              {/* <div>
                <p className="text-white mb-1">Status</p>
                <select
                  className="w-full p-2 rounded bg-white text-[#6e4658]"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div> */}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCancelBtn}
                  className="px-4 py-2 bg-[#dcc5d3] text-[#6e4658] rounded-md hover:bg-[#c6a0b6] hover:text-white transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? handleEditSave : handleSaveBtn}
                  className="px-4 py-2 bg-[#dcc5d3] text-[#6e4658] rounded-md hover:bg-[#c6a0b6] hover:text-white transition-all duration-200 transform hover:scale-105"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask;