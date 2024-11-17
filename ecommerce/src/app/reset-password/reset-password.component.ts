import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  resetToken: string = '';
  email: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.resetForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6), this.validatePasswordFormat]],
        confirmPassword: ['', Validators.required]
      },
      { validator: this.passwordMatchValidator }
    );

    // Obtener el correo electrónico del parámetro de consulta
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      this.email = params['email'] || '';
    });
  }



  validatePasswordFormat(control: FormControl) {
    const password = control.value;
    const numberPattern = /[0-9]/;
    const uppercasePattern = /[A-Z]/;


    if (!uppercasePattern.test(password)) {
      return { missingUppercase: true };
    }
    if (!numberPattern.test(password)) {
      return { missingNumber: true };
    }


    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.controls['password'].value;
    const confirmPassword = form.controls['confirmPassword'].value;
    if (password !== confirmPassword) {
      form.controls['confirmPassword'].setErrors({ mismatch: true });
      return { mismatch: true }; // Devuelve un error si las contraseñas no coinciden
    } else {
      form.controls['confirmPassword'].setErrors(null);
      return null; // Devuelve null si las contraseñas coinciden
    }
  }
  
  onSubmit() {
    if (this.resetForm.valid) {
      const { password } = this.resetForm.value;
      const resetData = { token: this.resetToken, password, email: this.email };
      this.http
        .post('http://localhost:4000/api/auth/reset-password', resetData)
        .subscribe(
          (response) => {
            // Manejar la respuesta exitosa
            console.log('Contraseña restablecida correctamente');
            this.toastr.success('Contraseña restablecida!', 'Restableció su contraseña!');
            // Redirigir al componente de inicio de sesión
            this.router.navigate(['/login']);
          },
          (error) => {
            // Manejar el error
            console.error('Error al restablecer la contraseña:', error);
            this.toastr.error('Error al restablecer la contraseña!', 'Error al restablecer contraseña!');
          }
        );
    }
  }
}
