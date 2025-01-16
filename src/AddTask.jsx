import React, { useEffect, useState } from "react";
import { FaPlus, FaRegUserCircle } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { RiEditCircleFill } from "react-icons/ri";
import { MdDelete, MdHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from './Auth';

const AddTask = () => {
  const [tasks, setTasks] = useState([]);
  const [fieldsVisible, setFieldsVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); 
  const [historyTasks, setHistoryTasks] = useState([]); 
  const { user } = useAuth(); // Get the logged-in user from context

  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/"); 
  };

  useEffect(() => {
    if (user) {
      const fetchUserTasks = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/task?user=${user.id}`);
          if (response.ok) {
            const tasks = await response.json();
            setTasks(tasks.filter((task) => !task.task_is_history));
          } else {
            console.error("Failed to fetch tasks.");
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchUserTasks();
    }
  }, [user]);

  const handleSaveBtn = async () => {
    if (!user) {
      alert('You must be logged in to add a task.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token in header
        },
        body: JSON.stringify({
          user_id: user.id, // Pass logged-in user's id
          task_desc: taskDescription,
          task_due_date: dueDate,
          task_status: taskStatus,
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        alert('Task created successfully');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  
  

  const handleDelete = async (taskId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/task/${taskId}`, {
      });

      if (response.ok) {
        const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
        setTasks(updatedTasks);
      } else {
        alert("Failed to delete the task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete the task.");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (isHistoryVisible) {
        try {
          const response = await axios.get("http://localhost:5000/task/history");
          const data = await response.json();
          setHistoryTasks(data);
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
        user_id: user,
        task_desc: taskDescription,
        task_due_date: dueDate,
        task_status: taskStatus,
      };

      try {
        const response = await axios.put(`http://localhost:5000/task/${selectedTask.task_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        });

        if (response.ok) {
          const updatedTaskData = await response.json();
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.task_id === updatedTaskData.task_id ? updatedTaskData : task
            )
          );
          setIsEditing(false);
          setFieldsVisible(false);
          setSelectedTask(null);
          setTaskDescription("");
          setDueDate("");
          setTaskStatus("Low");
        } else {
          alert("Failed to update task.");
        }
      } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task.");
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await axios.put(`http://localhost:5000/task/${taskId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_history: true }),
      });

      if (response.ok) {
        const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
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
    const formattedDate = new Date(task.task_due_date).toLocaleDateString("en-CA");

    setIsEditing(true);
    setSelectedTask(task);
    setTaskDescription(task.task_desc);
    setDueDate(formattedDate);
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
    setTaskStatus("Low");
  };

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const resetFields = () => {
    setTaskDescription("");
    setDueDate("");
    setTaskStatus("Low");
  };

  const displayTasks = isHistoryVisible ? historyTasks : tasks;

  return (
    <div className="bg-[#dcc5d3] min-h-screen overflow-x-hidden flex flex-col">
      <nav className="bg-[#c6a0b6] w-full p-4 shadow-md flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">VATask</h1>
        <div className="relative flex space-x-4">
          <button
            onClick={toggleHistory}
            className={`bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform transition-all duration-300 ${
              isHistoryVisible ? 'bg-[#f6f4d2] text-[#915f78]' : ''
            }`}
          >
            <MdHistory className="text-xl" />
          </button>
          <div className="relative">
            <button
              className="bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform transition-all duration-300"
              onClick={() => setIsProfileDropdownVisible(!isProfileDropdownVisible)}
            >
              <FaRegUserCircle className="text-xl" />
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
      <div className="flex flex-col flex-grow p-4 gap-4">
        <div className="w-full bg-[#6e4658] rounded-lg p-4 flex justify-between items-center">
          <h2 className="text-xl text-white">
            {isHistoryVisible ? "Completed Tasks" : "To-Do List"}
          </h2>
          {!isHistoryVisible && (
            <button
              onClick={handleAddBtn}
              className="bg-white text-[#6d597a] text-base p-3 rounded-full transition-all duration-300 hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform"
            >
              <FaPlus />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-grow">
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
              <div>
                <p className="text-white mb-1">Priority</p>
                <select
                  className="w-full p-2 rounded bg-white text-[#6e4658]"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                >
                  <option value="">Set Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

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

