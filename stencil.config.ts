import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'ir-webcmp',
  globalStyle: 'src/common/global/app.css',
  globalScript: 'src/common/global/app.ts',
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
        { src: 'assets' },
        { src: 'scripts' },
        {
          src: '../node_modules/@shoelace-style/shoelace/dist/assets',
          dest: 'assets/shoelace',
        },
        {
          src: '../node_modules/@shoelace-style/shoelace/dist/themes',
          dest: 'assets/shoelace/themes',
        },
      ],
    },
  ],
  testing: {
    // browserHeadless: 'new',
  },
};
