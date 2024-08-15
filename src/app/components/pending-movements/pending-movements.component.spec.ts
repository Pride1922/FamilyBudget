import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingMovementsComponent } from './pending-movements.component';

describe('PendingMovementsComponent', () => {
  let component: PendingMovementsComponent;
  let fixture: ComponentFixture<PendingMovementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingMovementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingMovementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
