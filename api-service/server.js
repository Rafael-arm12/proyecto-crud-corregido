// Importar librerías necesarias
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares (procesan peticiones antes de llegar a rutas)
app.use(cors()); // Permitir peticiones desde otros dominios
app.use(express.json()); // Leer JSON del body

// Middleware: función que se ejecuta antes de las rutas
// cors(): permite que navegadores accedan desde otros dominios
// express.json(): convierte texto JSON a objeto JavaScript

// Configurar conexión a base de datos
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres-db',
    port: 5432,
    database: 'crud_db',
    user: 'postgres',
    password: 'postgres'
    });
    // Pool: grupo de conexiones reutilizables a la BD

// GET /api/users - Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
    try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
    });

// GET /api/users/:id - Obtener un usuario específico
app.get('/api/users/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const result = await pool.query(
    'SELECT * FROM users WHERE id = $1', [id]
    );
    res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
    });

// POST /api/users - Crear nuevo usuario
app.post('/api/users', async (req, res) => {
    try {
    const { nombre, correo } = req.body;
    const result = await pool.query(
    'INSERT INTO users (nombre, correo) VALUES ($1, $2) RETURNING *',
    [nombre, correo]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
    });

// PUT /api/users/:id - Actualizar usuario
app.put('/api/users/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const { nombre, correo } = req.body;
    const result = await pool.query(
    'UPDATE users SET nombre=$1, correo=$2 WHERE id=$3 RETURNING *',
    [nombre, correo, id]
    );
    res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
    });

// DELETE /api/users/:id - Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
    try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
    });

// Iniciar servidor en puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    });
    
// Crear tabla si no existe (al iniciar)
    pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, nombre TEXT, correo TEXT
    )`).then(() => console.log('Tabla users lista'));