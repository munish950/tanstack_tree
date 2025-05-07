import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DebugElement, ElementRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs'

import { Person } from './services/person.service'
import { AppComponent } from './app.component'
import { PersonService } from './services/person.service'

fdescribe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockPersonService: jasmine.SpyObj<PersonService>;
  const mockRootNodes = getRootNodes();

  beforeEach(async () => {
    mockPersonService = jasmine.createSpyObj('PersonService', ['getRootNodes', 'getChildren']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: PersonService, useValue: mockPersonService }],
    }).compileComponents();

    mockPersonService.getRootNodes.and.returnValue(of(mockRootNodes));

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  });

  it('should call getRootNodes only once', () => {
    expect(mockPersonService.getRootNodes).toHaveBeenCalledTimes(1);
  });

  it('should render only visible rows in the virtual scroll viewport', fakeAsync(() => {
    mockPersonService.getRootNodes.and.returnValue(of(getRootNodes()));
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const viewportDebugEl: DebugElement = fixture.debugElement.query(By.directive(CdkVirtualScrollViewport));
    const viewportEl: HTMLElement = viewportDebugEl.nativeElement;
    const renderedItems = viewportEl.querySelectorAll('.item-row');

    expect(renderedItems.length).toBeGreaterThan(0);
    expect(renderedItems.length).toBeLessThan(component.data().length);
  }));
})

function getRootNodes(): Person[] {
  return Array.from({ length: 100 }, (_, i) => ({
    id: `${i + 1}`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    age: 25 + i,
    visits: 10,
    progress: 50,
    status: 'single',
    children: [],
  }));
}
