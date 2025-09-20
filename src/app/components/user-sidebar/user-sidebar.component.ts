import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface UserInfo { name: string; email: string; }

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  templateUrl: './user-sidebar.component.html'
})
export class UserSidebarComponent {
  @Input({ required: true }) users: UserInfo[] = [];
  @Input({ required: true }) selectedIndex = 0;
  @Output() selectedIndexChange = new EventEmitter<number>();

  onChange(value: string) {
    const idx = Number(value);
    if (!Number.isNaN(idx)) this.selectedIndexChange.emit(idx);
  }
}
