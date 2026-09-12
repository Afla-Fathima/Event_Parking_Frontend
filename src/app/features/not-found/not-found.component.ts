import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<section class="nf">
    <div>
      <span>404</span>
      <h1>That route took a wrong turn.</h1>
      <p>The page does not exist, but your bookings are safe.</p>
      <a class="btn btn-primary" routerLink="/events">Back to events</a>
    </div>
  </section>`,
  styles: [
    `
      .nf {
        min-height: calc(100vh - 74px);
        display: grid;
        place-items: center;
        text-align: center;
        padding: 30px;
      }
      .nf div {
        max-width: 560px;
      }
      .nf span {
        font-size: 90px;
        font-weight: 900;
        line-height: 1;
        color: #dedcff;
      }
      .nf h1 {
        font-size: 38px;
      }
      .nf p {
        color: var(--muted);
        margin-bottom: 20px;
      }
    `,
  ],
})
export class NotFoundComponent {}
