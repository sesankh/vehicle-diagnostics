import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagnosticUi } from './diagnostic-ui';

describe('DiagnosticUi', () => {
  let component: DiagnosticUi;
  let fixture: ComponentFixture<DiagnosticUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticUi],
    }).compileComponents();

    fixture = TestBed.createComponent(DiagnosticUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
