import { screenSafety, validateProfile } from './safety.js';

const clamp = (v,min,max) => Math.max(min, Math.min(max,v));

export function calculateBMR(p) {
  const w=+p.weight, h=+p.height, a=+p.age;
  const bf = p.bodyFat === '' || p.bodyFat == null ? null : +p.bodyFat;
  const mifflin = 10*w + 6.25*h - 5*a + (p.sex==='male' ? 5 : -161);
  if (bf != null && bf >=4 && bf <=60) {
    const lbm = w * (1 - bf/100);
    if (+p.trainingsPerWeek >= 3) return { bmr: 500 + 22*lbm, method:'Cunningham (massa magra)' };
    return { bmr: 370 + 21.6*lbm, method:'Katch-McArdle (massa magra)' };
  }
  return { bmr:mifflin, method:'Mifflin-St Jeor' };
}

function lifestyleFactor(p) {
  const steps = p.steps || '4-7k';
  const stepBase = {'<4k':1.18,'4-7k':1.25,'7-10k':1.32,'10k+':1.39}[steps] || 1.25;
  const jobAdd = {seated:0, standing:0.04, moving:0.09}[p.job] || 0;
  return clamp(stepBase + jobAdd, 1.15, 1.52);
}

function exerciseCaloriesPerDay(p) {
  const sessions = clamp(+p.trainingsPerWeek||0,0,7);
  const duration = clamp(+p.trainingDuration||0,0,180);
  if (!sessions || !duration) return 0;
  const baseMet = {weights:5.0,running:8.0,hybrid:7.5,sport:6.5,other:5.5}[p.modality] || 5;
  const intensity = {light:0.8,moderate:1,high:1.2}[p.intensity] || 1;
  const met = baseMet*intensity;
  const kcalSession = met * 3.5 * (+p.weight) / 200 * duration;
  return kcalSession * sessions / 7;
}

export function calculateTargets(p) {
  const errors = validateProfile(p);
  if (errors.length) return { errors };
  const safety = screenSafety(p);
  if (safety.blocked) return { errors:[], safety, blocked:true };

  const {bmr,method} = calculateBMR(p);
  const tdee = bmr*lifestyleFactor(p) + exerciseCaloriesPerDay(p);
  const w=+p.weight;
  let calories=tdee, rate=0;
  if (p.goal==='loss') {
    rate = 0.005;
    const rawDeficit = w*rate*7700/7;
    const deficit = Math.min(rawDeficit, tdee*0.20, 550);
    calories = tdee-deficit;
  } else if (p.goal==='gain') {
    rate = 0.0025;
    const rawSurplus = w*rate*7700/7;
    const surplus = Math.min(rawSurplus, tdee*0.10, 320);
    calories=tdee+surplus;
  } else if (p.goal==='recomp') {
    calories=tdee*0.98;
  }

  const minReasonable = Math.max(1200, bmr*0.90);
  if (calories < minReasonable) {
    return { errors:[], blocked:true, safety:{blocked:true,reasons:['meta calórica calculada abaixo do limite conservador do MVP'],bmi:safety.bmi} };
  }

  const hM = +p.height/100;
  const bmi = w/(hM*hM);
  const refWeight = bmi>=30 ? Math.min(w, 25*hM*hM) : w;
  const proteinRate = p.goal==='loss' ? 2.0 : p.goal==='gain' ? 1.8 : p.goal==='recomp' ? 2.0 : 1.6;
  let protein = refWeight*proteinRate;
  protein = clamp(protein, 1.4*refWeight, 2.2*refWeight);
  let fat = Math.max(0.7*refWeight, calories*0.22/9);
  fat = Math.min(fat, calories*0.32/9);
  let carbs = (calories - protein*4 - fat*9)/4;
  if (carbs < 80) {
    const needed = (80-carbs)*4;
    fat = Math.max(0.6*refWeight, fat-needed/9);
    carbs = (calories - protein*4 - fat*9)/4;
  }
  const fiber = clamp(calories/1000*14, 25, 45);
  return {
    errors:[], blocked:false, safety, method,
    bmr:Math.round(bmr), tdee:Math.round(tdee), calories:Math.round(calories),
    protein:Math.round(protein), carbs:Math.round(carbs), fat:Math.round(fat), fiber:Math.round(fiber),
    targetRate: rate,
    bmi:+bmi.toFixed(1),
    note:'Estimativa inicial. A precisão melhora com check-ins e tendência real de peso.'
  };
}

export function adaptCalories({currentCalories, goal, checkins}) {
  const valid = (checkins||[])
    .filter(c => Number.isFinite(+c.weight) && Number.isFinite(+c.adherence) && c.date)
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  if (valid.length < 3) return { change:0, next:currentCalories, reason:'Ainda há poucos dados. Registre pelo menos três médias semanais antes de recalibrar calorias.' };
  const last = valid.slice(-3);
  const spanDays=(new Date(last[last.length-1].date)-new Date(last[0].date))/86400000;
  if (!Number.isFinite(spanDays) || spanDays < 10) return { change:0, next:currentCalories, reason:'Os check-ins estão muito próximos. Mantenha o plano e complete pelo menos duas semanas de tendência antes de ajustar.' };
  const mean=k=>last.reduce((s,c)=>s+(Number.isFinite(+c[k])?+c[k]:0),0)/last.length;
  const adherence = mean('adherence');
  if (adherence < 75) return {change:0,next:currentCalories,reason:'A aderência média está abaixo de 75%. Antes de mexer nas calorias, vale estabilizar a execução do plano.'};

  const firstW=+last[0].weight, lastW=+last[last.length-1].weight;
  const trendPct=(lastW-firstW)/firstW;
  const hunger=mean('hunger'), performance=mean('performance');
  const firstSteps=+last[0].steps||0, lastSteps=+last[last.length-1].steps||0;
  const firstTrain=+last[0].trainings||0, lastTrain=+last[last.length-1].trainings||0;
  if ((firstSteps>0 && lastSteps<firstSteps*.80) || (firstTrain>0 && lastTrain<=Math.max(0,firstTrain-2))) {
    return {change:0,next:currentCalories,reason:'Seu nível de atividade caiu de forma relevante. Antes de recalibrar a dieta, estabilize passos e treinos para não confundir queda de gasto com necessidade de cortar calorias.'};
  }
  if (goal==='loss' && ((Number.isFinite(hunger)&&hunger>=4.3) || (Number.isFinite(performance)&&performance<=2))) {
    return {change:0,next:currentCalories,reason:'Fome muito alta ou performance baixa pedem cautela. Não faremos novo corte automático; mantenha ou revise o plano com um profissional.'};
  }

  let change=0, reason='Tendência dentro do esperado. Sem ajuste por enquanto.';
  if (goal==='loss' && trendPct > -0.002) { change=-Math.min(150, currentCalories*0.06); reason='A tendência de peso está praticamente estável com boa aderência; ajuste pequeno para recuperar o ritmo.'; }
  if (goal==='loss' && trendPct < -0.02) { change=100; reason='A queda está rápida para o período observado; ajuste pequeno para reduzir agressividade.'; }
  if (goal==='gain' && trendPct < 0.001) { change=Math.min(150,currentCalories*0.06); reason='O ganho está abaixo do esperado com boa aderência; ajuste pequeno no superávit.'; }
  if (goal==='gain' && trendPct > 0.02) { change=-100; reason='O ganho está rápido; ajuste pequeno para reduzir excesso de energia.'; }
  const bounded=Math.round(Math.max(-200,Math.min(200,change))/10)*10;
  return {change:bounded,next:Math.round(currentCalories+bounded),reason};
}
