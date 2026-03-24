const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de conexión con variables de entorno de OpenShift
const pool = new Pool({
  host: process.env.DATABASE_SERVICE_NAME || 'localhost',
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: 5432,
});

app.use(express.json());
app.use(express.static('public')); // Para servir el HTML

// 1. Ruta para crear la tabla (Ejecutar una vez al instalar)
app.get('/setup', async (req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS inventario (id SERIAL PRIMARY KEY, objeto TEXT NOT NULL)');
    res.send('✅ Tabla "inventario" lista.');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// 2. Ruta para obtener todos los objetos
app.get('/api/objetos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventario ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Ruta para agregar un objeto
app.post('/api/objetos', async (req, res) => {
  const { nombre } = req.body;
  try {
    await pool.query('INSERT INTO inventario (objeto) VALUES ($1)', [nombre]);
    res.status(201).send('Objeto guardado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 4. NUEVA RUTA: Ruta para editar un objeto
app.put('/api/objetos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    await pool.query('UPDATE inventario SET objeto = $1 WHERE id = $2', [nombre, id]);
    res.send('Objeto actualizado');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});