import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {
  private sesionCaducandoEvent: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.authService.sesionCaducandoEventObservable.subscribe(() => {
      console.log('Recibido evento sesionCaducandoEvent');
      this.sesionCaducandoEvent.next();
      this.mostrarAdvertenciaSesionCaducando();
    });
  }

  get sesionCaducandoEventObservable(): Observable<void> {
    return this.sesionCaducandoEvent.asObservable();
  }

  private mostrarAdvertenciaSesionCaducando(): void {
    this.toastr.warning('Su sesión está a punto de caducar. ¿Desea extenderla?', 'Advertencia', {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: true,
      tapToDismiss: true,
      disableTimeOut: true
    }).onTap.subscribe(() => {
      this.authService.extendSession();
    });
  }
}