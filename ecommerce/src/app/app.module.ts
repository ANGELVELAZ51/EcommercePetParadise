import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductComponent } from './carga-productos/product.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './carrito/cart.component';
import {HttpClientModule} from '@angular/common/http'
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from './services/producto.service';
import { ErrorPersonalizadoComponent } from './error-personalizado/error-personalizado.component';
import { FooterComponent } from './footer/footer/footer.component';
import { LoginComponent } from './login-registro/login-registro/login/login.component';
import { RegistroComponent } from './login-registro/login-registro/registro/registro.component';
import { ProductRegisterComponent } from './product-register/product-register/product-register.component';
import { InformacionComponent } from './informacion/informacion.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminComponent } from './admin/admin/admin.component';
import { ValidateTokenComponent } from './validate-token/validate-token.component';
import { ValidateTokenLoginComponent } from './validate-token-login/validate-token-login.component';
import { ModalFormularioComponent } from './modal-formulario/modal-formulario.component';
import { AdminRegisterComponent } from './admin-register/admin-register.component';


@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    ProductDetailsComponent,
    CartComponent,
    LoginComponent,
    RegistroComponent,
    ErrorPersonalizadoComponent,
    ProductRegisterComponent,
    FooterComponent,
    InformacionComponent,
    LoginComponent,
    RecoverPasswordComponent,
    ResetPasswordComponent,
    AdminComponent,
    ValidateTokenComponent,
    ValidateTokenLoginComponent,
    ModalFormularioComponent,
    AdminRegisterComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({positionClass: 'toast-bottom-center',}),
    BrowserAnimationsModule, 
    ToastrModule.forRoot(),
  ],
  providers: [ProductoService,  AuthService,     ],
  bootstrap: [AppComponent]
})
export class AppModule { }
