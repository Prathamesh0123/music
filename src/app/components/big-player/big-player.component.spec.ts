import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigPlayerComponent } from './big-player.component';

describe('BigPlayerComponent', () => {
  let component: BigPlayerComponent;
  let fixture: ComponentFixture<BigPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BigPlayerComponent]
    });
    fixture = TestBed.createComponent(BigPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
