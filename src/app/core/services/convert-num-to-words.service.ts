import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ArabicNumberConverterService {
  private ones = [
    '',
    'واحد',
    'اثنان',
    'ثلاثة',
    'أربعة',
    'خمسة',
    'ستة',
    'سبعة',
    'ثمانية',
    'تسعة',
  ];

  private tens = [
    '',
    'عشرة',
    'عشرون',
    'ثلاثون',
    'أربعون',
    'خمسون',
    'ستون',
    'سبعون',
    'ثمانون',
    'تسعون',
  ];

  private teens = [
    'عشرة',
    'أحد عشر',
    'اثنا عشر',
    'ثلاثة عشر',
    'أربعة عشر',
    'خمسة عشر',
    'ستة عشر',
    'سبعة عشر',
    'ثمانية عشر',
    'تسعة عشر',
  ];

  private hundreds = [
    '',
    'مئة',
    'مئتان',
    'ثلاثمائة',
    'أربعمائة',
    'خمسمائة',
    'ستمائة',
    'سبعمائة',
    'ثمانمائة',
    'تسعمائة',
  ];

  convert(number: number): string {
    if (number === 0) return 'صفر';
    if (number > 999999999) return 'الرقم كبير جدًا';

    const parts = [];

    const millions = Math.floor(number / 1000000);
    const thousands = Math.floor((number % 1000000) / 1000);
    const rest = number % 1000;

    if (millions > 0) {
      parts.push(
        this.getArabicBelowThousand(millions) +
          ' مليون' +
          (millions > 2 ? 'ات' : millions === 2 ? 'ان' : '')
      );
    }

    if (thousands > 0) {
      parts.push(
        this.getArabicBelowThousand(thousands) +
          ' ألف' +
          (thousands > 2 ? '' : thousands === 2 ? 'ان' : '')
      );
    }

    if (rest > 0) {
      parts.push(this.getArabicBelowThousand(rest));
    }

    return parts.join(' و ');
  }

  private getArabicBelowThousand(n: number): string {
    let result = '';

    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h > 0) {
      result += this.hundreds[h];
    }

    if (n % 100 > 0) {
      if (result) result += ' و ';

      if (n % 100 < 10) {
        result += this.ones[o];
      } else if (n % 100 < 20) {
        result += this.teens[(n % 100) - 10];
      } else {
        if (o > 0) {
          result += this.ones[o] + ' و ';
        }
        result += this.tens[t];
      }
    }

    return result.trim();
  }
}
