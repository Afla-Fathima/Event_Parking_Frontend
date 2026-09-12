import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Category, CategoryWrite } from '../../../core/models/api.models';
import { CategoryService } from '../../../core/services/api.services';
import {
  ConfirmDialogComponent,
  EmptyComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent, EmptyComponent, LoadingComponent],
  templateUrl: './categories.component.html',
   styleUrl: './categories.component.css',
})
export class AdminCategoriesComponent {
  private readonly api = inject(CategoryService);
  readonly items = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly editing = signal<Category | null>(null);
  readonly deleteTarget = signal<Category | null>(null);
  model: CategoryWrite = { categoryName: '', description: '' };
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (d) => {
        this.items.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load categories.');
        this.loading.set(false);
      },
    });
  }
  edit(c: Category): void {
    this.editing.set(c);
    this.model = { categoryName: c.categoryName, description: c.description };
  }
  reset(form?: NgForm): void {
    this.editing.set(null);
    this.model = { categoryName: '', description: '' };
    form?.resetForm(this.model);
  }
  save(form: NgForm): void {
    if (form.invalid || this.busy()) return;
    this.busy.set(true);
    const c = this.editing();
    const request = c
      ? this.api.update(c.categoryId, { ...this.model, status: c.status || 'Active' })
      : this.api.create(this.model);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.reset(form);
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e.error?.message ?? 'Unable to save category.');
      },
    });
  }
  remove(): void {
    const c = this.deleteTarget();
    if (!c) return;
    this.api.delete(c.categoryId).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
      },
      error: (e) => {
        this.deleteTarget.set(null);
        this.error.set(e.error?.message ?? 'Unable to delete category.');
      },
    });
  }
}
