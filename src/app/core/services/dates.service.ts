import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneralService } from './general.service';

@Injectable({
    providedIn: 'root'
})
export class DatesService {
    constructor(private generalService: GeneralService) {}

    getDates(): Observable<{ dateTo: string, dateFrom: string }> {
        return this.generalService.getSettingsEnum().pipe(
            map(res => ({
                dateTo: res.data.sales_report_to,
                dateFrom: res.data.sales_report_from
            }))
        );
    }
}