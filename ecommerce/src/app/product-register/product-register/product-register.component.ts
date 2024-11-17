import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ProductComponent } from 'src/app/carga-productos/product.component';
import { Producto } from 'src/app/models/producto';
import { ProductoService } from 'src/app/services/producto.service';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-product-register',
  templateUrl: './product-register.component.html',
  styleUrls: ['./product-register.component.css']
})
export class ProductRegisterComponent {
previewImageUrl: string | undefined;
nombre: any;
precio: any;
detalles: any;
talla: any;
categoria: any;
imagen: File | null = null;

registrarProducto(): void {
  const formData = new FormData();
  formData.append('nombre', this.nombre);
  formData.append('precio', this.precio.toString());
  formData.append('detalles', this.detalles);
  // formData.append('talla', this.talla);
  formData.append('categoria', this.categoria);
  if (this.imagen) {
    formData.append('imagen', this.imagen, this.imagen.name);
  }
  console.info(formData)
  this.http.post<any>('http://localhost:4000/api/productos', formData)
    .subscribe(
      (response) => {
        console.log('Producto registrado exitosamente:', response);
        this.toastr.success('Producto registrado exitosamente');
        this.limpiarCampos(); // Limpiar los campos del formulario después de registrar el producto
      },
      (error) => {
        console.error('Error al registrar el producto:', error);
        this.toastr.error('Ocurrió un error al registrar el producto');
        this.limpiarCampos();
      }
    );
}

onFileSelected(event: any): void {
  [ this.imagen ] = event.target.files
  console.info(this.imagen)
}

limpiarCampos(): void {
  this.nombre = '';
  this.precio = 0;
  this.detalles = '';
  // this.talla = '';
  this.categoria = '';
  this.imagen = null;
}




  listProductos: Producto[] = [];
  totalPages: number = 1;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  searchQuery: string = '';
  categoriasUnicas: string[] = [];
  // tallasUnicas: string[] = [];
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
  
  productoForm: any;
  titulo!: string;  id: null | undefined;

  constructor(
    private _productoService: ProductoService,
    private toastr: ToastrService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    public authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.info(this.route.snapshot.paramMap.get('id'))

    // this.route.snapshot.queryParamMap.forEach(console.info)
    // console.info('Parametros: ', this.route.queryParams.)
    this.obtenerProductos(this.currentPage, this.itemsPerPage);
    this.editarProducto(this.route.snapshot.paramMap.get('id')||'');
    // this.obtenerProductosUnicos();
      // Verifica si el usuario ya está autentiid?: stringid: stringcado al cargar el componente
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

//Editar productos
productoEditado: Producto | null = null;

  editarProducto(idProducto: string): void {
      this._productoService
        .obtenerProducto(idProducto)
        .subscribe(
          (productoObtenido) => {
            console.info(productoObtenido) // TODO: Asignar valor de productoObtenido a los [(ngModel)]
            if (this.productoEditado) {
              this.productoEditado.nombre = productoObtenido.nombre;
              this.productoEditado.precio = productoObtenido.precio;
              this.productoEditado.detalles = productoObtenido.detalles;
              // this.productoEditado.talla = productoObtenido.talla;
              this.productoEditado.categoria = productoObtenido.categoria;
            }
          },
          (error) => {
            console.error('Error al obtener los detalles del producto:', error);
          }
        );
  }

cancelarEdicion() {
  this.productoEditado = null; // Limpiar el producto en edición al cancelar
}

guardarCambios() {
  if (this.productoEditado) {
    // Aquí deberías implementar la lógica para actualizar el producto
    // en tu base de datos o estado de la aplicación
    console.log('Producto guardado:', this.productoEditado);
    // Después de guardar, reseteamos el producto editado
    this.cancelarEdicion();
  } else {
    console.error('No hay un producto siendo editado actualmente.');
  }
}


}