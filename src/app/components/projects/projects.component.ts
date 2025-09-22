import { Component, computed, signal } from '@angular/core';

interface ProjectRow { id: number; client: string; revenue: number | null; cost: number | null; cci: number | null }

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html'
})
export class ProjectsComponent {
  private nextId = 1;
  private _rows = signal<ProjectRow[]>([{ id: this.nextId++, client: '', revenue: null, cost: null, cci: null }]);
  rows = computed(() => this._rows());

  addRow() { this._rows.set([...this._rows(), { id: this.nextId++, client: '', revenue: null, cost: null, cci: null }]); }
  deleteRow(id: number) {
    const curr = this._rows();
    if (curr.length <= 1) return;
    this._rows.set(curr.filter(r => r.id !== id));
  }

  onChange<K extends keyof ProjectRow>(id: number, key: K, value: any) {
    const v = key === 'client' ? value : (value === '' ? null : Number(value));
    this._rows.set(this._rows().map(r => r.id === id ? { ...r, [key]: v } as ProjectRow : r));
  }

  submitting = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  buildPayload() { return { projects: this.rows() }; }

  async submit() {
    this.toastMessage.set(null);
    const payload = this.buildPayload();
    this.submitting.set(true);
    try {
      const res = await fetch('/api/projects/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.toastType.set('success'); this.toastMessage.set('Projects saved.');
    } catch (err) {
      this.toastType.set('error'); this.toastMessage.set('Failed to save projects.'); console.error(err);
    } finally { this.submitting.set(false); }
  }
}
