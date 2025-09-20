import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface ActivityRow {
  id: number;
  activity: string;
  q1: number | null;
  q2: number | null;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  year = new Date().getFullYear();

  // Tabs
  activeTab = signal<'Activities' | 'Summary'>('Activities');

  // Users
  users = [
    { name: 'Paolo Roncaglioni', email: 'paolo@example.com' },
    { name: 'Jane Doe', email: 'jane.doe@example.com' },
    { name: 'Akira Tanaka', email: 'akira.t@example.com' }
  ];
  private _selectedUserIndex = signal(0);
  selectedUserIndex = computed(() => this._selectedUserIndex());
  onUserChange(value: string) {
    const idx = Number(value);
    if (!Number.isNaN(idx) && idx >= 0 && idx < this.users.length) {
      this._selectedUserIndex.set(idx);
    }
  }

  // Months
  months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];
  private _selectedMonth = signal<string>(this.months[new Date().getMonth()]);
  selectedMonth = computed(() => this._selectedMonth());
  onMonthChange(value: string) {
    this._selectedMonth.set(value);
  }

  // Activities options
  activityOptions = [
    'Development', 'Design', 'Research', 'Meetings', 'Documentation', 'QA/Testing', 'Support', 'Training'
  ];

  // Dynamic rows
  private nextId = 1;
  private _rows = signal<ActivityRow[]>([
    { id: this.nextId++, activity: '', q1: null, q2: null }
  ]);
  rows = computed(() => this._rows());

  addRow() {
    const current = this._rows();
    this._rows.set([...current, { id: this.nextId++, activity: '', q1: null, q2: null }]);
  }

  deleteRow(id: number) {
    const current = this._rows();
    if (current.length <= 1) {
      // keep at least one empty row for better UX
      this._rows.set([{ id: this.nextId++, activity: '', q1: null, q2: null }]);
      return;
    }
    this._rows.set(current.filter(r => r.id !== id));
  }

  onRowActivityChange(id: number, value: string) {
    this.patchRow(id, { activity: value });
  }

  onRowHoursChange(id: number, key: 'q1' | 'q2', value: number) {
    const safe = Number.isFinite(value) && value >= 0 ? value : null;
    this.patchRow(id, { [key]: safe } as Partial<ActivityRow>);
  }

  private patchRow(id: number, patch: Partial<ActivityRow>) {
    const current = this._rows();
    const idx = current.findIndex(r => r.id === id);
    if (idx >= 0) {
      const updated = { ...current[idx], ...patch } as ActivityRow;
      const next = [...current];
      next[idx] = updated;
      this._rows.set(next);
    }
  }

  // Totals
  totalQ1 = computed(() => this._rows().reduce((sum, r) => sum + (r.q1 ?? 0), 0));
  totalQ2 = computed(() => this._rows().reduce((sum, r) => sum + (r.q2 ?? 0), 0));

  // Submission
  submitting = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  previewJson = computed(() => {
    const payload = this.buildPayload();
    return JSON.stringify(payload, null, 2);
  });

  private buildPayload() {
    const user = this.users[this.selectedUserIndex()];
    const month = this.selectedMonth();
    const activities = this._rows().map(({ activity, q1, q2 }) => ({ activity, q1: q1 ?? 0, q2: q2 ?? 0 }));
    return { user, month, activities, totals: { q1: this.totalQ1(), q2: this.totalQ2() } };
  }

  async submit() {
    this.toastMessage.set(null);
    const payload = this.buildPayload();

    // basic validation
    const hasAny = payload.activities.some(a => a.activity && (a.q1 > 0 || a.q2 > 0));
    if (!hasAny) {
      this.toastType.set('error');
      this.toastMessage.set('Please add at least one activity with hours before submitting.');
      return;
    }

    this.submitting.set(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      this.toastType.set('success');
      this.toastMessage.set('Submitted successfully.');
    } catch (err) {
      this.toastType.set('error');
      this.toastMessage.set('Failed to submit. Your data remains on this page.');
      console.error(err);
    } finally {
      this.submitting.set(false);
    }
  }
}
