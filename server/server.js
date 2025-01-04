const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg')

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DB_CONN_URL,
    ssl: false
});

module.exports = pool;

// verify database connection
pool.connect()
    .then(client => {
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('PostgreSQL Connected: ', res.rows);
                client.release();
            })
            .catch(err => {
                console.error('Error executing query', err.stack);
            });
    })
    .catch(err => {
        console.error('Error connecting to DB: ', err)
    });


// create
app.post('/api/task', async(req, res) => {
    const { task_desc, task_due_date, task_status } = req.body;

    try {
        const newTask = await pool.query(
            "INSERT INTO task (task_desc, task_due_date, task_status) VALUES ($1, $2, $3) RETURNING *",
            [task_desc, task_due_date, task_status]
        );

        res.status(201).json(newTask.rows[0]);
    } catch (error) {
        console.error("Error creating task: ", error);
        res.status(500).json({ error: error.message });
    }
});


//fetch
app.get('/task', async(req, res) => {
    try{
        const tasks = await pool.query("SELECT * FROM task ORDER BY created_at DESC");
        
        res.status(200).json(tasks.rows);
    } catch(error){
        console.error("Error fetching tasks: ", error);
        res.status(500).json({ error: error.message });
    }
})


//update
app.put('/task/:task_id', async(req, res) => {
    const { task_id } = req.params;
    const { task_desc, task_due_date, task_status} = req.body;
    
    try {
        const updTask = await pool.query(
            "UPDATE task SET task_desc = $1, task_due_date = $2, task_status = $3 WHERE task_id = $4 RETURNING *",
            [task_desc, task_due_date, task_status, task_id]
        );

        res.status(200).json(updTask.rows[0]);
    } catch (error) {
        console.error("Error updating task: ", error);
        res.status(500).json({ error: error.message });
    }
});


//delete
app.delete('/task/:id', async(req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM task WHERE task_id = $1", [id]);

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task: ", error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/send-verification-email', (req, res) => {
    const { email, code } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 587,             
        secure: false,   
        auth: {
            user: 'trishiah.rellon@gmail.com',
            pass: 'ipak xfss llyy urzw',
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Code',
        text: `Your verification code is: ${code}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
