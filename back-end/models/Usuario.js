const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  rol: {
    type: String,
    default: "usuario",
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
  emailResetToken: {
    type: String,
  },
  loginToken: {
    type: String,
  },
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
