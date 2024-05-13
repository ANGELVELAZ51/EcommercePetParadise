import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../models/producto';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { EventHandlerService } from '../services/event-handler-service.service';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.css']
})
export class InformacionComponent {
  listProductos: Producto[] = [];
  listProductosOriginal: Producto[] = [];
  searchQuery: string = '';
  sugerenciasProductos: Producto[] = [];
  sugerenciasEnTiempoReal: Producto[] = [];
  isAdmin: boolean = false; 


  private routesMap = new Map([
    ['registroadmin','/registroadmin'],
    ['login', '/login'],
    ['inicio de sesión', '/login'],
    ['inicio', ''],
    ['compras', '/cart'],
    ['agregar','/agregar'],
    ['informacion','/info'],
    ['mapa del sitio', '../../../assets/img/Mapa del sitio.jpg'],

  ]);
  constructor( private router: Router,    private toastr: ToastrService,     public authService: AuthService,    private eventHandlerService: EventHandlerService,

  ) { }

  ngOnInit(): void {
      // Verifica la autenticación al cargar el componente
  this.checkAuthentication();
    // Verifica si el usuario ya está autenticado al cargar el componente
  const token = localStorage.getItem('token');
  this.authService.isAuthenticated = !!token;
  // Suscribirse al evento de advertencia de sesión a punto de caducar
  this.authService.sesionCaducandoEventObservable.subscribe(() => {
    console.log('Recibido evento sesionCaducandoEvent');

    // Mostrar la notificación en la consola
    this.toastr.warning('Su sesión está a punto de caducar. ¿Desea extenderla?', 'Advertencia').onTap.subscribe(() => {
      console.log('El usuario ha hecho clic en la notificación para extender la sesión.');
      // Implementa aquí la lógica para extender la sesión
      this.authService.extendSession();
    });
  });

}

// Método para verificar la autenticación
checkAuthentication(): void {
  const token = localStorage.getItem('token');
  this.authService.isAuthenticated = !!token;
}

navigateToLogin(): void {
  this.router.navigate(['/login']);
}

logout(): void {
  this.authService.logout();
  this.toastr.success('¡Ha cerrado sesión!', 'Sesión cerrada');
  // Verificar la autenticación después de cerrar sesión
  this.checkAuthentication();
  // Opcionalmente, puedes redirigir a la página de inicio o de inicio de sesión después de cerrar sesión
  this.router.navigate(['/login']);
}
  // Método para extender la sesión cuando el usuario hace clic en el mensaje de advertencia
  extendSession(): void {
    this.authService.extendSession();
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
