import {createStagingCaptureHandler} from './staging-edge.mjs';
// Deployment payload includes the three reused .mjs modules next to this entrypoint.
Deno.serve(createStagingCaptureHandler({env:Deno.env}));
