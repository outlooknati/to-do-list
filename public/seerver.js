import sqlite3 from "sqlite3";
import { open } from "sqlite";
import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public/'));

let db;
async function initDB(){
    db = await open({
        filename: '/banco.db',
        driver: sqlite3.Database,
    });

    await db.run(`CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        completed INTEGER DEFAULT 0    
    )`);
}

app.get('/tasks', async(req, res) => {
    const tasks = await db.all(`SELECT * FROM tasks`);
    res.json(tasks);
});

app.post('/tasks', async(req, res) => {
    const{ description } = req.body;
    const stmt = await db.prepare(`INSERT INTO tasks (description) VALUES(?)`);
    await stmt.run(description);
    await stmt.finalize();
    res.status(201).json({message: 'Task added'});
});

app.delete('/tasks/:id', async(req, res) => {
    const {id} = req.params;
    await db.run(`DELETE FROM tasks WHERE id = ?`, id);
    res.status(204).send();
});

app.patch('tasks/:id/toggle', async(req, res) => {
    const {id} = req.params
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, id);
    const completed = task.completed ? 0:1;
    await db.run(`UPDATE tasks SET completed = ? WHERE id = ?`, completed, id);
    res.status(204).send();
});

app.listen(PORT, async() => {
    await initDB();
    console.log(`server running at http://localhost:${PORT}`)
});

