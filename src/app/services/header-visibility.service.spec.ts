import { TestBed } from '@angular/core/testing';

import { HeaderVisibilityService } from './header-visibility.service';

describe('HeaderVisibilityService', () => {
  let service: HeaderVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
