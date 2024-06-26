import { Component } from '@angular/core';
import { Producto } from '../models/producto';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-error-personalizado',
  templateUrl: './error-personalizado.component.html',
  styleUrls: ['./error-personalizado.component.css']
})
export class ErrorPersonalizadoComponent {
    listProductos: Producto[] = [];
    listProductosOriginal: Producto[] = [];
    searchQuery: string = '';
    sugerenciasProductos: Producto[] = [];
    sugerenciasEnTiempoReal: Producto[] = [];
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
  
    constructor( private router: Router,    public authService: AuthService,    private toastr: ToastrService,
    ) { }
  
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
}
