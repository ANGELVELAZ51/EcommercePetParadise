import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private loginTimeKey = 'loginTime';
  private sessionDuration = 6 * 1000;
  isAuthenticated = false; // Agregar esta propiedad
  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {
    // // Verificar la expiración del token cada minuto
    // setInterval(() => {
    //   this.checkTokenExpiration();
    // }, 60000);
    this.checkSessionTimeout();
  }


  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('http://localhost:4000/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          this.storeToken(response.token);
          this.isAuthenticated = true;
          this.storeSessionInfo(response.token);

        })
      );
  }
  
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.loginTimeKey);
    this.router.navigate(['/login']);
  }

  private storeSessionInfo(token: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.loginTimeKey, Date.now().toString());
  }

  private checkSessionTimeout() {
    setInterval(() => {
      const loginTime = localStorage.getItem(this.loginTimeKey);
      if (loginTime) {
        const elapsedTime = Date.now() - parseInt(loginTime, 10);
        if (elapsedTime >= this.sessionDuration) {
          this.logout();
          this.toastr.info('Su sesión ha caducado automáticamente.', 'Sesión expirada');
        } else if (elapsedTime >= this.sessionDuration * 0.8) {
          this.toastr.warning('Su sesión está a punto de caducar. ¿Desea extenderla?', 'Advertencia', {
            timeOut: 0, // No ocultar automáticamente el mensaje
            extendedTimeOut: 0, // No ocultar automáticamente el mensaje
            closeButton: true, // Mostrar el botón de cierre en el mensaje
            tapToDismiss: false, // No permitir que el usuario haga clic fuera del mensaje para cerrarlo
            disableTimeOut: true // Deshabilitar el tiempo de espera automático para el cierre del mensaje
          }).onTap.subscribe(() => {
            this.extendSession();
          });
        }
      }
    }, 60000); // Verificar cada minuto
  }
  public extendSession() {
    localStorage.setItem(this.loginTimeKey, Date.now().toString());
    this.toastr.success('Su sesión ha sido extendida.', 'Sesión extendida');
  }
  
  getUsuarioRol(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    const decodedToken: any = jwtDecode(token);
    return decodedToken.usuario.rol;
  }

  
  // getTokenExpiration(): Date | null {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     return null;
  //   }

  //   const decodedToken: any = jwtDecode(token);
  //   const expirationDate = new Date(decodedToken.exp * 1000);
  //   return expirationDate;
  // }

  // private checkTokenExpiration(): void {
  //   const expirationDate = this.getTokenExpiration();
  //   if (expirationDate && new Date() > expirationDate) {
  //     // El token ha expirado
  //     this.logout();
  //     this.toastr.info('Su sesión ha caducado. Por favor, inicie sesión nuevamente.', 'Sesión expirada');
  //     this.router.navigate(['/login']);
  //     // Redirigir al usuario a la página de inicio de sesión
  //   }
  // }
  validarToken(token: string): Observable<any> {
    return this.http.post('http://localhost:4000/api/auth/validate-token', { token });
  }

  validateToken(token: string): Observable<{ isValid: boolean, rol: string }> {
    const url = `${this.apiUrl}/validate-token-login`;
    return this.http.post<{ isValid: boolean, rol: string }>(url, { token }).pipe(
      tap(response => console.log('Respuesta validateToken:', response))
    );
  }
  
  sendTokenToEmail(email: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/send-token-email`;
    const body = { email, token };
    return this.http.post(url, body);
  }
//obtener el token del usuario autenticado
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const rol = decodedToken.rol;
      return rol === 'administrador';
    }
    return false;
  }
  
  enviarPedidoYFormulario(token: string, pedidoDetalles: any): Observable<any> {
    const url = `${this.apiUrl}/enviar-pedido`;
    const body = { token, pedidoDetalles };
    return this.http.post(url, body);
  }
  
}
