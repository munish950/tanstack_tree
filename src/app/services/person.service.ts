import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of, tap, Observable } from 'rxjs';

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
  rootNodesCache: Person[] | null = null;

  constructor(private http: HttpClient) {}

  // Get root nodes
  getRootNodes(): Observable<Person[]> {
    if (this.rootNodesCache) {
      return of(this.rootNodesCache);
    }
    return this.http
      .get<Person[]>(`${this.baseUrl}?parentId=null`)
      .pipe(
        tap((data) => (this.rootNodesCache = data))
      );
  }

  // Get children for a given parent
  getChildren(parentId: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}?parentId=${parentId}&id_ne=${parentId}`)
    .pipe(
      map((children) => {
        if (this.rootNodesCache) {
          const rootIds = new Set(this.rootNodesCache.map((r) => r.id));
          return children.filter((child) => !rootIds.has(child.id));
        }
        return children;
      })
    );
  }
}
