const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const crypto = require("crypto");
const {
  transporter,
  enviarCorreoRestablecimientoContrasena,
  enviarCorreoInicioSesion,
  enviarCorreoRegistro,
  enviarCorreoPedido,
} = require("../utils/email");

// Ruta de registro de usuarios
router.post("/registro", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // Crear un nuevo usuario
    usuario = new Usuario({
      nombre,
      email,
      password,
    });

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);

    // Guardar el usuario
    await usuario.save();

    // Generar token JWT
    const payload = { usuario: { id: usuario.id, rol: usuario.rol } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Enviar el token por correo electrónico
    try {
      await enviarCorreoRegistro(email, token);
      console.log("Token enviado al correo electrónico:", email);
    } catch (error) {
      console.error("Error al enviar el token por correo electrónico:", error);
    }

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    let usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    // Verificar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    // Restablecer el loginToken a null antes de generar un nuevo token
    usuario.loginToken = null;

    // Generar token de autenticación
    const payload = {
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Almacenar el nuevo token en el usuario
    usuario.loginToken = token;
    await usuario.save();

    // Enviar el token por correo electrónico
    try {
      await enviarCorreoInicioSesion(email, token);
      console.log("Token enviado al correo electrónico:", email);
    } catch (error) {
      console.error("Error al enviar el token por correo electrónico:", error);
    }

    res.json({ msg: "Token enviado al correo electrónico" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/recover-password", async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: "El usuario no existe" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    console.log("Token generado:", resetToken); //

    usuario.resetToken = resetToken;
    usuario.resetTokenExpiry = Date.now() + 3600000;
    usuario.emailResetToken = resetToken;

    await usuario.save();

    await enviarCorreoRestablecimientoContrasena(email, resetToken);

    res.json({ msg: "Token de recuperación enviado al correo electrónico" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/validate-token", async (req, res) => {
  const { token } = req.body;

  try {
    const usuario = await Usuario.findOne({ emailResetToken: token });
    if (!usuario) {
      return res.status(400).json({ msg: "Token inválido" });
    }

    res.json({ msg: "Token válido" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/validate-token-login", async (req, res) => {
  const { token } = req.body;
  try {
    // Buscar el usuario por el loginToken
    const usuario = await Usuario.findOne({ loginToken: token });
    if (!usuario) {
      return res.status(400).json({ isValid: false, rol: null });
    }

    // Verificar la validez del token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ isValid: false, rol: null });
    }

    // El token es válido
    const rol = usuario.rol; // Obtener el rol del usuario
    res.json({ isValid: true, rol });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/send-token-email", async (req, res) => {
  const { email, token } = req.body;

  try {
    await enviarCorreoInicioSesion(email, token);
    res.json({ msg: "Token enviado al correo electrónico" });
  } catch (error) {
    console.error("Error al enviar el token al correo electrónico:", error);
    res.status(500).send("Error en el servidor");
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: "El usuario no existe" });
    }

    // Actualizar la contraseña del usuario
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.resetToken = null; // Puedes eliminar estas líneas si ya no las necesitas
    usuario.resetTokenExpiry = null; // Puedes eliminar estas líneas si ya no las necesitas
    await usuario.save();

    res.json({ msg: "Contraseña restablecida correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }

  router.post("/validate-token", async (req, res) => {
    const { token } = req.body;

    try {
      console.log("Token recibido:", token);
      const usuario = await Usuario.findOne({ emailResetToken: token });

      if (!usuario) {
        return res.status(400).json({ msg: "Token inválido" });
      }

      res.json({ msg: "Token válido" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Error en el servidor");
    }
  });
});

router.post("/enviar-pedido", async (req, res) => {
  try {
    const requestData = req.body;
    const { token, pedidoDetalles } = requestData;

    // Verificar y decodificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.usuario.id;

    // Buscar el usuario por su ID
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    console.log("Detalles del pedido:", pedidoDetalles);

    if (
      !pedidoDetalles ||
      !pedidoDetalles.productos ||
      pedidoDetalles.productos.length === 0
    ) {
      return res
        .status(400)
        .json({ mensaje: "Detalles del pedido incompletos" });
    }

    // Llamar a la función enviarCorreoPedido con los detalles del pedido
    await enviarCorreoPedido(usuario.email, pedidoDetalles);
    res.json({ mensaje: "Pedido y formulario enviados correctamente" });
  } catch (error) {
    console.error("Error al enviar el pedido y el formulario:", error);
    res
      .status(500)
      .json({ mensaje: "Error al enviar el pedido y el formulario" });
  }
});
router.post("/registroadmin", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // Crear un nuevo usuario
    usuario = new Usuario({
      nombre,
      email,
      password,
      rol: "administrador",
    });

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);

    // Guardar el usuario
    await usuario.save();

    // Generar token JWT
    const payload = { usuario: { id: usuario.id, rol: usuario.rol } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Enviar el token por correo electrónico
    try {
      await enviarCorreoRegistro(email, token);
      console.log("Token enviado al correo electrónico:", email);
    } catch (error) {
      console.error("Error al enviar el token por correo electrónico:", error);
    }

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
});
module.exports = router;
