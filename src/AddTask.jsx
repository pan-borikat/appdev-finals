import React, { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { RiEditCircleFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";

import DisplayTask from './DisplayTask';

const AddTask = () => {
    const [tasks, setTasks] = useState([]);
    const [fieldsVisible, setFieldsVisible] = useState(false);
    const [taskDescription, setTaskDescription] = useState('');
    const [taskStatus, setTaskStatus] = useState('Pending');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await fetch('http://localhost:5000/task');
                    const data = await response.json();
                    setTasks(data);
                } catch (error) {
                    console.error('Error fetching data: ', error);
                }
            }

            fetchData();
        }, []);

    const handleSaveBtn = async () => {
        if (taskDescription && dueDate) {
            const newTask = {
                task_desc: taskDescription,  
                task_due_date: dueDate,
                task_status: taskStatus,
            };

            console.log(newTask);

            try {
                const response = await fetch('http://localhost:5000/api/task', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newTask),
                });

                if (response.ok) {
                    const savedTask = await response.json();
                    setTasks([...tasks, savedTask]); 
                    setFieldsVisible(false); 
                    setTaskDescription(''); 
                    setDueDate('');
                    setTaskStatus('Pending');
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
                method: 'DELETE',
            })

            if (response.ok){
                const updatedTasks = tasks.filter(task => task.task_id !== taskId);
                setTasks(updatedTasks);
            } else{
                alert('Failed to delete')
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete the task.");
        }
    } 

    const handleAddBtn = () => {
        setFieldsVisible(true);
    }

    const handleCancelBtn = () => {
        setFieldsVisible(false);
    }




    return (
        <div className='bg-[#dcc5d3] min-h-screen overflow-hidden flex flex-col'>
            <div className='navbar bg-[#c6a0b6] w-full h-12 p-7'></div>
            <div className='flex h-[94svh]' >
                <div className="bg-[#915f78] mt-5 mr-5 mb-10 ml-10 w-[60%] rounded-2xl">
                    <h1 className="font-patrick hand text-4xl text-white text-left m-5">To-Do List</h1>

                    {/* Input and Add Button */}
                    <div className="search-add-con flex ml-8 m-5 py-2">
                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-grow p-2.5 border-none bg-transparent text-white font-poppins font-medium text-base placeholder-gray-300 outline-none focus:outline focus:outline-2 focus:outline-[#f6f4d2] outline-2 outline-[#8d738f] hover:outline-[#f6f4d2]"
                        />
                        <button
                            onClick={handleAddBtn}
                            className="border-none bg-white text-[#6d597a] text-base p-3 rounded ml-2 mr-2 transition-colors duration-300 hover:bg-[#8d738f]"
                        >
                            <FaPlus />
                        </button>
                    </div>

                    {/* task container */}
                    <div className='task-con grid grid-cols-4 gap-4 ml-6 mr-6 h-[69svh] text-white overflow-y-scroll'>
                        
                        {/* task input */}
                        {fieldsVisible && (
                            <div className='fixed bg-[#6e4658] rounded-xl left-[18%] top-[35%] w-[400px] h-[400px] task-input flex flex-col'>
                                <h2 className='m-5 text-2xl'>Add Task</h2>
                                <p className='ml-5'>Date</p>
                                <input 
                                    type="date" 
                                    className='text-black ml-5 mr-5 m-2 p-2' 
                                    value={dueDate} 
                                    onChange={(e) => setDueDate(e.target.value)}/>
                                <textarea 
                                    placeholder='Task Description' 
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    className='ml-5 mr-5 m-2 p-2 h-[50%] text-black resize-none overflow-y-auto focus:outline-none'
                                    rows={1}
                                />
                                <select
                                    className='ml-5 mr-5 m-2 p-2 h-[10%] text-black resize-none overflow-y-auto focus:outline-none'
                                    value={taskStatus}
                                    onChange={(e) => setTaskStatus(e.target.value)} // Update status when selected
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                
                                <span className='flex mx-auto mb-2 w-full justify-center text-[#6e4658]'>
                                    <button onClick={handleCancelBtn} className='p-1 bg-[#dcc5d3] rounded-md m-1 w-[20%]'>Cancel</button>
                                    <button onClick={handleSaveBtn} className='p-1 bg-[#dcc5d3] rounded-md m-1 w-[20%]'>Save</button>
                                </span>
                            </div>
                        )}

                        {/* task cards */}
                        {tasks.map((task) => (
                            <div key={task.TASK_ID} className='task-card flex flex-col m-3 p-3 rounded-xl h-[200px] shadow-lg'>
                                <p className='duedate'>Due Date: {new Date(task.task_due_date).toLocaleDateString()}</p>
                                <p className='status'>Status: {task.task_status}</p>
                                <p className='task_desc text-wrap pb-[30%]'>Task: {task.task_desc}</p>
                                <span className='btn-div mx-auto w-full flex justify-center'>
                                    <button className='p-1 mr-2 rounded-lg bg-[#c6a0b6]'>
                                        <IoCheckmarkDoneCircleSharp className='text-2xl'/>
                                    </button>
                                    <button className='p-1 mr-2 rounded-lg bg-[#c6a0b6]'>
                                        <RiEditCircleFill className='text-2xl'/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(task.task_id)}
                                        className='p-1 rounded-lg bg-[#c6a0b6]'>
                                        <MdDelete className='text-2xl'/>
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='bg-[#915f78] mt-5 mr-10 mb-10 w-[40%] mx-auto rounded-2xl'>
                    <div className='bg-[#ebdfe7] display-chats w-[92%] h-[85%] m-5  mt-7 mx-auto '>

                    </div>
                    <span className='flex h-full mt-2 mb-5 ml-7 bg-'>
                        <input className='bg-[#ebdfe7] pl-3 pr-3 mr-2 w-[88%] h-[7%] rounded-2xl focus:outline-none' type="text" />
                        <button className='w-[7%] h-[7%] flex items-center justify-center border-none text-[#6d597a] text-base p-1 rounded-2xl transition-colors duration-300 hover:bg-[#8d738f]'> 
                            <IoSend className='text-2xl text-[#ebdfe7]'/>
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AddTask;
