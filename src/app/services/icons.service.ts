import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IconsService {

  private iconsUrl = 'assets/icons.json'; // Path to the icons.json file

  constructor(private http: HttpClient) { }

  getIcons(): Observable<string[]> {
    return this.http.get<string[]>(this.iconsUrl);
  }

  searchIcons(term: string): Observable<string[]> {
    return this.getIcons().pipe(
      map(icons => icons.filter(icon => icon.toLowerCase().includes(term.toLowerCase())))
    );
  }
}
