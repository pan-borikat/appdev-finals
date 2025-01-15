import React, { useState } from "react";
import { FaPencilAlt, FaCheck } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useGlobalContext } from "./GlobalProvider";

const DisplayTask = ({ tasks, setTasks }) => {
    const { globalVariable, setGlobalVariable } = useGlobalContext();
    const { tasks } = globalVariable;
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedText, setEditedText] = useState("");

    const deleteTask = (taskId) => {
        setGlobalVariable({
            ...globalVariable,
            tasks: tasks.filter((task) => task.id !== taskId)
        });
    };

    const toggleTaskDone = (taskId) => {
        setGlobalVariable({
            ...globalVariable,
            tasks: tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
            ),
        });
    };

    const startEditing = (taskId, text) => {
        setEditingTaskId(taskId);
        setEditedText(text);
    };

    const saveTaskEdit = (taskId) => {
        setGlobalVariable({
            ...globalVariable,
            tasks: tasks.map((task) =>
                task.id === taskId ? { ...task, text: editedText } : task
            ),
        });
        setEditingTaskId(null);
        setEditedText("");
    };

    return (
        <div>
            <ul className="my-0.5 p-2.5 rounded-lg border-t-2 border-b-2 border-[#f6f4d2]">
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        className={`flex items-center p-4 rounded-lg shadow-md transition duration-300 ${
                            task.done ? "line-through text-[#b2b2b2]" : "text-white"
                        }`}
                    >
                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mr-6 flex-shrink-0">
                            {/* Toggle Done Button */}
                            <button
                                onClick={() => toggleTaskDone(task.id)}
                                className="border-none bg-transparent text-[#f6f4d2] cursor-pointer p-1.25 transition-colors duration-300 hover:text-[#6d597a]"
                            >
                                <FaCheck />
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="border-none bg-transparent text-[#f6f4d2] cursor-pointer p-1.25 transition-colors duration-300 hover:text-[#6d597a]"
                            >
                                <RiDeleteBin6Fill />
                            </button>

                            {/* Edit/Save Button */}
                            {editingTaskId === task.id ? (
                                <button
                                    onClick={() => saveTaskEdit(task.id)}
                                    className="border-none bg-transparent text-[#f6f4d2] cursor-pointer p-1.25 transition-colors duration-300 hover:text-[#6d597a]"
                                >
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => startEditing(task.id, task.text)}
                                    className="border-none bg-transparent text-[#f6f4d2] cursor-pointer p-1.25 transition-colors duration-300 hover:text-[#6d597a]"
                                >
                                    <FaPencilAlt />
                                </button>
                            )}
                        </div>
                        {editingTaskId === task.id ? (
                            <input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        ) : (
                            <span className={`w-full ${task.done ? 'line-through' : ''}`}>{task.text}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DisplayTask;
