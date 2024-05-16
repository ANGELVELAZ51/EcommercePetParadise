import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
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

  constructor(
    
    private _productoService: ProductoService,
    private toastr: ToastrService,
    private router: Router,
    public authService: AuthService 
  ) {}



  ngOnInit(): void {
    this.obtenerProductos(this.currentPage, this.itemsPerPage);
    // this.obtenerProductosUnicos();
      // Verifica si el usuario ya está autenticado al cargar el componente
    const token = localStorage.getItem('token');
    this.authService.isAuthenticated = !!token;
  }

  editarProducto(): void {
    this.router.navigate(['/editar-producto']);
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

  obtenerProducto() {
    this._productoService.getProducto().subscribe((data: Producto[]) => {
      console.log(data);
      this.listProductos = data;
    }, (error: any) => {
      console.log(error);
    })
  }

  eliminarProducto(id: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this._productoService.eliminarProducto(id).subscribe(
        (data: any) => {
          this.toastr.success('El producto fue eliminado con éxito', 'Producto Eliminado');
          this.obtenerProducto();
          window.location.reload();
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }
}