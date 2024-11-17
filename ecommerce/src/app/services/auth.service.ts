import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private loginTimeKey = 'loginTime';
  private sessionDuration = 10 * 60 * 1000; // 1 minutos en milisegundos
  isAuthenticated = false;
  private apiUrl = 'http://localhost:4000/api/auth';
  public sesionCaducandoEvent = new Subject<void>();
  public logoutEvent = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    console.log('AuthService inicializado');
    this.checkSessionTimeout();
  }

  // Registro de un nuevo usuario
  registrarUsuario(nombre: string, email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/registro`;
    const body = { nombre, email, password };
    return this.http.post(url, body);
  }

  // Inicio de sesión
  login(email: string, password: string): Observable<{ token: string }> {
    const url = `${this.apiUrl}/login`;
    const body = { email, password };
    return this.http.post<{ token: string }>(url, body).pipe(
      tap((response) => {
        this.storeToken(response.token);
        this.isAuthenticated = true;
        this.storeSessionInfo(response.token);
      })
    );
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.loginTimeKey);
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
    this.logoutEvent.next(); // Emitir el evento de cierre de sesión
  }

  // Almacenar información de la sesión
  private storeSessionInfo(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.loginTimeKey, Date.now().toString());
  }

  // Método para verificar y manejar la expiración de la sesión
  private checkSessionTimeout(): void {
    setInterval(() => {
      const loginTime = localStorage.getItem(this.loginTimeKey);
      if (loginTime) {
        const elapsedTime = Date.now() - parseInt(loginTime, 10);
        if (elapsedTime >= this.sessionDuration) {
          this.logout();
          this.toastr.info('Su sesión ha caducado automáticamente.', 'Sesión expirada');
        } else if (elapsedTime >= this.sessionDuration - (this.sessionDuration * 0.8)) {
          this.sesionCaducandoEvent.next();
          console.log('Emitiendo evento sesionCaducandoEvent desde el servicioo');
        }
      }
    }, 58000); // Verificar cada minuto
  }

  // Extender la sesión
  public extendSession(): void {
    localStorage.setItem(this.loginTimeKey, Date.now().toString());
    this.toastr.success('Su sesión ha sido extendida.', 'Sesión extendida');
  }

  // Obtener el rol del usuario autenticado
  getUsuarioRol(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    const decodedToken: any = jwtDecode(token);
    return decodedToken.usuario.rol;
  }

  // Validar token de recuperación de contraseña
  validarToken(token: string): Observable<any> {
    const url = `${this.apiUrl}/validate-token`;
    const body = { token };
    return this.http.post(url, body);
  }

  // Validar token de inicio de sesión
  validateToken(token: string): Observable<{ isValid: boolean; rol: string }> {
    const url = `${this.apiUrl}/validate-token-login`;
    const body = { token };
    return this.http.post<{ isValid: boolean; rol: string }>(url, body).pipe(
      tap((response) => console.log('Respuesta validateToken:', response))
    );
  }

  // Enviar token por correo electrónico
  sendTokenToEmail(email: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/send-token-email`;
    const body = { email, token };
    return this.http.post(url, body);
  }

  // Obtener el token del usuario autenticado
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Almacenar el token del usuario autenticado
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Verificar si el usuario autenticado es administrador
  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const rol = decodedToken.rol;
      return rol === 'administrador';
    }
    return false;
  }

  // Enviar pedido y formulario (si es necesario)
  enviarPedidoYFormulario(token: string, pedidoDetalles: any): Observable<any> {
    const url = `${this.apiUrl}/enviar-pedido`;
    const body = { token, pedidoDetalles };
    return this.http.post(url, body);
  }

  // Método getter para obtener el observable del evento sesionCaducandoEvent
  get sesionCaducandoEventObservable(): Observable<void> {
    return this.sesionCaducandoEvent.asObservable();
  }
}