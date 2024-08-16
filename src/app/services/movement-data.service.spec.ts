import { TestBed } from '@angular/core/testing';

import { MovementDataService } from './movement-data.service';

describe('MovementDataService', () => {
  let service: MovementDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovementDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
