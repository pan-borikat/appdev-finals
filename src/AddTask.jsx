import React, { useEffect, useState, useCallback } from "react"
import { FaPlus, FaRegUser } from "react-icons/fa"
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5"
import { RiEditCircleFill } from "react-icons/ri"
import { IoNotificationsSharp } from "react-icons/io5"
import { MdDelete, MdHistory } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "./Auth"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"


const checkTaskStatus = (task) => {
  const today = new Date()
  const dueDate = new Date(task.task_due_date)
  const timeDiff = dueDate.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysDiff < 0) {
    return "overdue"
  } else if (daysDiff === 0) {
    return "due-today"
  } else if (daysDiff === 1) {
    return "due-tomorrow"
  } else {
    return "upcoming"
  }
}

const getContrastColor = (hexColor) => {
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}

const getTaskScore = (task) => {
  if (!task || !task.task_due_date || !task.task_status) {
    return 0;
  }

  const dueDate = new Date(task.task_due_date);
  const currentDate = new Date();
  const daysUntilDue = Math.max(0, Math.ceil((dueDate - currentDate) / (1000 * 3600 * 24)));

  // Urgency scoring
  const urgencyScore = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1,
  };

  const urgency = urgencyScore[task.task_status.toLowerCase()] || 0;

  // Normalize scores for better sorting priority
  const normalizedDueDateScore = daysUntilDue > 30 ? 0 : (30 - daysUntilDue) / 30;

  // Combine urgency and due date scores
  return urgency * 100 + normalizedDueDateScore * 100; // Weight urgency higher
};



const TaskCalendar = ({ tasks, onTaskUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isSelectingYear, setIsSelectingYear] = useState(false)
  const [isSelectingMonth, setIsSelectingMonth] = useState(false)

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))
  }

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))
  }

  const handleMonthYearClick = () => {
    if (isSelectingYear) {
      setIsSelectingYear(false)
      setIsSelectingMonth(true)
    } else if (isSelectingMonth) {
      setIsSelectingMonth(false)
      setIsSelectingYear(true)
    } else {
      setIsSelectingMonth(true)
    }
  }

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1))
    setIsSelectingYear(false)
  }

  const handleMonthSelect = (month) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1))
    setIsSelectingMonth(false)
  }

  const getTasksForCurrentMonth = useCallback(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    return tasks
      .filter(task => {
        const taskDate = parseISO(task.task_due_date);
        return taskDate >= start && taskDate <= end;
      })
      .sort((a, b) => {
        const scoreA = getTaskScore(a);
        const scoreB = getTaskScore(b);
        return scoreB - scoreA; // Sort by score descending
      });
  }, [currentDate, tasks]);



  const tasksForCurrentMonth = getTasksForCurrentMonth()
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const getTaskColor = (status) => {
    switch (status?.toLowerCase()) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-yellow-200"
      case "normal":
        return "bg-blue-200"
      case "low":
        return "bg-purple-200"
      default:
        return "bg-gray-200"
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const sourceDate = result.source.droppableId
    const destinationDate = result.destination.droppableId
    const taskId = result.draggableId

    if (sourceDate !== destinationDate) {
      const updatedTask = tasksForCurrentMonth.find((task) => task.task_id.toString() === taskId)
      if (updatedTask) {
        const newDueDate = new Date(destinationDate)
        updatedTask.task_due_date = format(newDueDate, "yyyy-MM-dd")
        onTaskUpdate(updatedTask)
      }
    }
  }

  const years = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i)

  return (
    <div
      className="calendar-container w-1/3 bg-white rounded-lg shadow-lg p-4 mt-7 mr-3 overflow-auto"
      style={{ maxHeight: "80vh" }}
    >
      <div className="calendar-header mb-4 flex justify-between items-center">
        <button onClick={handlePrevMonth} className="text-lg">
          &lt;
        </button>
        <h2
          className="text-xl font-[Poppins] font-medium text-[#6e4658] mx-auto cursor-pointer"
          onClick={handleMonthYearClick}
        >
          {isSelectingYear ? "Select Year" : isSelectingMonth ? "Select Month" : format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={handleNextMonth} className="text-lg">
          &gt;
        </button>
      </div>

      {!isSelectingYear && !isSelectingMonth ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col">
            {daysInMonth.map((day, index) => {
              const dayTasks = tasksForCurrentMonth.filter((task) => {
                const taskDate = parseISO(task.task_due_date)
                return taskDate.getDate() === day.getDate()
              })

              return (
                <Droppable key={format(day, "yyyy-MM-dd")} droppableId={format(day, "yyyy-MM-dd")}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`border-b border-gray-300 p-2 relative flex flex-col min-h-[60px] ${snapshot.isDraggingOver ? "bg-gray-100" : ""
                        }`}
                    >
                      <div className="text-gray-700 font-medium mb-2">{format(day, "d")}</div>
                      <div className="flex flex-col space-y-1">
                        {dayTasks.map((task, taskIndex) => (
                          <Draggable
                            key={task.task_id.toString()}
                            draggableId={task.task_id.toString()}
                            index={taskIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-event rounded-md p-2 text-black font-normal ${getTaskColor(task.task_status)} ${snapshot.isDragging ? "opacity-50" : ""
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{task.task_desc}</span>
                                  {task.task_tag && (
                                    <span
                                      className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${task.tag_color || ""} text-gray-800`}
                                    >
                                      {task.task_tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>
      ) : isSelectingYear ? (
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              className="p-2 text-[#6e4658] hover:bg-[#dcc5d3] rounded"
            >
              {year}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleMonthSelect(i)}
              className="p-2 text-[#6e4658] hover:bg-[#dcc5d3] rounded"
            >
              {format(new Date(currentDate.getFullYear(), i, 1), "MMM")}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const AddTask = () => {
  const [tasks, setTasks] = useState([])
  const [fieldsVisible, setFieldsVisible] = useState(false)
  const [taskDescription, setTaskDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [historyTasks, setHistoryTasks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [isNotificationVisible, setIsNotificationVisible] = useState(false) // Added state
  const [sortBy, setSortBy] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskSuggestions, setTaskSuggestions] = useState([]);
  const { user } = useAuth()
  const navigate = useNavigate()

  const [taskDay, setTaskDay] = useState("");
  const [calculatedDueDate, setCalculatedDueDate] = useState(null);


  const extractDayOrDateFromDescription = (description) => {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const weekendDays = ["sunday", "saturday"];

    const lowerCaseDescription = description.toLowerCase();

    try {
      const parsedDate = new Date(lowerCaseDescription);
      if (!isNaN(parsedDate)) {
        return parsedDate.toLocaleDateString('en-CA').split('T')[0];
      }
    } catch (error) {

    }


    for (const day of daysOfWeek) {
      if (lowerCaseDescription.includes(day)) {
        return day;
      }
    }

    if (lowerCaseDescription.includes("weekend") || lowerCaseDescription.includes("weekends")) {
      return "weekend";
    }

    return "";
  };

  useEffect(() => {
    const extractedDayOrDate = extractDayOrDateFromDescription(taskDescription);
    setTaskDay(extractedDayOrDate);

    if (extractedDayOrDate) {
      let targetDate;

      if (extractedDayOrDate.includes("-")) {
        targetDate = new Date(extractedDayOrDate);
        if (isNaN(targetDate)) {
          setCalculatedDueDate(null);
          setDueDate("");
          return;
        }
        targetDate.setHours(0, 0, 0, 0)
      } else if (extractedDayOrDate === "weekend") {
        targetDate = new Date();
        targetDate.setHours(0, 0, 0, 0);
        const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        while (!["saturday", "sunday"].includes(daysOfWeek[targetDate.getDay()].toLowerCase())) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
      } else {
        targetDate = new Date();
        targetDate.setHours(0, 0, 0, 0);
        const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        const targetDayIndex = daysOfWeek.indexOf(extractedDayOrDate);
        let currentDayIndex = targetDate.getDay();

        while (daysOfWeek[currentDayIndex].toLowerCase() !== extractedDayOrDate) {
          targetDate.setDate(targetDate.getDate() + 1);
          currentDayIndex = targetDate.getDay();
        }
      }

      if (targetDate) {
        setCalculatedDueDate(targetDate);
        const formattedDate = targetDate.toLocaleDateString("en-CA");
        setDueDate(formattedDate);
      }

    } else {
      setCalculatedDueDate(null);
      setDueDate("");
    }
  }, [taskDescription]);


  useEffect(() => {
    if (taskDescription.length > 1) {
      const similarTasks = tasks.filter(task =>
        task.task_desc.toLowerCase().includes(taskDescription.toLowerCase()) && task.task_desc !== taskDescription
      );
      setTaskSuggestions(similarTasks.slice(0, 1));
    } else {
      setTaskSuggestions([]);
    }
  }, [taskDescription, tasks]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value); // Update sort option
  };

  // Function to get tasks for a specific day
  const getTasksByDay = (tasks) => {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString("en-CA").split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.task_due_date).toLocaleDateString("en-CA").split('T')[0];
      return taskDate === dateStr;
    }).sort((a, b) => {
      // Sort by task score (which includes urgency) in descending order
      return getTaskScore(b) - getTaskScore(a);
    });
  };

  // Function to get tasks for the current week
  const getTasksByWeek = (tasks, weekStartDate) => {
    const start = startOfWeek(weekStartDate, { weekStartsOn: 1 }); // Week starts on Monday
    const end = endOfWeek(weekStartDate, { weekStartsOn: 1 });

    return tasks.filter(task => {
      const taskDate = new Date(task.task_due_date);
      return isWithinInterval(taskDate, { start, end });
    }).sort((a, b) => {
      // First group by day within the week
      const dateA = new Date(a.task_due_date);
      const dateB = new Date(b.task_due_date);
      const dateDiff = dateA.getTime() - dateB.getTime();

      if (dateDiff !== 0) return dateDiff;

      // If same day, sort by task score
      return getTaskScore(b) - getTaskScore(a);
    });
  };

  // Function to get tasks for the current month
  const getTasksByMonth = (tasks, monthStartDate) => {
    const start = startOfMonth(monthStartDate);
    const end = endOfMonth(monthStartDate);

    return tasks.filter(task => {
      const taskDate = new Date(task.task_due_date);
      return isWithinInterval(taskDate, { start, end });
    }).sort((a, b) => {
      // First group by week
      const dateA = new Date(a.task_due_date);
      const dateB = new Date(b.task_due_date);
      const weekA = Math.floor((dateA.getDate() - 1) / 7);
      const weekB = Math.floor((dateB.getDate() - 1) / 7);

      if (weekA !== weekB) return weekA - weekB;

      // If same week, sort by date
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;

      // If same date, sort by task score
      return getTaskScore(b) - getTaskScore(a);
    });
  };

  // Main filtering function
  const getFilteredTasks = useCallback(() => {
    const tasksToFilter = isHistoryVisible ? historyTasks : tasks;
    if (!tasksToFilter.length) return [];

    switch (sortBy) {
      case "days":
        return getTasksByDay(tasksToFilter);
      case "week":
        return getTasksByWeek(tasksToFilter, new Date());
      case "month":
        return getTasksByMonth(tasksToFilter, new Date());
      default:
        // Return all tasks sorted by task score
        return tasksToFilter.sort((a, b) => getTaskScore(b) - getTaskScore(a));
    }
  }, [sortBy, tasks, historyTasks, isHistoryVisible]);


  const filteredTasks = getFilteredTasks();

  const fetchUserTasks = useCallback(async () => {
    if (!user) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token is missing. User may not be logged in.")
      navigate("/")
      return
    }

    try {
      const response = await axios.get(`http://localhost:5000/task`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: { user: user.id },
      })

      if (response.status === 200) {
        const filteredTasks = response.data.filter((task) => !task.task_is_history)
        setTasks(filteredTasks)
      } else {
        console.error("Failed to fetch tasks:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        navigate("/")
      }
    }
  }, [user, navigate])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
    }
  }, [navigate])

  useEffect(() => {
    fetchUserTasks()

    const handleFocus = () => {
      fetchUserTasks()
    }

    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [fetchUserTasks])

  useEffect(() => {
    const fetchHistory = async () => {
      if (isHistoryVisible) {
        try {
          const response = await axios.get("http://localhost:5000/task/history", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          setHistoryTasks(response.data)
        } catch (error) {
          console.error("Error fetching history tasks: ", error)
        }
      }
    }

    fetchHistory()
  }, [isHistoryVisible])

  useEffect(() => {
    const checkNotifications = () => {
      const newNotifications = []
      const newOverdueTasks = []

      tasks.forEach((task) => {
        const status = checkTaskStatus(task)
        if (status === "due-today") {
          newNotifications.push(`Task "${task.task_desc}" is due today!`)
        } else if (status === "due-tomorrow") {
          newNotifications.push(`Task "${task.task_desc}" is due tomorrow!`)
        } else if (status === "overdue") {
          newOverdueTasks.push(task)
        }
      })

      setNotifications(newNotifications)
      setOverdueTasks(newOverdueTasks)
    }

    checkNotifications()
  }, [tasks])

  const handleTaskUpdate = async (updatedTask) => {
    try {
      const response = await axios.put(`http://localhost:5000/task/${updatedTask.task_id}`, updatedTask, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.status === 200) {
        await fetchUserTasks()
      } else {
        console.error("Failed to update task:", response.statusText)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        navigate("/")
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const handleSaveBtn = async () => {
    if (!user) {
      alert("You must be logged in to add a task.")
      return
    }

    if (!calculatedDueDate) {
      alert("Please specify a valid day or date in the task description (e.g., 'Buy groceries on Monday' or '2024-03-22').");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/task",
        {
          user_id: user.id,
          task_desc: taskDescription,
          task_due_date: dueDate,
          task_status: taskStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      if (response.status === 201) {
        alert("Task created successfully")
        setTaskDescription("")
        setDueDate("")
        setTaskStatus("Low")
        setFieldsVisible(false)
        await fetchUserTasks()
      } else {
        alert(response.data.error)
      }
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Error creating task")
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        navigate("/")
      }
    }
  }

  const handleDelete = async (taskId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.status === 200) {
        await fetchUserTasks()
      } else {
        alert("Failed to delete the task.")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Failed to delete the task.")
    }
  }

  const handleEditSave = async () => {
    if (selectedTask) {
      const updatedTask = {
        user_id: user.id,
        task_desc: taskDescription,
        task_due_date: dueDate,
        task_status: taskStatus,
      }

      try {
        const response = await axios.put(`http://localhost:5000/task/${selectedTask.task_id}`, updatedTask, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.status === 200) {
          await fetchUserTasks()
          setIsEditing(false)
          setFieldsVisible(false)
          setSelectedTask(null)
          setTaskDescription("")
          setDueDate("")
          setTaskStatus("Low")
        } else {
          alert("Failed to update task.")
        }
      } catch (error) {
        console.error("Error updating task:", error)
        alert("Failed to update task.")
      }
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/task/${taskId}/complete`,
        { is_history: true },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      if (response.status === 200) {
        await fetchUserTasks()
      } else {
        alert("Failed to mark task as complete.")
      }
    } catch (error) {
      console.error("Error completing task: ", error)
      alert("Failed to complete the task.")
    }
  }

  const handleEditBtn = (task) => {
    const formattedDate = new Date(task.task_due_date).toLocaleDateString("en-CA")
    setIsEditing(true)
    setSelectedTask(task)
    setTaskDescription(task.task_desc)
    setDueDate(formattedDate)
    setTaskStatus(task.task_status)
    setFieldsVisible(true)
  }

  const handleAddBtn = () => {
    setFieldsVisible(true)
  }

  const handleCancelBtn = () => {
    setFieldsVisible(false)
    setIsEditing(false)
    setSelectedTask(null)
    setTaskDescription("")
    setDueDate("")
    setTaskStatus("Low")
  }

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible)
  }

  const displayTasks = (isHistoryVisible ? historyTasks : tasks).sort((a, b) => getTaskScore(b) - getTaskScore(a))

  return (
    <div className="bg-[#dcc5d3] min-h-screen overflow-x-hidden flex flex-col">
      <nav className="bg-[#c6a0b6] w-full p-4 shadow-md flex justify-between items-center">
        <h1 className="text-white text-2xl ml-4  font-semibold">VATask</h1>
        <div className="relative flex space-x-4">
          <button
            className="bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform transition-all duration-300"
            onClick={() => setIsNotificationVisible(!isNotificationVisible)}
          >
            <IoNotificationsSharp />
            {notifications.length + overdueTasks.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length + overdueTasks.length}
              </span>
            )}
          </button>
          <button
            onClick={toggleHistory}
            className={`bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform transition-all duration-300 ${isHistoryVisible ? "bg-[#f6f4d2] text-[#915f78]" : ""
              }`}
          >
            <MdHistory className="text-xl" />
          </button>
          <div className="relative">
            <button
              className="bg-gradient-to-r from-[#915f78] to-[#882054] text-white p-2 rounded-full shadow-lg hover:bg-[#f6f4d2] hover:text-[#915f78] hover:scale-105 transform transition-all duration-300"
              onClick={() => setIsProfileDropdownVisible(!isProfileDropdownVisible)}
            >
              <FaRegUser className="text-xl" />
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

      <div className="flex">
        <div className="task-container  mt-4 w-2/3 inline-block p-4">
          <div className="w-full bg-[#6e4658] p-4 flex justify-between items-center ">
            <h2 className="text-xl text-white ml-1 font-[Poppins] font-normal">
              {isHistoryVisible ? "Completed Tasks" : "To-Do List"}
            </h2>
            {!isHistoryVisible && (
              <div className="flex items-center">
                <span className="text-white mr-4">Overdue Tasks: {overdueTasks.length}</span>
                <select className="text-black bg-[#c6a0b6] p-2 rounded-[10px] mr-4 text-[12px]"
                  value={sortBy}
                  onChange={handleSortChange}>
                  <option>Sort by</option>
                  <option value="days">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
                <button
                  onClick={handleAddBtn}
                  className="text-white bg-gradient-to-r from-[#915f78] to-[#882054] p-2 rounded-full"
                >
                  <FaPlus />
                </button>
              </div>
            )}
          </div>

          <div className="task-list-container rounded">
            <div className="overflow-y-auto max-h-[500px]   scrollbar-thin scrollbar-thumb-[#6e4658] scrollbar-track-[#6e4658] scrollbar-thumb-rounded">
              {filteredTasks.map((task) => (
                <div
                  key={task.task_id}
                  className="task-row bg-[#6e4658] flex justify-between items-center hover:bg-[#b189a3] transition-all duration-300 relative group "
                >
                  <div className="flex-1 flex items-center">
                    <div className="flex items-center space-x-2 ml-4">
                      <div
                        className={`px-3 py-1 rounded-md text-xs font-medium mb-4 mt-3 mr-4 ${task.task_status?.toLowerCase() === "urgent"
                          ? "bg-red-600 text-red-100"
                          : task.task_status?.toLowerCase() === "high"
                            ? "bg-yellow-200 text-yellow-800"
                            : task.task_status?.toLowerCase() === "normal"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-purple-200 text-purple-800"
                          }`}
                      >
                        {new Date(task.task_due_date)
                          .toLocaleDateString("en-US", {
                            year: "2-digit",
                            month: "2-digit",
                            day: "2-digit",
                          })
                          .replace(/\//g, "-")}
                      </div>
                      <p className="text-white text-sm ml-5 mr-4 mb-4 mt-3">{task.task_desc}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2 mb-2 mr-5 opacity-0 group-hover:opacity-100 items-center transition-opacity duration-200">
                    {!isHistoryVisible && (
                      <>
                        <button
                          className="p-2 rounded-full bg-[#c6a0b6] hover:bg-[#b189a3] transition-transform duration-200 hover:scale-105"
                          onClick={() => handleCompleteTask(task.task_id)}
                        >
                          <IoCheckmarkDoneCircleSharp className="text-xl text-white" />
                        </button>
                        <button
                          onClick={() => handleEditBtn(task)}
                          className="p-2 rounded-full bg-[#c6a0b6] hover:bg-[#b189a3] items-center transition-transform duration-200 hover:scale-105"
                        >
                          <RiEditCircleFill className="text-xl text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.task_id)}
                          className="p-2 rounded-full bg-[#c6a0b6] hover:bg-[#b189a3] transition-transform duration-200 hover:scale-105"
                        >
                          <MdDelete className="text-xl text-white" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TaskCalendar tasks={tasks} onTaskUpdate={handleTaskUpdate} />
      </div>

      {(notifications.length > 0 || overdueTasks.length > 0) &&
        isNotificationVisible && ( // Added isNotificationVisible check
          <div className="notif-parent fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="notif-subparent bg-[#6e4658] rounded-xl w-full max-w-md p-6 shadow-xl">
              <h3 className="text-xl text-white mb-4">Notifications</h3>
              <div className="notif-con max-h-60 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <p key={`notification-${index}`} className="text-white mb-2">
                    {notification}
                  </p>
                ))}
                {overdueTasks.map((task, index) => (
                  <p key={`overdue-${index}`} className="mb-2 text-red-300">
                    Overdue: {task.task_desc} (Due: {new Date(task.task_due_date).toLocaleDateString()})
                  </p>
                ))}
              </div>
              <button
                onClick={() => setIsNotificationVisible(false)}
                className="mt-4 px-4 py-2 bg-[#dcc5d3] text-[#6e4658] rounded-md hover:bg-[#c6a0b6] hover:text-white transition-all duration-200 transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        )}

      {fieldsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#6e4658] rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className=" text-2xl text-white mb-4">{isEditing ? "Edit Task" : "Add Task"}</h2>
            <div className="space-y-4">
              {/* <div>
                <p className="text-white mb-1">Due Date</p>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-white text-[#6e4658]"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div> */}
              <div>
                <p className="text-white mb-1">Task Description</p>
                <textarea
                  placeholder="Enter task description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full p-2 h-32 rounded resize-none bg-white text-[#6e4658]"
                />

                {taskSuggestions.length > 0 && ( 
                    <ul className="mt-2 border border-gray-300 rounded bg-white">
                        {taskSuggestions.map(suggestion => (
                            <li
                                key={suggestion.task_id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => setTaskDescription(suggestion.task_desc)} 
                            >
                                {suggestion.task_desc}
                            </li>
                        ))}
                    </ul>
                )}
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
  )
}

export default AddTask

