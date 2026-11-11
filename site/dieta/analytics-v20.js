export function track(){ /* Tool activity and health responses stay local. Registration lives in the access backend. */ }
export function getUtm(){return window.LanderAccess?.getAttribution()||{};}
