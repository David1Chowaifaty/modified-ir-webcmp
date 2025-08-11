import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/themes/light.css';

// Import all components; for smaller bundles, switch to per-component imports
import '@shoelace-style/shoelace/dist/shoelace.js';

// Set the base path to the copied Shoelace assets
setBasePath('/assets/shoelace/');

import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library.js';

registerIconLibrary('my-icons', {
  resolver: name => `/assets/icons/${name}.svg`,
  mutator: svg => svg.setAttribute('fill', 'currentColor'),
});
