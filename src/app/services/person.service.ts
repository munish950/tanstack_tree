import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  status: 'relationship' | 'complicated' | 'single';
  parentId?: string;
  subRows?: Person[];
  children: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private baseUrl = 'http://localhost:3000/persons';

  constructor(private http: HttpClient) {}

  // Get root nodes
  getRootNodes(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}?parentId=root`);
  }

  // Get children for a given parent
  getChildren(parentId: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}?parentId=${parentId}`).pipe(
      map((persons: Person[]) => persons.filter((person) => parentId !== person.id))  // Exclude the parent itself
    );
  }
}
