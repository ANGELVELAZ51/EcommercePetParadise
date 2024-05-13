import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.authService.sesionCaducandoEventObservable.subscribe(() => {
      console.log('Recibido evento sesionCaducandoEvent en AppComponent');
      this.toastr.warning('Su sesión está a punto de caducar. ¿Desea extenderla?', 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: true,
        disableTimeOut: true
      }).onTap.subscribe(() => {
        this.authService.extendSession();
      });
    });
  }
}