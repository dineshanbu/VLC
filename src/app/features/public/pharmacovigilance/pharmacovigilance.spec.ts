import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PharmacovigilanceService } from '../../../core/services/pharmacovigilance.service';
import { SectionHeadingsService } from '../../../core/services/section-headings.service';
import { TranslationService } from '../../../core/services/translation.service';
import { PharmacovigilanceComponent } from './pharmacovigilance';

describe('PharmacovigilanceComponent form changes', () => {
  let fixture: ComponentFixture<PharmacovigilanceComponent>;
  let service: jasmine.SpyObj<PharmacovigilanceService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<PharmacovigilanceService>('PharmacovigilanceService', ['getPageSettings', 'submitReport']);
    service.getPageSettings.and.returnValue(of({ success: true, settings: {} as never }));
    service.submitReport.and.returnValue(of({ success: true, reportId: 1 }));

    await TestBed.configureTestingModule({
      imports: [PharmacovigilanceComponent],
      providers: [
        provideRouter([]),
        { provide: PharmacovigilanceService, useValue: service },
        { provide: SectionHeadingsService, useValue: { load: () => of({}), get: (_key: string, english: string) => english } },
        { provide: TranslationService, useValue: { currentLang: () => 'en', isRtl: () => false, translate: () => '' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacovigilanceComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('shows patient name, removes the reporter optional note and uses a text date input without required fields', () => {
    const element = fixture.nativeElement as HTMLElement;
    const dateInput = element.querySelector<HTMLInputElement>('#expirationDate');
    expect(element.querySelector('#patientName')).not.toBeNull();
    expect(element.querySelector('label[for="reporterName"]')?.textContent).not.toContain('Optional');
    expect(dateInput?.type).toBe('text');
    expect(dateInput?.placeholder).toBe('DD/MM/YYYY');
    expect(element.querySelector('#batchNumber')?.hasAttribute('required')).toBeFalse();
    expect(dateInput?.hasAttribute('required')).toBeFalse();
  });

  it('submits without batch number or expiration date and includes the patient name', () => {
    const component = fixture.componentInstance;
    Object.assign(component.formModel, {
      reporterName: 'Reporter', patientName: 'Patient', contactNumber: '12345', email: '',
      productName: 'Vaccine', batchNumber: '', expirationDate: '', occupation: '',
      sideEffectDescription: 'Reported reaction', otherInfo: ''
    });

    component.submitReport();

    expect(service.submitReport).toHaveBeenCalledWith(jasmine.objectContaining({
      patientName: 'Patient', batchNumber: '', expirationDate: ''
    }));
    expect(component.formSubmitted()).toBeTrue();
  });

  it('accepts a Saudi-style expiration date and sends ISO format to the API', () => {
    const component = fixture.componentInstance;
    Object.assign(component.formModel, {
      contactNumber: '12345', productName: 'Vaccine', sideEffectDescription: 'Reported reaction',
      batchNumber: '', expirationDate: '31/12/2026'
    });

    component.submitReport();

    expect(service.submitReport).toHaveBeenCalledWith(jasmine.objectContaining({ expirationDate: '2026-12-31' }));
  });

  it('rejects an invalid expiration date with the expected entry format', () => {
    const component = fixture.componentInstance;
    Object.assign(component.formModel, {
      contactNumber: '12345', productName: 'Vaccine', sideEffectDescription: 'Reported reaction',
      batchNumber: '', expirationDate: '31/02/2026'
    });

    component.submitReport();

    expect(service.submitReport).not.toHaveBeenCalled();
    expect(component.submissionError()).toContain('DD/MM/YYYY');
  });
});
