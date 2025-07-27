import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
  name: 'timeFormat',
  standalone:false
})
export class FormattedTimePipe implements PipeTransform {
  transform(value: number): string {
    let formattedTime: string;
    const duration = moment.duration(value, 'minutes');
    if (duration.asMinutes() < 1) {
      formattedTime = 'اقل من دقيقة';
    } else {
      formattedTime = duration.humanize();
    }
    return formattedTime;
  }
}