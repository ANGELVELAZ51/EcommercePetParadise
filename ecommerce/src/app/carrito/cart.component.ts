import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductoService } from '../services/producto.service';
import { CartItem } from '../models/cartItem';
import { Producto } from '../models/producto';
import { Router } from '@angular/router';
import { ModalFormularioComponent } from '../modal-formulario/modal-formulario.component';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  listProductos: Producto[] = [];
  listProductosOriginal: Producto[] = [];
  searchQuery: string = '';
  sugerenciasProductos: Producto[] = [];
  sugerenciasEnTiempoReal: Producto[] = [];
  totalAPagar: number = 0;
  @ViewChild(ModalFormularioComponent) modalFormularioComponent!: ModalFormularioComponent;
  isAdmin: boolean = false; //

  private routesMap = new Map([
    ['registroadmin','/registroadmin'],
    ['login', '/login'],
    ['inicio de sesión', '/login'],
    ['inicio', ''],
    ['carrito', '/cart'],
    ['agregar','/agregar'],
    ['informacion','/info'],
    ['mapa del sitio', '../../../assets/img/Mapa del sitio.jpg'],

  ]);
  constructor(private toastr: ToastrService,  private productoService: ProductoService,  private router: Router,  public authService: AuthService,) { }

  ngOnInit(): void {
    // Cargar datos del carrito desde el almacenamiento local
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
    }
    const token = localStorage.getItem('token');
    this.authService.isAuthenticated = !!token;
  
    this.updateTotalAmount();
    this.totalAPagar = this.cartItems.reduce((total, item) => total + item.price, 0);
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
  updateCartItem(item: CartItem): void {
    // Encuentra el índice del elemento en el carrito
    const index = this.cartItems.findIndex((cartItem) => cartItem.product._id === item.product._id);
    if (index !== -1) {
        // Actualiza la cantidad o cualquier otra propiedad del elemento del carrito
        this.cartItems[index].quantity = item.quantity;
        // También puedes realizar otras actualizaciones si es necesario
 
        // Actualiza el carrito en el servicio (si es necesario)
        this.productoService.updateCart(this.cartItems);

        // Actualiza el monto total
        this.updateTotalAmount();
    }
}

removeFromCart(item: CartItem): void {
  // Lógica para eliminar un elemento del carrito
  const index = this.cartItems.findIndex((cartItem) => cartItem.product._id === item.product._id);
  if (index !== -1) {
    this.cartItems.splice(index, 1);
    this.updateTotalAmount();
    
    // Actualizar el almacenamiento local después de eliminar el elemento
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }
}


  private updateTotalAmount(): void {
    this.totalAmount = this.cartItems.reduce((total, item) => total + item.price, 0);
  }
  calculateTotalPrice(item: CartItem): void {
    item.price = item.product.precio * item.quantity;
  }

  filtrarPorCategoria(categoria: string): void {
    this.listProductos = this.listProductosOriginal.filter(
      (producto) => producto.categoria === categoria
    );
  }
  
  buscarProductos(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.sugerenciasProductos = []; // Reiniciar las sugerencias

    // Verifica si la consulta coincide con una ruta
    for (const [keyword, path] of this.routesMap.entries()) {
      if (query.includes(keyword)) {
        // Si la consulta contiene la palabra clave, navega a la ruta correspondiente
        if (path.includes(':')) {
          // Si la ruta tiene un parámetro, pide al usuario que lo ingrese
          const param = prompt(
            `Ingresa el valor del parámetro para ${keyword}`
          );
          if (param) {
            this.router.navigateByUrl(path.replace(':id', param));
          }
        } else {
          this.router.navigateByUrl(path);
        }
        return; 
      }
    }

    if (query === '') {
      // Si la consulta está vacía, restablecer los filtros
    } else {
      // Filtrar productos por nombre o categoría que coincidan con la consulta
      const resultados = this.listProductosOriginal.filter((producto) => {
        return (
          producto.nombre.toLowerCase().includes(query) ||
          producto.categoria.toLowerCase().includes(query)
        );
      });

      if (resultados.length === 0) {
        // No se encontraron resultados, redirigir a la página de error
        this.router.navigate(['/error']);
      } else {
        // Mostrar los resultados en la lista
        this.listProductos = resultados;

        // Obtener sugerencias de productos relacionados
        this.sugerenciasProductos = resultados.slice(0, 5); // Tomar los primeros 5 resultados
      }
    }
  }

  navigateToProductDetails(productoNombre: string): void {
    // Buscar el producto en listProductosOriginal por su nombre
    const producto = this.listProductosOriginal.find(p => p.nombre === productoNombre);
  
    // Si se encuentra el producto, navegar a sus detalles
    if (producto) {
      this.router.navigate(['/product-detail', producto._id]);
    }
  }
  actualizarSugerencias(query: string): void {
    this.sugerenciasEnTiempoReal = this.listProductosOriginal.filter(producto => {
      const nombre = producto.nombre ? producto.nombre.toLowerCase() : '';
      return nombre.includes(query.toLowerCase());
    });
  }

  abrirModal(): void {
    if (this.cartItems.length > 0) {
      this.modalFormularioComponent.openModal(this.cartItems, this.totalAPagar);
    }
  }

  
}

