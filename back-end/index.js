const express = require('express');
const conectarDB = require('./config/db');
const cors = require("cors");
const app = express();

const bodyParser = require('body-parser');
const multer = require('multer');
app.use(express.static("./upload"));
const storage = multer.diskStorage({
  filename: function (res, file, cb) {
    const ext = file.originalname.split(".").pop(); // png / jpeg / gif
    const fileName = file.originalname.substring(0, file.originalname.length - (ext.length + 1) );
    const postfijo = Date.now();
    cb(null, `${fileName}-${postfijo}.${ext}`); //TODO 123123213232.pdf
  },
  destination: function (res, file, cb) {
    cb(null, `./upload`);
  },
});

const upload = multer({ storage });

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 


// Conexión a la base de datos
conectarDB();

// Middleware CORS
// Configurar CORS
app.use(cors({
  origin: 'http://localhost:4200', // Reemplaza con la URL de tu aplicación Angular
  credentials: true // Permite el envío de cookies y encabezados de autenticación
}));

// Rutas
app.use('/api/productos', upload.single('imagen'), require('./routes/productos'));
app.use('/api/auth',require('./routes/auth'))


// app.use('/api/auth', require('./routes/auth'));
app.listen(4000, () => {
  console.log('El servidor está corriendo perfectamente');
});