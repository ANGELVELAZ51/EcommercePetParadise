import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CartItem } from '../models/cartItem';

@Component({
  selector: 'app-modal-formulario',
  templateUrl: './modal-formulario.component.html',
  styleUrls: ['./modal-formulario.component.css']
})
export class ModalFormularioComponent implements OnInit {
  showModal = false;
  envioForm: FormGroup;
  tarjetaForm: FormGroup;
  pedidoDetalles: any;
  totalAPagar: number;
  cartItems: CartItem[] = [];
  estadosMexico: string[] = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México', 'Durango',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Estado de México', 'Michoacán',
    'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
    'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.envioForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      domicilio: ['', Validators.required],
      estado: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]]
    });

    this.tarjetaForm = this.fb.group({
      numeroTarjeta: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
      nombreTitular: ['', Validators.required],
      fechaVencimiento: ['', [Validators.required, Validators.pattern('(0[1-9]|10|11|12)/[0-9]{2}')]],
      cvv: ['', [Validators.required, Validators.pattern('[0-9]{3}')]]
    });

    this.totalAPagar = 0;
  }

  ngOnInit(): void {
    // Verifica si el usuario ya está autenticado al cargar el componente
  const token = localStorage.getItem('token');
  this.authService.isAuthenticated = !!token;
}

navigateToLogin(): void {
  this.router.navigate(['/login']);
}
logout(): void {
  this.authService.logout();
  this.toastr.success('A salido de la sesion!', 'Sesion cerrada!');
  // Opcionalmente, puedes redirigir a la página de inicio o login después del cierre de sesión
  this.router.navigate(['/login']);
}
  openModal(cartItems: CartItem[], totalAPagar: number): void {
    this.cartItems = cartItems;
    this.totalAPagar = totalAPagar;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  enviarPedido(): void {
    const formData = this.envioForm.value;
    if (this.envioForm.valid && this.cartItems.length > 0) {
      const token = this.authService.getToken();
      if (token) {
        const pedidoDetalles = {
          ...formData,
          productos: this.cartItems.map(item => ({
            producto: item.product.nombre,
            cantidad: item.quantity,
            precioUnitario: item.product.precio,
            precioTotal: item.price
          })),
          totalAPagar: this.totalAPagar
        };
        const requestData = { token, pedidoDetalles };

        this.authService.enviarPedidoYFormulario(token, pedidoDetalles)
          .subscribe(
            (response) => {
              console.log('Respuesta del backend:', response);
              console.log('Pedido y formulario enviados correctamente');

              this.cartItems = [];
              localStorage.removeItem('cart');

              this.toastr.success('En seguida le notificaran por email los datos del pedido gracias por su compra!', 'Se ha encargado su pedido!');
              this.pedidoDetalles = response.detallePedido;
              this.closeModal();

              this.router.navigate(['']);
            },
            (error) => {
              console.error('Error al enviar el pedido y el formulario:', error);
              if (error.status === 401) {
                this.toastr.info('Para realizar un pedido, por favor inicie sesión.', 'Debe iniciar sesión', {
                  timeOut: 0,
                  extendedTimeOut: 0,
                  closeButton: true,
                  onActivateTick: true
                }).onTap.subscribe(() => {
                  this.router.navigate(['/login']);
                });
              } else {
                this.toastr.error('Error al enviar el pedido y el formulario!', 'Error !');
              }
            }
          );
      } else {
        console.error('No se encontró un token válido');
        this.toastr.info('Debe iniciar sesión para enviar el pedido.', 'Error');
      }
    } else {
      console.error('El formulario contiene errores o el carrito está vacío');
      this.toastr.error('El formulario contiene errores o el carrito está vacío!', 'Error !');
    }
  }

  enviarDatosTarjeta(): void {
    if (this.tarjetaForm.valid) {
      console.log('Datos de la tarjeta enviados:', this.tarjetaForm.value);
    } else {
      console.error('Por favor, complete correctamente todos los campos.');
    }
  }
}
