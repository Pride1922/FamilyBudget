import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderVisibilityService {
  private visible = new BehaviorSubject<boolean>(true);
  headerVisible$ = this.visible.asObservable();

  showHeader() {
    this.visible.next(true);
  }

  hideHeader() {
    this.visible.next(false);
  }
}
