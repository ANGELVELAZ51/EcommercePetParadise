const nodemailer = require('nodemailer');

// Configurar el transporte de correo electrónico
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'angelvelazsalazar@gmail.com',
    pass: 'yajb jsqz apnr vknn'
  }
});

// Función para enviar el token por correo electrónico
// const enviarTokenPorCorreo = async (email, token) => {
//   try {
//     const mailOptions = {
//       from: 'Pet Paradise <angelvelazsalazar@gmail.com>',
//       to: email,
//       subject: 'Bienvenido a Pet Paradise',
//       html: `
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <style>
//               body {
//                 font-family: Arial, sans-serif;
//                 background-color: #f5f5f5;
//                 text-align: center;
//               }
//               .container {
//                 max-width: 600px;
//                 margin: 0 auto;
//                 background-color: #ffffff;
//                 padding: 20px;
//                 border-radius: 5px;
//                 box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//               }
//             </style>
//           </head>
//           <body>
//             <div class="container">
//               <h1>¡Bienvenido a Pet Paradise!</h1>
//               <p>Gracias por registrarte en nuestra tienda en línea de productos para mascotas.</p>
//               <p>Aquí está tu token de acceso:</p>
//               <h2>${token}</h2>
//               <p>Utiliza este token para acceder a tu cuenta y disfrutar de una experiencia de compra excepcional.</p>
//               <p>Estamos emocionados de tenerte como parte de nuestra comunidad de amantes de las mascotas. Esperamos que encuentres todo lo que necesitas para consentir a tus compañeros peludos en Pet Paradise.</p>
//               <p>¡Que tengas un excelente día!</p>
//               <p>El equipo de Pet Paradise</p>
//             </div>
//           </body>
//         </html>
//       `
//     };

//     // Enviar el correo electrónico
//     await transporter.sendMail(mailOptions);
//     console.log('Correo electrónico enviado correctamente a:', email);
//   } catch (error) {
//     console.error('Error al enviar el correo electrónico:', error);
//     if (error.response) {
//       console.error('Código de estado de respuesta:', error.response.statusCode);
//       console.error('Cuerpo de respuesta:', error.response.body);
//     }
//     throw error; // Re-lanza el error para que el llamador pueda manejarlo
//   }
// };

//Función para enviar correo de registro

const enviarCorreoRegistro = async (email, token) => {
  try {
    const mailOptions = {
      from: 'Pet Paradise <angelvelazsalazar@gmail.com>',
      to: email,
      subject: 'Bienvenido a Pet Paradise',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
      </style>
        </head>
        <body>
          <div class="container">
            <h1>¡Bienvenido a Pet Paradise!</h1>
            <p>Gracias por registrarte en nuestra tienda en línea de productos para mascotas.</p>
            <p>Estamos emocionados de tenerte como parte de nuestra comunidad de amantes de las mascotas. Esperamos que encuentres todo lo que necesitas para consentir a tus compañeros peludos en Pet Paradise.</p>
            <p>¡Que tengas un excelente día!</p>
            <p>El equipo de Pet Paradise</p>
          </div>
        </body>
        </html>
      `
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico de registro enviado correctamente a:', email);
  } catch (error) {
    console.error('Error al enviar el correo electrónico de registro:', error);
    // Manejo de errores
  }
};

//Función para enviar correo de inicio de sesión
const enviarCorreoInicioSesion = async (email, token) => {
  try {

    if (token === undefined) {
      console.error('Error: el token es undefined');
      return;
    }
    const mailOptions = {
      from: 'Pet Paradise <angelvelazsalazar@gmail.com>',
      to: email,
      subject: 'Inicio de sesión en Pet Paradise',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
      </style>
        </head>
        <body>
          <div class="container">
            <h1>¡Bienvenido de vuelta a Pet Paradise!</h1>
            <p>Hemos recibido una solicitud de inicio de sesión en tu cuenta.</p>
            <p>Aquí está tu token de acceso:</p>
            <h2>${token}</h2>
            <p>Utiliza este token para acceder a tu cuenta y continuar con tu experiencia de compra.</p>
            <p>Si no has sido tú quien ha solicitado el inicio de sesión, por favor, ignora este correo electrónico y actualiza tu contraseña por seguridad.</p>
            <p>¡Que tengas un excelente día!</p>
            <p>El equipo de Pet Paradise</p>
          </div>
        </body>
        </html>
      `
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico de inicio de sesión enviado correctamente a:', email);
  } catch (error) {
    console.error('Error al enviar el correo electrónico de inicio de sesión:', error);
    // Manejo de errores
  }
};
//Función para enviar correo de restablecimiento de contraseña
const enviarCorreoRestablecimientoContrasena = async (email, token) => {
  try {
    const mailOptions = {
      from: 'Pet Paradise <angelvelazsalazar@gmail.com>',
      to: email,
      subject: 'Restablecimiento de contraseña en Pet Paradise',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
      </style>
        </head>
        <body>
          <div class="container">
            <h1>Restablecimiento de contraseña</h1>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Pet Paradise.</p>
            <p>Aquí está tu token de acceso:</p>
            <h2>${token}</h2>
            <p>Utiliza este token para establecer una nueva contraseña y mantener segura tu cuenta.</p>
            <p>Si no has solicitado este restablecimiento de contraseña, por favor contacta con nuestro equipo de soporte.</p>
            <p>¡Que tengas un excelente día!</p>
            <p>El equipo de Pet Paradise</p>
          </div>
        </body>
        </html>
      `
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico de restablecimiento de contraseña enviado correctamente a:', email);
  } catch (error) {
    console.error('Error al enviar el correo electrónico de restablecimiento de contraseña:', error);
    // Manejo de errores
  }
};

const enviarCorreoPedido = async (email, pedidoDetalles) => {
  try {
    const productosList = pedidoDetalles.productos.map(producto => `
      <li>
        <p>Producto: ${producto.producto}</p>
        <p>Cantidad: ${producto.cantidad}</p>
        <p>Precio total: ${producto.precioTotal}</p>
      </li>
    `).join('');

    const mailOptions = {
      from: 'angelvelazsalazar@gmail.com',
      to: email,
      subject: 'Detalles de tu pedido',
      html: `
        <h1>Detalles de tu pedido</h1>
        <p>Nombre del comprador: ${pedidoDetalles.nombre}</p>
        <p>Domicilio de entrega: ${pedidoDetalles.domicilio}</p>
        <p>Estado o municipio: ${pedidoDetalles.estado}</p>
        <p>Número telefónico: ${pedidoDetalles.telefono}</p>
        <p>Costo del producto: ${pedidoDetalles.totalAPagar}</p>
        <h2>Productos:</h2>
        <ul>${productosList}</ul>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico de pedido enviado correctamente a:', email);
  } catch (error) {
    console.error('Error al enviar el correo electrónico de pedido:', error);
    // Manejo de errores
  }
};

module.exports = {
  enviarCorreoPedido,
};


module.exports = {
  enviarCorreoRestablecimientoContrasena,
  enviarCorreoInicioSesion,
  enviarCorreoRegistro,enviarCorreoPedido
};

