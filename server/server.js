const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: "postgresql://postgres:GNxbcpmmWONByKOOMbSVEBwdMQayiTVX@junction.proxy.rlwy.net:41280/railway",
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

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access token is missing." });
    }
  
    // console.log("Verifying token:", token); // Log the token for debugging (don't log in production)
  
    jwt.verify(token, process.env.JWT_SECRET || 'Appdev_VATask_ai25', (err, user) => {
      if (err) {
        console.error("JWT verification failed:", err.message); // Log the error message
        return res.status(403).json({ error: "Invalid token." });
      }
  
      // Check if user data is missing or malformed
      if (!user || (!user.id && !user.userId)) {
        console.error("Invalid token payload:", user); // Log the user object
        return res.status(403).json({ error: "Token is missing user data." });
      }
  
      // Ensure user.id or user.userId is available
      req.user = user;
      // console.log("Decoded token user:", req.user); // Log the decoded user for debugging
      next();
    });
  };

// Validate token and return user details
app.get('/api/validate-token', authenticateToken, async (req, res) => {
  try {
      const { userId } = req.user; // Extract userId from the decoded token

      // Retrieve user details from the database
      const userResult = await pool.query(
          'SELECT user_id, username, fname, lname, email FROM users WHERE user_id = $1',
          [userId]
      );

      if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      res.status(200).json({ user });
  } catch (error) {
      console.error('Error validating token:', error.message);
      res.status(500).json({ error: 'Failed to validate token.' });
  }
});

  
// log in 
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists in the database
        const userResult = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = userResult.rows[0];

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.user_id }, // Include only necessary data
          process.env.JWT_SECRET || 'Appdev_VATask_ai25',
          { expiresIn: '24h' }
      );
      

        res.status(200).json({ token, user: { id: user.user_id, username: user.username } });
    } catch (error) {
        console.error("Error during login: ", error);
        res.status(500).json({ error: error.message });
    }
});

// Create Task
app.post('/api/task', authenticateToken, async (req, res) => {
  const { task_desc, task_due_date, task_status } = req.body;
  const { userId } = req.user;

  if (!userId) {
      return res.status(400).json({ error: "User ID is missing from token." });
  }

  try {
      const newTask = await pool.query(
          "INSERT INTO task (user_id, task_desc, task_due_date, task_status) VALUES ($1, $2, $3, $4) RETURNING *",
          [userId, task_desc, task_due_date, task_status]
      );

      res.status(201).json(newTask.rows[0]);
  } catch (error) {
      console.error("Error creating task: ", error);
      res.status(500).json({ error: error.message });
  }
});


// Fetch tasks
app.get('/task', authenticateToken, async (req, res) => {
    const { userId } = req.user || {}; // Extract userId from the token payload
  
    if (!userId) {
      console.error("User ID is missing from token:", req.user);
      return res.status(400).json({ error: 'User ID is missing from token.' });
    }
    // console.log("Fetching tasks for user ID:", userId);
    try {
      
  
      // Corrected SQL query with quotes
      const result = await pool.query(
        'SELECT * FROM task WHERE user_id = $1',
        [userId]
      );
  
      if (result.rows.length === 0) {
        console.log("No tasks found for user:", userId);
        return res.status(404).json({ message: "No tasks found for this user." });
      }
  
      // Send the tasks as response
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching tasks:", {
        userId,
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to fetch tasks. Please try again later." });
    }
  });




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

// email verification
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
        subject: 'VaTask Verification Code',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VaTask Verification Code</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 5px;
                padding: 20px;
                text-align: center;
              }
              h1 {
                color: #915f78;
              }
              .code {
                font-size: 24px;
                font-weight: bold;
                color: #882054;
                padding: 10px;
                background-color: #f0f0f0;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>VaTask Email Verification</h1>
              <p>Thank you for signing up with VaTask. To complete your registration, please use the following verification code:</p>
              <div class="code">${code}</div>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; 2024 VaTask. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
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

// Mark a task as complete and move to history
app.put('/task/:task_id/complete',async (req, res) => {
    const { task_id } = req.params;
    

    try {
        const updatedTask = await pool.query(
            "UPDATE task SET task_status = 'Completed', task_is_history = TRUE WHERE task_id = $1 RETURNING *",
            [task_id]
        );

        if (updatedTask.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json(updatedTask.rows[0]);
    } catch (error) {
        console.error("Error completing task: ", error);
        res.status(500).json({ error: error.message });
    }
});


// Fetch history tasks
app.get('/task/history',authenticateToken, async (req, res) => {
    const { userId } = req.user || {}; // Extract userId from the token payload
  
    if (!userId) {
      console.error("User ID is missing from token:", req.user);
      return res.status(400).json({ error: 'User ID is missing from token.' });
    }

    try {
        const historyTasks = await pool.query(
            "SELECT * FROM task WHERE task_is_history = TRUE AND user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        res.status(200).json(historyTasks.rows);
    } catch (error) {
        console.error("Error fetching history tasks: ", error);
        res.status(500).json({ error: error.message });
    }
});



// create account
app.post('/signup',async (req, res) => {
    const { firstName, lastName, bday, email, username, password } = req.body;
    try {
        // Check if email or username already exists
        const existingUser = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR username = $2`,
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email or Username already taken' });
        }
        // Save user to the database
        const result = await pool.query(
            `INSERT INTO users (fname, lname, email, bday, username, password)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [firstName, lastName, email, bday, username, password]
        );
        const user = result.rows[0]; // Extract the user data from the result
// const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'Appdev_VATask_ai25', { expiresIn: '24h' });

res.status(201).json({
    // token,
    user: {
        id: user.id,
        firstName: user.fname,
        lastName: user.lname,
        email: user.email,
        username: user.username,
    },
});

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ 
            error: 'User registration failed',
            message: error.message,
            stack: error.stack
        });
    }
});

app.listen(port, () => {
    console.log('Server is running on port', port);
  });
  