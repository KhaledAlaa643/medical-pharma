import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Progress_barService {
//boolean to show and hide progress bar
public isLoading:BehaviorSubject<boolean>=new BehaviorSubject<boolean>(false);
public isHidden:BehaviorSubject<boolean>=new BehaviorSubject<boolean>(false);
//number to set progress value
public progressValue:BehaviorSubject<number> = new BehaviorSubject<number>(0);

constructor() { }

show() {
  setTimeout(() => {
    this.isHidden.next(false)
    this.isLoading.next(true);
    
  }, 100);
}

updateProgress(value: number) {
  this.progressValue.next(value);
}

hide() {
  setTimeout(() => {
    this.isHidden.next(true)
    this.isLoading.next(false);
  }, 100);
}
}
