import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../services/producto.service';
import { Producto } from '../models/producto';
import { CartItem } from '../models/cartItem';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  listProductos: Producto[] = [];
  totalPages: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  searchQuery: string = '';
  categoriasUnicas: string[] = [];
  tallasUnicas: string[] = [];
  listProductosOriginal: Producto[] = [];
  sugerenciasProductos: Producto[] = [];
  sugerenciasEnTiempoReal: Producto[] = [];
  isAdmin: boolean = false; // Variable para indicar si el usuario es administrador


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

  constructor(
    
    private _productoService: ProductoService,
    private toastr: ToastrService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    public authService: AuthService,
    
  ) {}

  ngOnInit(): void {
    this.obtenerProductos(this.currentPage, this.itemsPerPage);
    // this.obtenerProductosUnicos();
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

  // Restaurar la lista de productos originales cuando se agregue un producto al carrito
  addToCart(producto: Producto): void {
    this._productoService.addToCart(producto);
    this.listProductosOriginal = this.listProductos.slice();
    this.toastr.success('Se agregó al carrito!', 'Producto agregado!');
  }

  obtenerProductos(page: number, itemsPerPage: number): void {
    this._productoService.getProductos(page, itemsPerPage).subscribe(
      (data) => {
        // console.log('Datos de la API:', data);
        this.listProductos = data.products;
        this.totalPages = data.totalPages;
        this.currentPage = page;
        this.categoriasUnicas = this.obtenerCategoriasUnicas(
          this.listProductos
        );
        // this.obtenerProductosUnicos();
        this.listProductosOriginal = this.listProductos.slice(); // Guardar copia de la lista original
      },
      (error) => {
        console.log(error);
      }
    );
  }

  private obtenerCategoriasUnicas(productos: Producto[]): string[] {
    const categoriasSet = new Set<string>();
    productos.forEach((producto) => {
      categoriasSet.add(producto.categoria);
    });
    return Array.from(categoriasSet);
  }

  // obtenerProductosUnicos(): void {
  //   if (this.listProductos && this.listProductos.length > 0) {
  //     const tallasSet = new Set<number>();

  //     this.listProductos.forEach((producto) => {
  //       if (producto.tallas) {
  //         producto.tallas.forEach((talla) => {
  //           tallasSet.add(talla);
  //         });
  //       }
  //     });
  //     this.tallasUnicas = Array.from(tallasSet).map((talla) =>
  //       talla.toString()
  //     );
  //   } else {
  //     this.tallasUnicas = [];
  //   }
  // }

  agregarAlCarrito(producto: Producto): void {
    this._productoService.addToCart(producto);
    this.toastr.success('Se agregó al carrito!', 'Producto agregado!');
  }

  changePage(page: number): void {
    this.obtenerProductos(page, this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  filtrarPorCategoria(categoria: string): void {
    this.listProductos = this.listProductosOriginal.filter(
      (producto) => producto.categoria === categoria
    );
  }
  // filtrarPorTalla(talla: string): void {
  //   // Restablecer los filtros previos

  //   // Filtrar los productos que contienen la talla seleccionada en su lista de tallas
  //   this.listProductos = this.listProductos.filter((producto) => {
  //     return producto.tallas && producto.tallas.includes(parseInt(talla));
  //   });
  // }
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

        // Hacer scroll hacia abajo después de la búsqueda de productos
        setTimeout(() => {
          this.viewportScroller.scrollToPosition([0, 730]);
        }, 10);
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
}
