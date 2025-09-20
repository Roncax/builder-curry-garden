import { Component, Input, Output, EventEmitter, computed, effect, signal } from '@angular/core';

interface ActivityRow {
  id: number;
  activity: string;
  q1: number | null;
  q2: number | null;
}

export interface UserInfo { name: string; email: string; }

@Component({
  selector: 'app-activities',
  standalone: true,
  templateUrl: './activities.component.html'
})
export class ActivitiesComponent {
  @Input({ required: true }) selectedUser!: UserInfo;
  @Output() payloadChange = new EventEmitter<any>();

  months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];
  private _selectedMonth = signal<string>(this.months[new Date().getMonth()]);
  selectedMonth = computed(() => this._selectedMonth());
  onMonthChange(value: string) { this._selectedMonth.set(value); }

  // Years
  private currentYear = new Date().getFullYear();
  years = Array.from({ length: 7 }, (_, i) => this.currentYear - 3 + i);
  private _selectedYear = signal<number>(this.currentYear);
  selectedYear = computed(() => this._selectedYear());
  onYearChange(value: string | number) { const yr = Number(value); if (!Number.isNaN(yr)) this._selectedYear.set(yr); }

  activityOptions = [
    'Development', 'Design', 'Research', 'Meetings', 'Documentation', 'QA/Testing', 'Support', 'Training'
  ];

  private nextId = 1;
  private _rows = signal<ActivityRow[]>([
    { id: this.nextId++, activity: '', q1: null, q2: null }
  ]);
  rows = computed(() => this._rows());

  addRow() { this._rows.set([...this._rows(), { id: this.nextId++, activity: '', q1: null, q2: null }]); }
  deleteRow(id: number) {
    const current = this._rows();
    if (current.length <= 1) { this._rows.set([{ id: this.nextId++, activity: '', q1: null, q2: null }]); return; }
    this._rows.set(current.filter(r => r.id !== id));
  }
  onRowActivityChange(id: number, value: string) { this.patchRow(id, { activity: value }); }
  onRowHoursChange(id: number, key: 'q1' | 'q2', value: number) {
    const safe = Number.isFinite(value) && value >= 0 ? value : null; this.patchRow(id, { [key]: safe } as Partial<ActivityRow>);
  }
  private patchRow(id: number, patch: Partial<ActivityRow>) {
    const current = this._rows();
    const idx = current.findIndex(r => r.id === id);
    if (idx >= 0) { const next = [...current]; next[idx] = { ...current[idx], ...patch }; this._rows.set(next); }
  }

  totalQ1 = computed(() => this._rows().reduce((sum, r) => sum + (r.q1 ?? 0), 0));
  totalQ2 = computed(() => this._rows().reduce((sum, r) => sum + (r.q2 ?? 0), 0));

  submitting = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  constructor() {
    effect(() => {
      this.payloadChange.emit(this.buildPayload());
    });
  }

  private buildPayload() {
    const user = this.selectedUser;
    const month = this.selectedMonth();
    const year = this.selectedYear();
    const activities = this._rows().map(({ activity, q1, q2 }) => ({ activity, q1: q1 ?? 0, q2: q2 ?? 0 }));
    return { user, month, year, activities, totals: { q1: this.totalQ1(), q2: this.totalQ2() } };
  }

  async submit() {
    this.toastMessage.set(null);
    const payload = this.buildPayload();
    const hasAny = payload.activities.some(a => a.activity && (a.q1 > 0 || a.q2 > 0));
    if (!hasAny) { this.toastType.set('error'); this.toastMessage.set('Please add at least one activity with hours before submitting.'); return; }

    this.submitting.set(true);
    try {
      const res = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.toastType.set('success'); this.toastMessage.set('Submitted successfully.');
    } catch (err) {
      this.toastType.set('error'); this.toastMessage.set('Failed to submit. Your data remains on this page.'); console.error(err);
    } finally { this.submitting.set(false); }
  }
}
