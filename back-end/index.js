const express = require('express');
const conectarDB = require('./config/db');
const cors = require("cors");

const app = express();

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Conexión a la base de datos
conectarDB();

// Middleware CORS
app.use(cors());

// Rutas
app.use('/api/productos', require('./routes/productos'));
app.use('/api/auth',require('./routes/auth'))

app.listen(4000, () => {
  console.log('El servidor está corriendo perfectamente');
});