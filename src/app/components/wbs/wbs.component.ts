import { Component, computed, signal } from '@angular/core';

interface WbsColumn { key: 'name' | 'code' | 'tow' | 'country' | 'priority' | 'cci' | 'revenue'; label: string; type: 'text' | 'number' | 'select' }
interface WbsRow { id: number; name?: string; code?: string; tow?: string; country?: string; priority?: number; cci?: number; revenue?: number; [key: string]: any }

@Component({
  selector: 'app-wbs',
  standalone: true,
  templateUrl: './wbs.component.html'
})
export class WbsComponent {
  // WBS selector
  wbsOptions = ['WBS A', 'WBS B', 'WBS C'];
  private _selectedWbs = signal<string>(this.wbsOptions[0]);
  selectedWbs = computed(() => this._selectedWbs());
  onWbsChange(value: string) { this._selectedWbs.set(value); }

  // Fixed columns per spec
  columns: WbsColumn[] = [
    { key: 'name', label: 'WBS Name', type: 'text' },
    { key: 'code', label: 'WBS Code', type: 'text' },
    { key: 'tow', label: 'ToW', type: 'select' },
    { key: 'country', label: 'Country', type: 'select' },
    { key: 'priority', label: 'Priority', type: 'number' },
    { key: 'cci', label: 'CCI', type: 'number' },
    { key: 'revenue', label: 'Revenue', type: 'number' }
  ];

  // Rows
  private nextId = 1;
  private _rows = signal<WbsRow[]>([{ id: this.nextId++ }]);
  rows = computed(() => this._rows());

  addRow() { this._rows.set([...this._rows(), { id: this.nextId++ }]); }
  deleteRow(id: number) {
    const current = this._rows();
    if (current.length <= 1) return; // keep at least one row
    this._rows.set(current.filter(r => r.id !== id));
  }

  onCellChange(rowId: number, key: string, raw: string) {
    const col = this.columns.find(c => c.key === key);
    const value = col?.type === 'number' ? Number(raw) : raw;
    this._rows.set(this._rows().map(r => r.id === rowId ? { ...r, [key]: value } : r));
  }

  onSelectChange(rowId: number, key: string, value: string) {
    this._rows.set(this._rows().map(r => r.id === rowId ? { ...r, [key]: value } : r));
  }

  submitting = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  towOptions = ['ADM', 'Build', 'Run', 'Consulting'];
  countryOptions = ['USA', 'Italy', 'UK', 'Germany', 'France', 'India'];

  // Header single-row state
  header = signal<{ name: string; code: string; tow: string; country: string; priority: number | null; cci: number | null; revenue: number | null; referenceContract: string }>({
    name: '', code: '', tow: '', country: '', priority: null, cci: null, revenue: null, referenceContract: ''
  });
  onHeaderChange(key: keyof ReturnType<typeof this.header>, value: any) {
    const current = this.header();
    this.header.set({ ...current, [key]: value });
  }

  buildPayload() {
    return { wbs: this.selectedWbs(), header: this.header(), columns: this.columns, rows: this.rows() };
  }

  async submit() {
    this.toastMessage.set(null);
    const payload = this.buildPayload();
    this.submitting.set(true);
    try {
      const res = await fetch('/api/wbs/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.toastType.set('success'); this.toastMessage.set('WBS configuration submitted.');
    } catch (err) {
      this.toastType.set('error'); this.toastMessage.set('Failed to submit WBS configuration.'); console.error(err);
    } finally { this.submitting.set(false); }
  }
}
