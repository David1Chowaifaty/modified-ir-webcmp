q: What is the main objective?  
a: Create an HTML demo page that imports the web components bundle, showcases **all components in the `ui/` library**, validates a form with **Zod**, and sends all requests through a centralized `apiPost()` helper that only uses POST with an Authorization header.

q: Which external scripts should I include?  
a:

1. Initialize moment js:
   `<script src="https://wb-cmp.igloorooms.com/backend/dist/collection/assets/scripts/daterangepicker/moment.min.js"></script>`
2. Initialize jquery js:
   `<script src="https://wb-cmp.igloorooms.com/backend/dist/collection/assets/scripts/jquery.min.js"></script>`
3. Initialize date range picker js:
   `<script src="https://wb-cmp.igloorooms.com/backend/dist/collection/assets/scripts/daterangepicker/daterangepicker.js"></script>`
4. Initialize bootstrap js:
   `<script src="https://wb-cmp.igloorooms.com/backend/dist/collection/assets/scripts/bootstrap.bundle.min.js"></script>`
5. Initialize toastr js:
   `<script src=https://wb-cmp.igloorooms.com/backend/dist/collection/assets/scripts/toastr/toastr.min.js"></script>`
6. The web component bundle:  
   `<script type="module" src="https://wb-cmp.igloorooms.com/backend/dist/ir-webcmp/ir-webcmp.esm.js"></script>`
7. Initialize bootstrap:
   `<link rel="stylesheet" href="https://wb-cmp.igloorooms.com/backend/dist/collection/assets/scripts/daterangepicker/daterangepicker.css">`
8. Add `ir-common` to inject the library’s global CSS/tokens  
    Place it as the **first child of `<body>`** so all shared styles are available to every component.
   **Example:**

   ```html
   <body>
     <!-- Inject IR shared styles & tokens -->
     <ir-common></ir-common>

     <!-- Your page content -->
     ...
   </body>
   q: How do I reference usage details for each component? a: For every component, **refer to its own documentation file in `/ui/<component
     >/`** (e.g. `/ui/ir-button/readme.md`). The HTML demo should always follow the documented props/slots/events.</component
   >
   ```

q: How should the page be structured?  
a:

- A header with `ir-tabs`.
- A sidebar navigation using `ir-sidebar`.
- Four main sections: **Form inputs**, **Pickers**, **Overlays**, **Miscellaneous**.
- Each section demonstrates the relevant components.

q: Which form components must be included and how?  
a:

- `ir-input-text` → see `/ui/ir-input-text/readme.md`
- `ir-textarea` → see `/ui/ir-textarea/readme.md`
- `ir-text-editor` → see `/ui/ir-text-editor/readme.md`
- `ir-select` → see `/ui/ir-select/readme.md`
- `ir-combobox` → see `/ui/ir-combobox/readme.md`
- `ir-country-picker` → see `/ui/ir-country-picker/readme.md`
- `ir-date-picker` → see `/ui/ir-date-picker/readme.md`
- `ir-date-range` → see `/ui/ir-date-range/readme.md`
- `ir-weekday-selector` → see `/ui/ir-weekday-selector/readme.md`
- `ir-phone-input` → see `/ui/ir-phone-input/readme.md`
- `ir-price-input` → see `/ui/ir-price-input/readme.md`
- `ir-checkbox` / `ir-checkboxes` → see `/ui/ir-checkbox/readme.md`
- `ir-radio` → see `/ui/ir-radio/readme.md`
- `ir-switch` → see `/ui/ir-switch/readme.md`

q: Which overlay components must be demonstrated?  
a:

- `ir-dialog` → see `/ui/ir-dialog/readme.md`
- `ir-modal` → see `/ui/ir-modal/readme.md`
- `ir-tooltip` → see `/ui/ir-tooltip/readme.md`

q: Which navigation and layout components must be demonstrated?  
a:

- `ir-sidebar` → see `/ui/ir-sidebar/readme.md`
- `ir-tabs` → see `/ui/ir-tabs/readme.md`
- `ir-dropdown` and `ir-dropdown-item` → see `/ui/ir-dropdown/readme.md` and `/ui/ir-dropdown-item/readme.md`

q: Which feedback and status components must be included?  
a:

- `ir-progress-indicator` → see `/ui/ir-progress-indicator/readme.md`
- `ir-spinner` → see `/ui/ir-spinner/readme.md`

q: Which utility and visual components should be shown?  
a:

- `ir-button` → see `/ui/ir-button/readme.md`
- `ir-icons` → see `/ui/ir-icons/readme.md`
- `ir-label` → see `/ui/ir-label/readme.md`
- `ir-span` → see `/ui/ir-span/readme.md`
- `ir-interactive-title` → see `/ui/ir-interactive-title/readme.md`
- `ota-label` → see `/ui/ota-label/readme.md`

q: How should centralized fetch be implemented?  
a: Define a single helper function:

```js
const BASE_URL = 'https://gateway.igloorooms.com/IR';

async function apiPost(path, body) {
  const token = localStorage.getItem('authToken') || document.body.dataset.token || '';
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.ExceptionMsg || data.ExceptionCode) {
    throw new Error(`API error: ${res.status}`);
  }
  return data;
}
```
