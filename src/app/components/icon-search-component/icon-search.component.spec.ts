import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSearchComponentComponent } from './icon-search.component';

describe('IconSearchComponentComponent', () => {
  let component: IconSearchComponentComponent;
  let fixture: ComponentFixture<IconSearchComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconSearchComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconSearchComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
