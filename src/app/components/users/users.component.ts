import { Component, computed, signal } from '@angular/core';

interface UserRow { id: number; name: string; email: string; lcr: number | null; tow: string; country: string; isAllocable: boolean }

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html'
})
export class UsersComponent {
  towOptions = ['ADM', 'Build', 'Run', 'Consulting'];
  countryOptions = ['USA', 'Italy', 'UK', 'Germany', 'France', 'India'];

  private nextId = 1;
  private _rows = signal<UserRow[]>([
    { id: this.nextId++, name: 'Paolo Roncaglioni', email: 'paolo@example.com', lcr: 100, tow: 'Consulting', country: 'Italy', isAllocable: true }
  ]);
  rows = computed(() => this._rows());

  addRow() {
    this._rows.set([...this._rows(), { id: this.nextId++, name: '', email: '', lcr: null, tow: '', country: '', isAllocable: false }]);
  }
  deleteRow(id: number) {
    const current = this._rows();
    if (current.length <= 1) { this._rows.set([{ id: this.nextId++, name: '', email: '', lcr: null, tow: '', country: '', isAllocable: false }]); return; }
    this._rows.set(current.filter(r => r.id !== id));
  }

  onChange<K extends keyof UserRow>(id: number, key: K, value: any) {
    this._rows.set(this._rows().map(r => r.id === id ? { ...r, [key]: value } as UserRow : r));
  }

  submitting = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  buildPayload() { return { users: this.rows() }; }

  async submit() {
    this.toastMessage.set(null);
    const payload = this.buildPayload();
    this.submitting.set(true);
    try {
      const res = await fetch('/api/users/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.toastType.set('success'); this.toastMessage.set('Users saved.');
    } catch (err) {
      this.toastType.set('error'); this.toastMessage.set('Failed to save users.'); console.error(err);
    } finally { this.submitting.set(false); }
  }
}
