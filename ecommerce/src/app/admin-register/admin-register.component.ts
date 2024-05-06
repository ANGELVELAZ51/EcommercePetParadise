import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service'; 
import { Producto } from '../models/producto';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.css']
})
export class AdminRegisterComponent {
  registroForm: FormGroup;
  listProductos: Producto[] = [];
  listProductosOriginal: Producto[] = [];
  searchQuery: string = '';
  sugerenciasProductos: Producto[] = [];
  sugerenciasEnTiempoReal: Producto[] = [];

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
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public authService: AuthService 
  )
   {
    
    this.registroForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.validateEmailFormat]],
      password: ['', [Validators.required, this.validatePasswordFormat]],
      confirmarPassword: ['', Validators.required]
    });
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
  onSubmit() {
    if (this.registroForm && this.registroForm.valid) {
      const passwordControl = this.registroForm.get('password');
      const confirmarPasswordControl = this.registroForm.get('confirmarPassword');
  
      if (passwordControl && confirmarPasswordControl && passwordControl.value === confirmarPasswordControl.value) {
        const { nombre, email, password } = this.registroForm.value;
        const rol = 'administrador';
        this.http.post('http://localhost:4000/api/auth/registroadmin', { nombre, email, password, rol })
          .subscribe(
            (response) => {
              console.log('Usuario administrador registrado correctamente');
              this.toastr.success('Se ha registrado correctamente un administrador!', 'Registro exitoso!');
              // this.router.navigate(['/login']);
            },
            (error) => {
              console.error('Error al registrar el usuario administrador:', error);
              if (error.status === 400 && error.error.msg === 'El usuario ya existe') {
                this.toastr.error('El usuario ya existe', 'Error en el registro');
              } else {
                this.toastr.error('Error al registrar el usuario administrador', 'Error en el registro');
              }
            }
          );
      } else {
        this.toastr.error('Las contraseñas no coinciden', 'Error en el registro');
      }
    }
  }
  
  
  validatePasswordFormat(control: FormControl) {
    const password = control.value;
    const numberPattern = /[0-9]/;
    const uppercasePattern = /[A-Z]/;

    console.log('Password:', password);
    console.log('Number pattern test:', numberPattern.test(password));
    console.log('Lowercase pattern test:', uppercasePattern.test(password));
    console.log('Password length:', password.length);

  
    if (!uppercasePattern.test(password)) {
      return { missingUppercase: true };
    }
  
    if (password.length < 6) {
      return { minLength: true };
    }
    if (!numberPattern.test(password)) {
      return { missingNumber: true };
    }
  
    return null;
  }
  
  
  passwordsMatch(control: FormControl) {
    const password = control.root.get('password');
    return password && control.value === password.value ? null : { 'passwordsNotMatch': true };
  }
  
  validateEmailFormat(control: FormControl) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(control.value);
    return valid ? null : { invalidEmail: true };
  }
  navegarARegistroAdmin(): void {
    this.router.navigate(['/registroAdmin']);
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
          if (keyword === 'Registro de administrador') {
            this.navegarARegistroAdmin(); // Llama al método para navegar a la página de registro de administrador
          } else {
            this.router.navigateByUrl(path);
          }
        }
        return; 
      }
    }
  
    // Resto del código...
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
