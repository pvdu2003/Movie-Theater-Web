import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatemovieComponent } from './updatemovie.component';

describe('UpdatemovieComponent', () => {
  let component: UpdatemovieComponent;
  let fixture: ComponentFixture<UpdatemovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatemovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatemovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
