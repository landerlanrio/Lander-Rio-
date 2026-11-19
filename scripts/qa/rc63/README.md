# RC6.3 browser QA

Retained harness used for the local browser evidence. It must not be deployed.
Copy `index.html`, `quality.js`, `review.js` and `brands.js` and an official axe-core 4.10.3
`axe.min.js` into a temporary `site/__qa/` directory before starting the managed
preview. Visit `/__qa/` and use its controls to run width, interaction and
accessibility checks. Do not submit external forms or WhatsApp messages.

The frame uses desktop Chromium at controlled dimensions, not iOS emulation.
`Prepare capture` eagerly loads and decodes images and hides frame scrollbars
for screenshots. These capture-only adjustments do not ship with the site.
Collect the report JSON from the rendered report elements and take screenshots
through the supported browser interface. Remove `site/__qa/` before building
the manifest or exporting the candidate; both release scripts enforce this.

Results: `docs/evidence/digital-flagship-2026-rc6.3/`.

Use Testar marcas for all 14 link destinations and 80 layout combinations. A11y marcas audits the directory and every profile. The harness uses bounded timers so background tabs do not stall requestAnimationFrame. All code remains outside the deploy package.
