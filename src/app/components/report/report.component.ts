import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-report',
  standalone: true,
  templateUrl: './report.component.html'
})
export class ReportComponent {
  generating = signal(false);
  message = signal<string | null>(null);
  type = signal<'success' | 'error'>('success');

  async generate() {
    this.message.set(null);
    this.generating.set(true);
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition || '');
      const filename = decodeURIComponent((match?.[1] || match?.[2] || 'report.csv'));

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      this.type.set('success');
      this.message.set('Report generated. Download should begin automatically.');
    } catch (err) {
      this.type.set('error');
      this.message.set('Failed to generate report.');
      console.error(err);
    } finally {
      this.generating.set(false);
    }
  }
}
