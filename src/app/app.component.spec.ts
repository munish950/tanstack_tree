import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { AppComponent } from './app.component'
import { PersonService } from './services/person.service'
import { of } from 'rxjs'
import { Person } from './services/person.service'

describe('AppComponent', () => {
  let component: AppComponent
  let fixture: ComponentFixture<AppComponent>
  let mockPersonService: jasmine.SpyObj<PersonService>

  beforeEach(async () => {
    mockPersonService = jasmine.createSpyObj('PersonService', ['getRootNodes', 'getChildren']);

    mockPersonService.getRootNodes.and.returnValue(of([]));
    mockPersonService.getChildren.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: PersonService, useValue: mockPersonService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(AppComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  });

  it('should load root nodes on init', () => {
    expect(mockPersonService.getRootNodes).toHaveBeenCalled()
  });
})
