import { MaskedRange, MaskedNumber } from 'imask';
import moment from 'moment';

export const masks = {
  price: {
    mask: MaskedNumber,
    scale: 2,
    radix: '.',
    mapToRadix: [','],
    normalizeZeros: true,
    padFractionalZeros: true,
    thousandsSeparator: ',',
  },
  time: {
    mask: 'HH:mm',
    blocks: {
      HH: {
        mask: MaskedRange,
        from: 0,
        to: 23,
        placeholderChar: 'H',
      },
      mm: {
        mask: MaskedRange,
        from: 0,
        to: 59,
        placeholderChar: 'm',
      },
    },
    lazy: false,
    placeholderChar: '_',
  },
  date: {
    mask: Date,
    pattern: 'DD/MM/YYYY',
    lazy: false,
    min: moment('1900-01-01', 'YYYY-MM-DD').toDate(),
    max: new Date(),
    format: date => moment(date).format('DD/MM/YYYY'),
    parse: str => moment(str, 'DD/MM/YYYY').toDate(),
    autofix: true,
    placeholderChar: '_',
    blocks: {
      YYYY: {
        mask: MaskedRange,
        from: 1900,
        to: moment().format('YYYY'),
        placeholderChar: 'Y',
      },
      MM: {
        mask: MaskedRange,
        from: 1,
        to: 12,
        placeholderChar: 'M',
      },
      DD: {
        mask: MaskedRange,
        from: 1,
        to: 31,
        placeholderChar: 'D',
      },
    },
  },
} as const;
