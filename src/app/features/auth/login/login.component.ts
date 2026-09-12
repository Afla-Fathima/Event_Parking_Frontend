import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AuthService
} from '../../../core/services/auth.service';


@Component({

  selector: 'app-login',

  standalone: true,

  imports: [

    ReactiveFormsModule,

    RouterLink

  ],

  templateUrl:
    './login.component.html',

  styleUrl:
    './login.component.css'

})


export class LoginComponent {


  private readonly auth =
    inject(AuthService);


  private readonly router =
    inject(Router);



  readonly busy =
    signal(false);



  readonly error =
    signal('');



  readonly form =
    new FormGroup({

      email:

        new FormControl(

          '',

          {

            nonNullable:true,

            validators:[

              Validators.required,

              Validators.email

            ]

          }

        ),



      password:

        new FormControl(

          '',

          {

            nonNullable:true,

            validators:[

              Validators.required,

              Validators.minLength(6)

            ]

          }

        )

    });





  submit():void{


    if(

      this.form.invalid ||

      this.busy()

    ){

      this.form.markAllAsTouched();

      return;

    }




    const value =

      this.form.getRawValue();




    this.busy.set(true);

    this.error.set('');




    this.auth

      .login({

        email:

          value.email.trim(),


        password:

          value.password


      })

      .subscribe({



        next: (response) => {

          this.busy.set(false);
        
          console.log("LOGIN SUCCESS", response);
        
          if(response.role === 'Admin'){

            void this.router.navigate(['/admin']);
          
          }
          else{
          
            void this.router.navigate(['/dashboard']);
          
          }
        
        },



        error:(err:HttpErrorResponse)=>{


          this.busy.set(false);



          this.error.set(

            err.error?.message ??

            'Invalid email or password.'

          );


        }



      });



  }



}