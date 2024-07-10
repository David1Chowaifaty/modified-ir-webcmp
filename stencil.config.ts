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
        { src: 'assets', dest: 'assets' },
        { src: 'index.js', dest: 'index.js' },
      ],
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
};
