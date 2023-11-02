import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'ir-webcmp',
  globalStyle: 'src/common/colors.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [{ src: 'assets', dest: 'assets' }],
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        { src: 'assets/fontawesome/webfonts', dest: 'webfonts' },
        { src: 'assets/feather/fonts', dest: 'fonts' },
        { src: 'assets/line-awesome/fonts', dest: 'fonts' },
      ],
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
};
