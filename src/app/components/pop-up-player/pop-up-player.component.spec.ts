import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpPlayerComponent } from './pop-up-player.component';

describe('PopUpPlayerComponent', () => {
  let component: PopUpPlayerComponent;
  let fixture: ComponentFixture<PopUpPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopUpPlayerComponent]
    });
    fixture = TestBed.createComponent(PopUpPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
