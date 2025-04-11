import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'ir-webcmp',
  globalStyle: 'src/common/global.css',
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
      copy: [{ src: 'assets' }, { src: 'scripts' }],
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
};
