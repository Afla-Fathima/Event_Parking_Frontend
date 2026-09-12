import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';
import {
  Location
} from '@angular/common';



function passwordMatch(
  control: AbstractControl
): ValidationErrors | null {

  return (
    control.get('password')?.value ===
    control.get('confirmPassword')?.value
  )
    ? null
    : {
        passwordMismatch: true
      };
}



@Component({

  selector: 'app-register',

  standalone: true,

  imports: [

    ReactiveFormsModule,
    RouterLink

  ],

  templateUrl:
    './register.component.html',

  styleUrl:
    './register.component.css',

})


export class RegisterComponent {


  private readonly auth =
    inject(AuthService);


  private readonly router =
    inject(Router);



  readonly busy =
    signal(false);



  readonly error =
    signal('');



  readonly success =
    signal('');



  readonly form =
    new FormGroup(

      {


        fullName:

          new FormControl(

            '',

            {

              nonNullable:true,

              validators:[

                Validators.required,

                Validators.minLength(2)

              ]

            }

          ),



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




        phone:

          new FormControl(

            '',

            {

              nonNullable:true,

              validators:[

                Validators.required,


                Validators.pattern(

                  /^[0-9+\- ]{7,20}$/

                )

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

          ),




        confirmPassword:

          new FormControl(

            '',

            {

              nonNullable:true,

              validators:[

                Validators.required

              ]

            }

          )

      },

      {

        validators:

          passwordMatch

      }

    );




  constructor(){


    this.form.controls

      .email

      .valueChanges

      .subscribe(

        ()=>this.clearEmailTakenError()

      );


  }






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

    this.success.set('');





    this.auth

      .register({

        fullName:

          value.fullName.trim(),


        email:

          value.email.trim(),


        phone:

          value.phone.trim(),


        password:

          value.password


      })


      .subscribe({



        next: () => {

          this.busy.set(false);
        
          this.success.set(
            'Account created successfully. Redirecting to sign in...'
          );
        
        
          this.form.reset();
        
        
          setTimeout(() => {
        
            void this.router.navigate([
              '/login'
            ]);
        
          }, 1000);
        
        
        },

        error:(error:HttpErrorResponse)=>{



          this.busy.set(false);



          const message =

            String(

              error.error?.message ?? ''

            );



          const lowerMessage =

            message.toLowerCase();





          const duplicateEmail =


            error.status === 409 &&


            lowerMessage.includes('email') &&


            (

              lowerMessage.includes('exist') ||

              lowerMessage.includes('duplicate')

            );





          if(duplicateEmail){



            const emailControl =

              this.form.controls.email;




            emailControl.setErrors({


              ...(emailControl.errors ?? {}),


              emailTaken:true


            });




            emailControl.markAsTouched();



            this.error.set('');

            return;


          }




          this.error.set(

            message ||

            'Unable to create account.'

          );


        }


      });


  }





  private clearEmailTakenError():void{


    const emailControl =

      this.form.controls.email;



    if(

      !emailControl.errors?.['emailTaken']

    ){

      return;

    }




    const errors = {

      ...emailControl.errors

    };




    delete errors['emailTaken'];



    emailControl.setErrors(

      Object.keys(errors).length

      ? errors

      : null

    );

  }


}