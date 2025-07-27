import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class FixedDataService {
  paymentType = [
    {
      nameAR: 'نقدي فقط',
      nameEN: 'CASH_ONLY',
      id: 7,
      payment_period: 0

    },
    {
      nameAR: 'تحصيل السبت',
      nameEN: 'COLLECTING_ON_SATURDAY',
      id: 0,
      payment_period: 2
    },
    {
      nameAR: 'تحصيل الاحد',
      nameEN: 'COLLECTING_ON_SUNDAY',
      id: 1,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل الاثنين',
      nameEN: 'COLLECTING_ON_MONDAY',
      id: 2,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل الثلاثاء',
      nameEN: 'COLLECTING_ON_TUESDAY',
      id: 3,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل الاربعاء',
      nameEN: 'COLLECTING_ON_WEDNESDAY ',
      id: 4,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل الخميس ',
      nameEN: 'COLLECTING_ON_THURSDAY',
      id: 5,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل الجمعة',
      nameEN: 'COLLECTING_ON_FRIDAY ',
      id: 6,
      payment_period: 2

    },
    {
      nameAR: 'نقدي فقط',
      nameEN: 'CASH_ONLY',
      id: 7,
      payment_period: 0

    },
    {
      nameAR: 'نقدي',
      nameEN: 'CASH',
      id: 8,
      payment_period: 1

    },
    {
      nameAR: 'فاتورة و فاتورة',
      nameEN: 'INVOICE_AND_INVOICE',
      id: 9,
      payment_period: 3

    },
    {
      nameAR: 'تحصيل 10 ايام ',
      nameEN: 'COLLECTING_IN_TEN_DAYS',
      id: 10,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل 15 ايام',
      nameEN: 'COLLECTING_IN_FIFTEEN_DAYS',
      id: 11,
      payment_period: 2

    },
    {
      nameAR: 'تحصيل شهر',
      nameEN: 'COLLECTING_IN_MONTH',
      id: 12,
      payment_period: 2

    }
  ]
  paymentPeriod = [
    {
      nameAR: "لا توجد فترة سماح",
      id: 0

    },
    {
      nameAR: "فترة السماح 1 يوم",
      id: 1

    },
    {
      nameAR: "فترة السماح 2 يوم",
      id: 2

    },
    {
      nameAR: "فترة السماح 3 يوم",
      id: 3

    },
    {
      nameAR: "فترة السماح 4 يوم",
      id: 4

    }
  ]
  constructor(private http: HttpService,private generalService:GeneralService) { }

  getPaymentType() {
    return this.paymentType
  }

  getPaymentPeriod() {
    return this.paymentPeriod
  }

  getAllFixedData() {
    return this.generalService.getSettingsEnum()
  }
}
