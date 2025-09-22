import { Component, EventEmitter, Input, Output } from '@angular/core';

export type MainTab = 'Activities' | 'WBS' | 'Projects' | 'Users';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html'
})
export class TabsComponent {
  @Input({ required: true }) active!: MainTab;
  @Output() activeChange = new EventEmitter<MainTab>();

  set(tab: MainTab) { this.activeChange.emit(tab); }
}
