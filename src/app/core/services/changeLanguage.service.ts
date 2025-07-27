import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangeLanguageService {

  otherLang: string = '';
  local_lenguage = 'ar';
  current_lang: BehaviorSubject<string> = new BehaviorSubject<string>('ar');
  changeLangObs: Observable<string> = this.current_lang.asObservable();

  constructor(public translate: TranslateService) {
    this.local_lenguage = localStorage.getItem('currentLang') || 'ar';
    this.changeLang(localStorage.getItem('currentLang') || 'ar');
}


changeLang(lang:string) {
  this.current_lang.next(lang);
  this.local_lenguage = lang;
}

/* --------------------------------------------------------------- */
getBrowserLanguage(): string {
  return navigator.language;
}

checkLangage() {
  let current = localStorage.getItem('currentLang');
  if (current) this.changeLangage(current);
  else {
    this.getBrowserLanguage() == 'ar' ? localStorage.setItem('currentLang', 'ar') : localStorage.setItem('currentLang', 'en');
    if (current) this.changeLangage(current);
    else{
      this.changeLangage('ar');
    }
  }
}

changeLangage(currentLang: string) {
  if(currentLang)
  { this.translate.use(currentLang.toLowerCase()) ;}
  else{
    this.translate.use('ar')
  }
  localStorage.setItem('currentLang', currentLang);
  this.changeLang(currentLang);
  this.otherLang = currentLang === 'ar' ? 'en' : 'ar';
  
  let htmlTag = document.getElementsByTagName(
    'html'
  )[0] as HTMLHtmlElement;
  htmlTag.dir = currentLang === 'ar' ? 'rtl' : 'ltr';



  let dom: any = document.querySelector('body');

  if (currentLang == 'ar') {
    dom.classList.remove('ltr');
    dom.classList.add('rtl');

  } else {
    dom.classList.add('ltr');
    dom.classList.remove('rtl');
  }

   this.changeCssFile(currentLang);
}


changeCssFile(currentLang: string) {
  let headTag = document.getElementsByTagName(
    'head'
  )[0] as HTMLHeadElement;
  let existingLink = document.getElementById(
    'langCss'
  ) as HTMLLinkElement;
  let bundleName = currentLang === 'ar' ? 'arabicStyle.css' : 'englishStyle.css';
  if (existingLink) existingLink.href = bundleName;
  else {
    let newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.type = 'text/css';
    newLink.id = 'langCss';
    newLink.href = bundleName;
    headTag.appendChild(newLink);

    let mainStyleScss = document.createElement('link');
    mainStyleScss.rel = 'stylesheet';
    mainStyleScss.type = 'text/scss';
    mainStyleScss.id = 'langScss';
    mainStyleScss.href = 'styles.scss';
    headTag.appendChild(mainStyleScss);

  
  }
}
reloadLang() {
  localStorage.getItem('currentLang') == 'ar'
    ? localStorage.setItem('currentLang', 'en')
    : localStorage.setItem('currentLang', 'ar');
  window.location.reload();
}



}
