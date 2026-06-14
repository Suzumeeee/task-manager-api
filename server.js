const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello, server is alive!')
});

const bcrypt = require('bcrypt');
const db = require('./db');
const jwt = require('jsonwebtoken')

app.use(express.json());

app.post('/register', async (req, res) => {
     const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (email, password_hash) values (?, ?)',
        [email, password_hash],
        (err, result) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
            res.status(201).json({message: 'user registered', userId: result.insertId });
        });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if(err) {
            return res.status(500).json({error: err.message });
        }

        if(results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password'});
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if(!match){
            return res.status(401).json({ error: 'Invalid email or password'});
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h'});
        res.json({ message: 'Login successful', token});
    });
});

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if(!authHeader) {
        return res.status(401).json({ error: 'no token provided'});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).json({ error: 'Invalid or expired token'});
        }

        req.userId = decoded.userId;
        next();
    })
}

    app.get('/tasks', verifyToken, (req, res) => {
    db.query('SELECT * FROM tasks WHERE user_id = ?', [req.userId], (err, results) => {
        if (err) {
        return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
    });

    app.post('/tasks', verifyToken, (req, res) => {
     const { title, description, status } = req.body;

     if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'done'];
    if (status && !validStatuses.includes(status)) {
         return res.status(400).json({ error: 'Status must be pending, in_progress, or done' });
    }

    db.query(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [req.userId, title, description, status || 'pending'],
        (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Task created', taskId: result.insertId });
        }
    );
    });

    app.put('/tasks/:id', verifyToken, (req, res) => {
        const { title, description, status } = req.body;
        const taskId = req.params.id;

        db.query(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
            [title, description, status, taskId, req.userId],
            (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ message: 'Task updated' });
            }
        );
        });

        app.delete('/tasks/:id', verifyToken, (req, res) => {
            const taskId = req.params.id;

            db.query(
                'DELETE FROM tasks WHERE id = ? AND user_id = ?',
                [taskId, req.userId],
                (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Task not found' });
                }
                res.json({ message: 'Task deleted' });
                }
            );
            });

            app.use((err, req, res, next) => {
               console.error(err.stack);
               res.status(500).json({ error: 'Something went wrong' });
            });
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

});
