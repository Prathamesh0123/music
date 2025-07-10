import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMusicPlayerComponent } from './main-music-player.component';

describe('MainMusicPlayerComponent', () => {
  let component: MainMusicPlayerComponent;
  let fixture: ComponentFixture<MainMusicPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainMusicPlayerComponent]
    });
    fixture = TestBed.createComponent(MainMusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
