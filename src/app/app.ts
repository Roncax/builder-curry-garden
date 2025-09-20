import { Component, computed, signal } from '@angular/core';
import { ActivitiesComponent } from './components/activities/activities.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ActivitiesComponent],
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

  // Receive live payload from Activities component for Summary tab
  private latestPayload = signal<any | null>(null);
  onPayloadChange(payload: any) { this.latestPayload.set(payload); }

  previewJson = computed(() => this.latestPayload() ? JSON.stringify(this.latestPayload(), null, 2) : 'Fill in the Activities tab to see a summary here.');
}
