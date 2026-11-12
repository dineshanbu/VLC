import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { PharmacovigilanceService } from './pharmacovigilance.service';

describe('PharmacovigilanceService report deletion', () => {
  let service: PharmacovigilanceService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/pharmacovigilance`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PharmacovigilanceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a DELETE request for the selected safety report', () => {
    service.deleteReport(42).subscribe();
    const request = http.expectOne(`${endpoint}/42`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ success: true, message: 'Safety report deleted.' });
  });
});
