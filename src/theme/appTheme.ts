import { extendTheme } from 'native-base';

export const appTheme = extendTheme({
  colors: {
    brand: {
      50: '#F4EFE7',
      100: '#EAE0D2',
      200: '#D7C7B1',
      500: '#85715B',
      600: '#6E5A46',
      700: '#4E4033',
    },
    ink: '#292821',
    paper: '#FBF9F5',
    moss: '#546B55',
  },
  config: {
    initialColorMode: 'light',
  },
  fontConfig: {
    System: {
      400: { normal: 'System' },
      500: { normal: 'System' },
      600: { normal: 'System' },
      700: { normal: 'System' },
    },
  },
  fonts: {
    heading: 'System',
    body: 'System',
    mono: 'System',
  },
});
