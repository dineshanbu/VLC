import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacovigilanceReport, PharmacovigilanceService } from '../../../core/services/pharmacovigilance.service';

@Component({ selector: 'app-pharmacovigilance-management', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './pharmacovigilance-management.html', styleUrls: ['./pharmacovigilance-management.css', '../contact-management/contact-management.css'] })
export class PharmacovigilanceManagementComponent implements OnInit {
  private service = inject(PharmacovigilanceService);
  reports = signal<PharmacovigilanceReport[]>([]); isLoading = signal(true); search = signal(''); status = signal('All'); selected = signal<PharmacovigilanceReport | null>(null); notes = signal('');
  ngOnInit() { this.loadReports(); }
  loadReports() { this.isLoading.set(true); this.service.getReports({ search: this.search(), status: this.status() }).subscribe({ next: r => { this.reports.set(r.reports || []); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); }
  open(report: PharmacovigilanceReport) { this.selected.set(report); this.notes.set(report.notes || ''); }
  close() { this.selected.set(null); }
  save(status?: PharmacovigilanceReport['status']) { const report = this.selected(); if (!report?.id) return; this.service.updateReport(report.id, { status: status || report.status, notes: this.notes() }).subscribe(() => { report.status = status || report.status; report.notes = this.notes(); this.loadReports(); }); }
}
