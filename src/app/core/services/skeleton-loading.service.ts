import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SkeletonLoadingService {

public show_Skeleton = false;
public Skeleton_type = 2;

constructor() { }

 showSkeleton(){
  this.show_Skeleton = true
 }

 hideSkeleton(){
  this.show_Skeleton = false
 }

 chooseSkeletonType(typeNumber:number){
  this.Skeleton_type = typeNumber;
 }
}
