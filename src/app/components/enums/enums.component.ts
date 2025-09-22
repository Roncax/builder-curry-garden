import { Component, computed, signal } from '@angular/core';

interface ActivityEnum { id: number; code: string; isChargeable: boolean; description: string }
interface TowEnum { id: number; code: string; description: string }
interface LocationEnum { id: number; code: string; country: string; description: string }
interface ClientEnum { id: number; code: string; description: string }

@Component({
  selector: 'app-enums',
  standalone: true,
  templateUrl: './enums.component.html'
})
export class EnumsComponent {
  // Activity
  private nextAct = 1;
  private _activities = signal<ActivityEnum[]>([{ id: this.nextAct++, code: 'DEV', isChargeable: true, description: 'Development' }]);
  activities = computed(() => this._activities());
  addActivity() { this._activities.set([...this._activities(), { id: this.nextAct++, code: '', isChargeable: false, description: '' }]); }
  delActivity(id: number) { const c = this._activities(); if (c.length <= 1) return; this._activities.set(c.filter(r => r.id !== id)); }
  setActivity(id: number, key: keyof ActivityEnum, value: any) { this._activities.set(this._activities().map(r => r.id === id ? { ...r, [key]: value } : r)); }

  // ToW
  private nextTow = 1;
  private _tows = signal<TowEnum[]>([{ id: this.nextTow++, code: 'CONS', description: 'Consulting' }]);
  tows = computed(() => this._tows());
  addTow() { this._tows.set([...this._tows(), { id: this.nextTow++, code: '', description: '' }]); }
  delTow(id: number) { const c = this._tows(); if (c.length <= 1) return; this._tows.set(c.filter(r => r.id !== id)); }
  setTow(id: number, key: keyof TowEnum, value: any) { this._tows.set(this._tows().map(r => r.id === id ? { ...r, [key]: value } : r)); }

  // Location
  private nextLoc = 1;
  private _locations = signal<LocationEnum[]>([{ id: this.nextLoc++, code: 'ROM', country: 'Italy', description: 'Rome' }]);
  locations = computed(() => this._locations());
  addLocation() { this._locations.set([...this._locations(), { id: this.nextLoc++, code: '', country: '', description: '' }]); }
  delLocation(id: number) { const c = this._locations(); if (c.length <= 1) return; this._locations.set(c.filter(r => r.id !== id)); }
  setLocation(id: number, key: keyof LocationEnum, value: any) { this._locations.set(this._locations().map(r => r.id === id ? { ...r, [key]: value } : r)); }

  // Client
  private nextClient = 1;
  private _clients = signal<ClientEnum[]>([{ id: this.nextClient++, code: 'ACN', description: 'Accenture' }]);
  clients = computed(() => this._clients());
  addClient() { this._clients.set([...this._clients(), { id: this.nextClient++, code: '', description: '' }]); }
  delClient(id: number) { const c = this._clients(); if (c.length <= 1) return; this._clients.set(c.filter(r => r.id !== id)); }
  setClient(id: number, key: keyof ClientEnum, value: any) { this._clients.set(this._clients().map(r => r.id === id ? { ...r, [key]: value } : r)); }

  // Submit handlers per table
  submitting = signal<{[k: string]: boolean}>({});
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  private async post(url: string, body: any) {
    this.toastMessage.set(null);
    this.submitting.set({ ...this.submitting(), [url]: true });
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.toastType.set('success'); this.toastMessage.set('Saved.');
    } catch (err) {
      this.toastType.set('error'); this.toastMessage.set('Failed to save.'); console.error(err);
    } finally {
      const { [url]: _, ...rest } = this.submitting();
      this.submitting.set(rest);
    }
  }

  submitActivities() { return this.post('/api/enums/activity/submit', { activities: this.activities() }); }
  submitTows() { return this.post('/api/enums/tow/submit', { tows: this.tows() }); }
  submitLocations() { return this.post('/api/enums/location/submit', { locations: this.locations() }); }
  submitClients() { return this.post('/api/enums/client/submit', { clients: this.clients() }); }
}
