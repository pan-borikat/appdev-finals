import React, { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import DisplayTask from './DisplayTask';

const AddTask = () => {
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState('');

    const handleAddTask = () => {
        if (taskInput.trim()) {
            const newTask = { id: Date.now(), text: taskInput, done: false };
            setTasks([...tasks, newTask]);
            setTaskInput('');
        }
    };

    return (
        <div className='bg-[#915f78] min-h-screen flex items-right justify-right'>
        <div className="m-5 w-96">
            <h1 className="font-patrick hand text-3xl text-white text-left m-0">To-Do List</h1>
            {/* Input and Add Button */}
            <div className="flex items-center mt-2.5 py-2.5">
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Add a task"
                    id="taskInput"
                    className="flex-grow p-2.5 border-none bg-transparent text-white font-poppins font-medium text-base placeholder-gray-300 outline-none focus:outline focus:outline-2 focus:outline-[#f6f4d2] outline-2 outline-[#8d738f] hover:outline-[#f6f4d2]"
                />
                <button
                    onClick={handleAddTask}
                    disabled={!taskInput.trim()}
                    className="border-none bg-white text-[#6d597a] text-base p-1 rounded ml-2.5 mr-5 transition-colors duration-300 hover:bg-[#8d738f]"
                >
                    <FaPlus />
                </button>
            </div>
            {/* Task List */}
            {tasks.length > 0 && <DisplayTask tasks={tasks} setTasks={setTasks} />}
        </div>
        </div>
    );
};

export default AddTask;
