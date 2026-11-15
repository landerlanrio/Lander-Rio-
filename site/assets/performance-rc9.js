/* Google web-vitals 5.3.0; consent-bound aggregate measurements only. */
(()=>{'use strict';let started=false;
 function start(){const api=window.LanderMeasurement;if(started||!api?.isEnabled?.()||!window.webVitals)return;started=true;
  const report=metric=>api.push('web_vital',{metric:metric.name,value:metric.value,rating:metric.rating});
  window.webVitals.onLCP(report);window.webVitals.onCLS(report);window.webVitals.onINP(report);
 }
 window.addEventListener('lander:consent',start);start();
})();
