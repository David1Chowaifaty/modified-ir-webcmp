import moment from 'moment/min/moment-with-locales';
import 'moment/locale/ar';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/pl';
import 'moment/locale/uk';
import 'moment/locale/ru';
import 'moment/locale/el';

const localeMap: { [key: string]: string } = {
  en: 'en',
  ar: 'ar',
  fr: 'fr',
  es: 'es',
  de: 'de',
  pl: 'pl',
  ua: 'uk',
  ru: 'ru',
  el: 'el',
};
export function matchLocale(locale: string): string {
  return localeMap[locale.toLowerCase()] || 'en';
}
export function getAbbreviatedWeekdays(locale: string) {
  let weekdays = [];
  for (let i = 0; i < 7; i++) {
    const weekday = moment().locale(locale).day(i).format('ddd');
    weekdays.push(weekday);
  }
  return weekdays;
}
