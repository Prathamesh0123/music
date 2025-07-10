import { TestBed } from '@angular/core/testing';

import { MusicFetchApiService } from './music-fetch-api.service';

describe('MusicFetchApiService', () => {
  let service: MusicFetchApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicFetchApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
