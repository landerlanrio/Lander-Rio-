import {createProductionCaptureHandler} from './production-edge.mjs';
// Candidate only: deploy after hosted QA passes. No CRM or outbound integration.
Deno.serve(createProductionCaptureHandler({env:Deno.env}));
