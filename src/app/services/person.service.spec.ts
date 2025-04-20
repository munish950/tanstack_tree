import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

import { PersonService, Person } from './person.service'


describe('PersonService', () => {
  let service: PersonService;
  let httpMock: HttpTestingController;
  const mockRootNodes: Person[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'cena',
      age: 30,
      visits: 10,
      progress: 50,
      status: 'single',
      children: [],
    }
  ];
  const mockChildren: Person[] = [
    {
      id: '2',
      firstName: 'Zade',
      lastName: 'Smith',
      age: 25,
      visits: 8,
      progress: 70,
      status: 'relationship',
      parentId: '1',
      children: [],
    }
  ]

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PersonService]
    });
    service = TestBed.inject(PersonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch root nodes', () => {
    service.getRootNodes().subscribe(data => {
      expect(data).toEqual(mockRootNodes)
    })

    const req = httpMock.expectOne('http://localhost:3000/persons?parentId=null')
    
    expect(req.request.method).toBe('GET')
    
    req.flush(mockRootNodes)
  });

  it('should fetch children and filter out root nodes', () => {
    service.rootNodesCache = mockRootNodes;
    const childrenWithRoot = [...mockChildren, mockRootNodes[0]];

    service.getChildren('1').subscribe(data => {
      expect(data.length).toBe(1)
      expect(data[0].id).toBe('2')
    })

    const req = httpMock.expectOne('http://localhost:3000/persons?parentId=1&id_ne=1')
    expect(req.request.method).toBe('GET')
    req.flush(childrenWithRoot)
  });
});
