import { FOOD_MAP, nutrients, excludedFoodIds } from './foods.js';

const round5 = n => Math.max(5, Math.round(n/5)*5);
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

export const TEMPLATES = {
  breakfast:[
    {name:'Pão + proteína + fruta', omnivore:['pao','ovo','banana'], vegetarian:['pao','ovo','banana'], vegan:['pao','tofu','banana']},
    {name:'Aveia + proteína + banana', omnivore:['aveia','iogurte','banana'], vegetarian:['aveia','iogurte','banana'], vegan:['aveia','proteina_vegetal','banana']},
    {name:'Cuscuz + proteína + mamão', omnivore:['cuscuz','ovo','mamao'], vegetarian:['cuscuz','ovo','mamao'], vegan:['cuscuz','tofu','mamao']},
    {name:'Aveia + leite + banana', omnivore:['aveia','leite','banana'], vegetarian:['aveia','leite','banana']},
    {name:'Pão + tofu + fruta', vegetarian:['pao','tofu','banana'], vegan:['pao','tofu','banana']},
    {name:'Tapioca + proteína + fruta', omnivore:['tapioca','frango','banana'], vegetarian:['tapioca','proteina_vegetal','banana'], vegan:['tapioca','proteina_vegetal','banana']},
    {name:'Cuscuz + proteína + fruta', omnivore:['cuscuz','frango','mamao'], vegetarian:['cuscuz','proteina_vegetal','mamao'], vegan:['cuscuz','proteina_vegetal','mamao']}
  ],
  snack:[
    {name:'Iogurte / opção vegetal + carbo + fruta', omnivore:['iogurte','aveia','banana'], vegetarian:['iogurte','aveia','banana'], vegan:['pao','tofu','maca']},
    {name:'Pão + queijo + fruta', omnivore:['pao','queijo','maca'], vegetarian:['pao','queijo','maca']},
    {name:'Shake simples', omnivore:['whey','banana','aveia'], vegetarian:['whey','banana','aveia'], vegan:['proteina_vegetal','banana','aveia']},
    {name:'Aveia + banana + pasta de amendoim', omnivore:['aveia','banana','pasta_amendoim'], vegetarian:['aveia','banana','pasta_amendoim'], vegan:['aveia','banana','pasta_amendoim']},
    {name:'Pão + frango/ovo + fruta', omnivore:['pao','frango','maca'], vegetarian:['pao','ovo','maca']},
    {name:'Tapioca + proteína + fruta', omnivore:['tapioca','frango','maca'], vegetarian:['tapioca','proteina_vegetal','maca'], vegan:['tapioca','proteina_vegetal','maca']}
  ],
  pre:[
    {name:'Banana + aveia + proteína', omnivore:['banana','aveia','whey'], vegetarian:['banana','aveia','whey'], vegan:['banana','aveia','proteina_vegetal']},
    {name:'Banana + aveia + proteína vegetal', vegetarian:['banana','aveia','proteina_vegetal'], vegan:['banana','aveia','proteina_vegetal']},
    {name:'Pão + proteína leve', omnivore:['pao','frango','banana'], vegetarian:['pao','whey','banana'], vegan:['pao','proteina_vegetal','banana']},
    {name:'Tapioca + proteína + fruta', omnivore:['tapioca','frango','banana'], vegetarian:['tapioca','whey','banana'], vegan:['tapioca','proteina_vegetal','banana']},
    {name:'Tapioca + proteína vegetal + fruta', vegetarian:['tapioca','proteina_vegetal','banana'], vegan:['tapioca','proteina_vegetal','banana']}
  ],
  post:[
    {name:'Arroz + proteína + vegetal', omnivore:['arroz','frango','brocolis'], vegetarian:['arroz','tofu','brocolis'], vegan:['arroz','pts','brocolis']},
    {name:'Batata + proteína + vegetal', omnivore:['batata','tilapia','cenoura'], vegetarian:['batata','tofu','cenoura'], vegan:['batata','pts','cenoura']},
    {name:'Arroz + lentilha + vegetal', vegetarian:['arroz','lentilha','brocolis'], vegan:['arroz','lentilha','brocolis']},
    {name:'Tapioca + proteína + fruta', omnivore:['tapioca','whey','banana'], vegetarian:['tapioca','whey','banana'], vegan:['tapioca','proteina_vegetal','banana']}
  ],
  lunch:[
    {name:'Arroz, feijão, proteína e vegetais', omnivore:['arroz','feijao','frango','cenoura'], vegetarian:['arroz','feijao','ovo','cenoura'], vegan:['arroz','pts','cenoura']},
    {name:'Batata + proteína + legumes', omnivore:['batata','patinho','cenoura','azeite'], vegetarian:['batata','pts','cenoura','azeite'], vegan:['batata','pts','cenoura','azeite']},
    {name:'Arroz + lentilha + vegetais', vegan:['arroz','lentilha','cenoura','azeite']},
    {name:'Batata + grão-de-bico + vegetais', vegan:['batata','grao_bico','cenoura','azeite']},
    {name:'Massa + proteína + tomate', omnivore:['macarrao','patinho','tomate'], vegetarian:['macarrao','pts','tomate'], vegan:['macarrao','pts','tomate']},
    {name:'Arroz + lentilha + vegetais', vegetarian:['arroz','lentilha','cenoura','azeite']},
    {name:'Batata + grão-de-bico + vegetais', vegetarian:['batata','grao_bico','cenoura','azeite']}
  ],
  dinner:[
    {name:'Arroz, feijão, proteína e vegetais', omnivore:['arroz','feijao','frango','tomate'], vegetarian:['arroz','feijao','ovo','tomate'], vegan:['arroz','pts','tomate']},
    {name:'Mandioca + proteína + vegetais', omnivore:['mandioca','tilapia','brocolis'], vegetarian:['mandioca','tofu','brocolis'], vegan:['mandioca','pts','brocolis']},
    {name:'Arroz + grão-de-bico + vegetais', vegan:['arroz','grao_bico','tomate']},
    {name:'Mandioca + lentilha + vegetais', vegan:['mandioca','lentilha','brocolis']},
    {name:'Cuscuz + proteína + vegetais', omnivore:['cuscuz','frango','cenoura'], vegetarian:['cuscuz','pts','cenoura'], vegan:['cuscuz','pts','cenoura']},
    {name:'Arroz + lentilha + vegetais', vegetarian:['arroz','lentilha','tomate']},
    {name:'Mandioca + grão-de-bico + vegetais', vegetarian:['mandioca','grao_bico','brocolis']}
  ],
  ceia:[
    {name:'Iogurte + aveia + fruta', omnivore:['iogurte','aveia','maca'], vegetarian:['iogurte','aveia','maca'], vegan:['proteina_vegetal','aveia','maca']},
    {name:'Leite + aveia', omnivore:['leite','aveia'], vegetarian:['leite','aveia']},
    {name:'Ceia vegetal simples', vegan:['pao','tofu'], vegetarian:['pao','tofu']},
    {name:'Ovos + fruta', omnivore:['ovo','maca'], vegetarian:['ovo','maca']},
    {name:'Proteína vegetal + fruta', omnivore:['proteina_vegetal','banana'], vegetarian:['proteina_vegetal','banana'], vegan:['proteina_vegetal','banana']}
  ]
};

function dietKey(dietType){ return dietType==='vegan'?'vegan':dietType==='vegetarian'?'vegetarian':'omnivore'; }

function pickTemplate(slot, p, idx=0, usedSignatures=[]) {
  const dk=dietKey(p.dietType);
  const excluded=excludedFoodIds(p);
  const compatible=(TEMPLATES[slot]||[]).filter(t=>Array.isArray(t[dk]) && t[dk].every(id=>!excluded.has(id)));
  if (!compatible.length) throw new Error(`Sem combinação compatível para ${slot}. Revise alergias/restrições ou número de refeições.`);
  let candidates=compatible;
  if (p.budget==='economy') {
    const economical=compatible.filter(t=>t[dk].every(id=>FOOD_MAP[id].budget<=1));
    if (economical.length) candidates=economical;
  }
  if (dk==='vegan' && p.budget!=='economy' && ['breakfast','snack','pre','ceia'].includes(slot)) {
    const highProtein=candidates.find(t=>t[dk]?.includes('proteina_vegetal'));
    if(highProtein && !usedSignatures.includes([...highProtein[dk]].sort().join('|'))) return highProtein;
  }
  if (dk==='vegetarian' && p.budget!=='economy' && (+p.mealsPerDay||4)>=5 && slot==='snack') {
    const leanSnack=candidates.find(t=>t[dk]?.includes('whey'));
    if(leanSnack && !usedSignatures.includes([...leanSnack[dk]].sort().join('|'))) return leanSnack;
  }
  if (slot==='post' && p.goal==='gain') {
    const rice=candidates.find(t=>t[dk]?.includes('arroz'));
    if (rice && !usedSignatures.includes([...rice[dk]].sort().join('|'))) return rice;
  }
  // Com poucas refeições, prioriza bases mais densas nas refeições principais
  // para evitar porções volumosas demais de batata/cuscuz só para fechar calorias.
  if ((+p.mealsPerDay||4)<=3 && ['lunch','dinner'].includes(slot)) {
    const dense=candidates.find(t=>t[dk]?.includes('arroz')) || candidates.find(t=>t[dk]?.includes('macarrao'));
    if (dense && !usedSignatures.includes([...dense[dk]].sort().join('|'))) return dense;
  }
  for (let offset=0; offset<candidates.length; offset++) {
    const candidate=candidates[(idx+offset)%candidates.length];
    const sig=[...candidate[dk]].sort().join('|');
    if (!usedSignatures.includes(sig)) return candidate;
  }
  return candidates[idx%candidates.length];
}

function mealSlots(p) {
  const n=+p.mealsPerDay||4;
  const trains=(+p.trainingsPerWeek||0)>0;
  const when=p.trainingTime||'evening';
  if (!trains) {
    return ({3:['breakfast','lunch','dinner'],4:['breakfast','lunch','snack','dinner'],5:['breakfast','snack','lunch','snack','dinner'],6:['breakfast','snack','lunch','snack','dinner','ceia']})[n] || ['breakfast','lunch','snack','dinner'];
  }
  if (when==='morning') return ({3:['pre','lunch','dinner'],4:['pre','post','lunch','dinner'],5:['pre','post','lunch','snack','dinner'],6:['pre','post','lunch','snack','dinner','ceia']})[n] || ['pre','post','lunch','dinner'];
  if (when==='afternoon') return ({3:['breakfast','lunch','dinner'],4:['breakfast','lunch','pre','dinner'],5:['breakfast','lunch','pre','post','dinner'],6:['breakfast','snack','lunch','pre','post','dinner']})[n] || ['breakfast','lunch','pre','dinner'];
  return ({3:['breakfast','lunch','dinner'],4:['breakfast','lunch','pre','dinner'],5:['breakfast','lunch','snack','pre','dinner'],6:['breakfast','lunch','snack','pre','dinner','ceia']})[n] || ['breakfast','lunch','pre','dinner'];
}

function slotWeights(slots,p) {
  let base=slots.map(s=>({breakfast:.22,snack:.12,lunch:.28,pre:.14,post:.18,dinner:.28,ceia:.10}[s]||.2));
  if (p.trainingTime==='morning') base=base.map((v,i)=>['breakfast','post'].includes(slots[i])?v*1.18:v);
  if (p.trainingTime==='evening') base=base.map((v,i)=>['pre','dinner'].includes(slots[i])?v*1.12:v);
  const sum=base.reduce((a,b)=>a+b,0); return base.map(x=>x/sum);
}

function initialGrams(id, slot, targetProtein) {
  const f=FOOD_MAP[id];
  if (f.role==='veg') return 100;
  if (f.role==='fruit') return 100;
  if (f.role==='fat') return slot==='lunch'||slot==='dinner' ? 5 : 10;
  if (f.role==='legume') return 100;
  if (f.role==='dairy') return 170;
  if (f.role==='protein') {
    if (id==='ovo') return clamp(targetProtein/(f.p/100), 70, 180);
    if (id==='whey') return clamp(targetProtein/(f.p/100), 20, 35);
    if (id==='pts') return clamp(targetProtein/(f.p/100), 30, 80);
    return clamp(targetProtein/(f.p/100), 70, 180);
  }
  if (f.role==='carb') return slot==='breakfast'||slot==='snack'||slot==='pre'||slot==='ceia' ? 50 : 130;
  return 100;
}

function totals(items){ return items.reduce((a,it)=>{ const n=nutrients(it.id,it.grams); a.kcal+=n.kcal;a.p+=n.p;a.c+=n.c;a.f+=n.f;a.fiber+=n.fiber; return a;},{kcal:0,p:0,c:0,f:0,fiber:0}); }

function fitMeal(ids, slot, kcalTarget, proteinTarget) {
  const items=ids.map(id=>({id,grams:initialGrams(id,slot,proteinTarget)}));
  // Proteína: distribui a meta entre fontes proteicas para não exagerar porções.
  const protItems=items.filter(x=>['protein','dairy'].includes(FOOD_MAP[x.id].role));
  if (protItems.length) {
    const per=proteinTarget/protItems.length;
    protItems.forEach(it=>{const f=FOOD_MAP[it.id]; it.grams=clamp(per/(f.p/100||.01), idMin(f.id,slot), idMax(f.id,slot));});
  }
  // Vegetais/frutas ficam em porções humanas; carbo é alavanca principal para fechar energia.
  let t=totals(items);
  const carbs=items.filter(x=>FOOD_MAP[x.id].role==='carb');
  if (carbs.length) {
    const delta=kcalTarget-t.kcal;
    const each=delta/carbs.length;
    carbs.forEach(it=>{const f=FOOD_MAP[it.id]; it.grams=clamp(it.grams + each/(f.kcal/100), carbMin(f.id,slot), carbMax(f.id,slot));});
  }
  t=totals(items);
  // Se a combinação ultrapassou a meta, reduza primeiro fontes proteicas/gordurosas
  // até porções humanas mínimas. Isso evita lanches com 100+ g de queijo ou ovos
  // só para perseguir uma meta proteica matemática.
  if (t.kcal > kcalTarget*1.08) {
    const reducible=items
      .filter(it=>['protein','dairy'].includes(FOOD_MAP[it.id].role))
      .sort((a,b)=>(FOOD_MAP[b.id].f||0)-(FOOD_MAP[a.id].f||0));
    for (const it of reducible) {
      t=totals(items); if(t.kcal<=kcalTarget*1.04) break;
      const f=FOOD_MAP[it.id], min=idMin(f.id,slot), room=it.grams-min;
      if(room<=0) continue;
      const need=(t.kcal-kcalTarget)/(f.kcal/100);
      it.grams=Math.max(min,it.grams-Math.min(room,need));
    }
  }
  t=totals(items);
  // Ajuste fino sem usar gordura isolada como "corretor" de calorias.
  if (Math.abs(kcalTarget-t.kcal)>kcalTarget*.08 && carbs.length) {
    const it=carbs[0], f=FOOD_MAP[it.id];
    it.grams=clamp(it.grams+(kcalTarget-t.kcal)/(f.kcal/100),carbMin(f.id,slot),carbMax(f.id,slot));
  }
  items.forEach(it=>it.grams=round5(it.grams));
  return items;
}
function idMin(id,slot){
  if(id==='whey'||id==='proteina_vegetal') return 15;
  if(id==='pts') return 25;
  if(id==='ovo') return 40;
  if(id==='clara_ovo') return 50;
  if(id==='queijo') return 25;
  if(id==='iogurte') return 100;
  if(id==='tofu') return 50;
  return ['snack','pre','ceia'].includes(slot)?35:50;
}
function idMax(id,slot){
  if(id==='whey') return 35;
  if(id==='proteina_vegetal') return 40;
  if(id==='pts') return 100;
  if(id==='ovo') return ['lunch','dinner','post'].includes(slot)?180:slot==='breakfast'?120:100;
  if(id==='clara_ovo') return 200;
  if(id==='queijo') return slot==='pre'?45:70;
  if(id==='iogurte') return 250;
  if(id==='tofu') return slot==='pre'||slot==='snack'?100:220;
  return ['snack','pre','ceia'].includes(slot)?160:220;
}
function carbMin(id,slot){ if(id==='aveia') return 15; if(id==='pao') return 25; if(id==='tapioca') return 30; return slot==='lunch'||slot==='dinner'||slot==='post'?50:30; }
function carbMax(id,slot){ if(id==='aveia') return 90; if(id==='pao'||id==='tapioca') return 140; return slot==='lunch'||slot==='dinner'||slot==='post'?350:180; }
function finalCarbMax(id,slot,profile){
  const base=carbMax(id,slot), n=(+profile.mealsPerDay||4);
  if(n<=3){
    if(['lunch','dinner','post'].includes(slot)) return Math.max(base,550);
    if(['breakfast','pre'].includes(slot)){
      if(id==='pao'||id==='tapioca') return Math.max(base,260);
      if(id==='aveia') return Math.max(base,140);
      if(id==='cuscuz') return Math.max(base,350);
    }
  }
  if(n===4){
    if(['lunch','dinner','post'].includes(slot)) return Math.max(base,450);
    if(['breakfast','pre'].includes(slot)){
      if(id==='pao'||id==='tapioca') return Math.max(base,200);
      if(id==='aveia') return Math.max(base,120);
      if(id==='cuscuz') return Math.max(base,250);
    }
  }
  // Em planos de 5–6 refeições e alto gasto, permita uma extensão moderada.
  // O objetivo é fechar a energia usando alimentos já coerentes com a refeição,
  // em vez de inserir gordura isolada ou combinações estranhas.
  if(n>=5){
    if(['lunch','dinner','post'].includes(slot)) return Math.max(base,400);
    if(['breakfast','snack','pre','ceia'].includes(slot)){
      if(id==='pao'||id==='tapioca') return Math.max(base,160);
      if(id==='aveia') return Math.max(base,105);
    }
  }
  return base;
}

export function validateMealSemantics(meal) {
  const ids=meal.items.map(x=>x.id), roles=meal.items.map(x=>FOOD_MAP[x.id].role);
  const issues=[];
  if (ids.includes('azeite') && meal.slot==='breakfast') issues.push('azeite no café da manhã');
  if (ids.includes('azeite') && meal.items.length===1) issues.push('azeite isolado');
  if (meal.slot==='breakfast' && ids.some(id=>['arroz','feijao','brocolis','alface','tomate','mandioca','macarrao'].includes(id))) issues.push('item típico de almoço no café da manhã');
  if (meal.slot==='pre') {
    const t=totals(meal.items); if (t.f*9/t.kcal>.32) issues.push('pré-treino excessivamente gorduroso');
  }
  if (['lunch','dinner'].includes(meal.slot) && !roles.includes('protein')) issues.push('refeição principal sem proteína');
  if (roles.filter(r=>r==='fat').length>1) issues.push('múltiplas gorduras concentradas');
  return issues;
}

export function generatePlan(profile, targets) {
  const slots=mealSlots(profile), weights=slotWeights(slots,profile);
  const usedSignatures=[];
  const meals=slots.map((slot,i)=>{
    let template=pickTemplate(slot,profile,i,usedSignatures);
    let ids=template[dietKey(profile.dietType)];
    const kcalTarget=targets.calories*weights[i];
    // Proteína "principal" abaixo da fração bruta para contabilizar proteína incidental
    // de aveia, pão, arroz, feijão etc. sem inflar o total do dia.
    const proteinFloor=['snack','ceia'].includes(slot)?10:slot==='pre'?12:15;
    const proteinTarget=Math.min(50, Math.max(proteinFloor, targets.protein*weights[i]*0.82));
    const items=fitMeal(ids,slot,kcalTarget,proteinTarget);
    usedSignatures.push([...ids].sort().join('|'));
    const meal={id:`m${i}`,slot,title:slotTitle(slot,i,slots,profile),template:template.name,items};
    const issues=validateMealSemantics(meal);
    if (issues.length) throw new Error(`Falha semântica: ${issues.join(', ')}`);
    meal.totals=totals(items); return meal;
  });
  // Reconciliação final de energia com prioridade para coerência culinária e macros.
  // Primeiro usa carboidratos nas faixas usuais. Se ainda faltar energia e gordura,
  // azeite só pode entrar como complemento de almoço/jantar com vegetais. Em planos
  // de 3–4 refeições, porções maiores de carboidratos são permitidas por necessidade.
  let day=planTotals(meals);
  const reconcileCarbs=(extended=false)=>{
    for(let pass=0;pass<8 && Math.abs(targets.calories-day.kcal)>targets.calories*.02;pass++){
      let delta=targets.calories-day.kcal;
      const carbItems=[];
      meals.forEach(m=>m.items.forEach(it=>{if(FOOD_MAP[it.id].role==='carb')carbItems.push({meal:m,it,f:FOOD_MAP[it.id]})}));
      carbItems.sort((a,b)=>a.it.grams-b.it.grams);
      for(const x of carbItems){
        if(Math.abs(delta)<=targets.calories*.015)break;
        const min=carbMin(x.f.id,x.meal.slot);
        const max=delta>0?(extended?finalCarbMax(x.f.id,x.meal.slot,profile):carbMax(x.f.id,x.meal.slot)):carbMax(x.f.id,x.meal.slot);
        const room=delta>0?max-x.it.grams:x.it.grams-min;
        if(room<=0)continue;
        const wanted=Math.abs(delta)/(x.f.kcal/100);
        const step=Math.min(room,Math.max(5,Math.min(50,wanted)));
        x.it.grams=round5(x.it.grams+(delta>0?step:-step));
        x.meal.totals=totals(x.meal.items);
        day=planTotals(meals);delta=targets.calories-day.kcal;
      }
    }
  };
  reconcileCarbs(false);

  // Reconcilia proteína do dia antes de completar energia. Prioriza fontes com boa
  // densidade proteica; depois devolve eventual excesso calórico reduzindo carboidrato.
  day=planTotals(meals);
  if(day.p<targets.protein*.92){
    let need=targets.protein*.96-day.p;
    const proteinItems=[];
    meals.forEach(m=>m.items.forEach(it=>{
      const f=FOOD_MAP[it.id];
      if(f.role==='protein')proteinItems.push({meal:m,it,f});
    }));
    const recMax=(id,slot)=>{
      if(id==='whey')return 40;if(id==='proteina_vegetal')return 50;if(id==='pts')return (+profile.mealsPerDay||4)<=3?90:60;
      if(id==='tofu')return 250;if(id==='ovo')return ['lunch','dinner'].includes(slot)?180:120;if(id==='clara_ovo')return 200;
      if(id==='queijo')return 80;return 220;
    };
    proteinItems.sort((a,b)=>(b.f.p/b.f.kcal)-(a.f.p/a.f.kcal));
    for(const x of proteinItems){
      if(need<=2)break;
      const room=recMax(x.f.id,x.meal.slot)-x.it.grams;if(room<=0)continue;
      const add=Math.min(room,need/(x.f.p/100||.01));
      x.it.grams=round5(x.it.grams+add);x.meal.totals=totals(x.meal.items);
      day=planTotals(meals);need=targets.protein*.96-day.p;
    }
    // Vegetarianos: se fontes existentes não bastarem, claras são uma opção culinária
    // simples e econômica em café/almoço/jantar. Veganos: proteína vegetal em pó entra
    // apenas como último recurso para evitar volumes irreais de PTS/tofu.
    const excluded=excludedFoodIds(profile);
    if(need>3 && profile.dietType==='vegetarian' && !excluded.has('clara_ovo')){
      for(const m of meals.filter(m=>['breakfast','lunch','dinner'].includes(m.slot))){
        if(need<=3)break;
        let it=m.items.find(x=>x.id==='clara_ovo');if(!it){it={id:'clara_ovo',grams:0};m.items.push(it);}
        const add=Math.min(150-it.grams,need/(FOOD_MAP.clara_ovo.p/100));
        if(add<=0)continue;it.grams=round5(it.grams+add);m.totals=totals(m.items);day=planTotals(meals);need=targets.protein*.96-day.p;
      }
    }
    if(need>3 && profile.dietType==='vegan' && !excluded.has('proteina_vegetal')){
      for(const m of meals.filter(m=>['breakfast','snack','pre','ceia'].includes(m.slot))){
        if(need<=3)break;
        let it=m.items.find(x=>x.id==='proteina_vegetal');if(!it){it={id:'proteina_vegetal',grams:0};m.items.push(it);}
        const add=Math.min(50-it.grams,need/(FOOD_MAP.proteina_vegetal.p/100));
        if(add<=0)continue;it.grams=round5(it.grams+add);m.totals=totals(m.items);day=planTotals(meals);need=targets.protein*.96-day.p;
      }
    }
    reconcileCarbs(false);
  }

  // Evita excesso proteico desnecessário em planos com muitas refeições/fontes.
  // Reduz primeiro fontes mais gordurosas e repõe a energia com carboidratos coerentes.
  day=planTotals(meals);
  if(day.p>targets.protein*1.15){
    let excess=day.p-targets.protein*1.08;
    const reducible=[];
    meals.forEach(m=>m.items.forEach(it=>{const f=FOOD_MAP[it.id];if(f.role==='protein')reducible.push({meal:m,it,f});}));
    reducible.sort((a,b)=>((b.f.f/(b.f.p||1))-(a.f.f/(a.f.p||1))));
    for(const x of reducible){
      if(excess<=2)break;
      const min=idMin(x.f.id,x.meal.slot),room=x.it.grams-min;if(room<=0)continue;
      const cut=Math.min(room,excess/(x.f.p/100||.01));
      x.it.grams=round5(Math.max(min,x.it.grams-cut));x.meal.totals=totals(x.meal.items);
      day=planTotals(meals);excess=day.p-targets.protein*1.08;
    }
    reconcileCarbs(false);
  }

  // Feijão permanece em porção-base; a energia extra é distribuída por carboidratos e
  // gorduras culinariamente coerentes para evitar fibra/proteína incidental excessiva.

  // Corrige déficit de gordura/calorias apenas em refeições principais, associado a
  // salada/legumes/preparo. Nunca aparece isolado, no café da manhã ou no pré-treino.
  day=planTotals(meals);
  if(day.f<targets.fat*.85){
    for(const m of meals.filter(m=>['lunch','dinner'].includes(m.slot))){
      if(day.f>=targets.fat*.98)break;
      if(!m.items.some(it=>FOOD_MAP[it.id].role==='veg'))continue;
      let oil=m.items.find(it=>it.id==='azeite');
      if(!oil){oil={id:'azeite',grams:0};m.items.push(oil);}
      const mealCount=(+profile.mealsPerDay||4);
      const oilMax=(mealCount<=3 || profile.dietType==='vegan' || (profile.goal==='gain' && mealCount<=4))?20:15;
      const fatNeed=Math.max(0,targets.fat*.98-day.f),room=oilMax-oil.grams;
      const raw=Math.min(room,fatNeed);
      if(raw<2.5){if(oil.grams<=0)m.items=m.items.filter(it=>it!==oil);continue;}
      oil.grams=Math.min(oilMax,round5(oil.grams+raw));
      m.totals=totals(m.items);day=planTotals(meals);
    }
    // Troca energia de carboidrato por gordura sem alterar a meta calórica.
    reconcileCarbs(false);
  }

  // Se ovos inteiros empurraram a gordura muito acima da meta, troca parte deles
  // por claras preservando proteína e mantendo uma refeição culinariamente normal.
  day=planTotals(meals);
  if(day.f>targets.fat*1.15 && profile.dietType!=='vegan'){
    for(const m of meals){
      if(day.f<=targets.fat*1.08)break;
      const egg=m.items.find(it=>it.id==='ovo');if(!egg||egg.grams<=50)continue;
      const cut=Math.min(50,egg.grams-50);egg.grams=round5(egg.grams-cut);
      let whites=m.items.find(it=>it.id==='clara_ovo');if(!whites){whites={id:'clara_ovo',grams:0};m.items.push(whites);}
      whites.grams=round5(whites.grams+cut*(FOOD_MAP.ovo.p/FOOD_MAP.clara_ovo.p));
      m.totals=totals(m.items);day=planTotals(meals);
    }
    reconcileCarbs(false);
  }

  // Em dietas veganas com gordura ainda baixa, uma pequena porção de pasta de
  // amendoim no café/lanche é mais coerente do que despejar mais azeite no dia.
  day=planTotals(meals);
  if(day.f<targets.fat*.80 && !excludedFoodIds(profile).has('pasta_amendoim')){
    for(const m of meals.filter(m=>['breakfast','snack','ceia'].includes(m.slot))){
      if(day.f>=targets.fat*.90)break;
      if(m.items.some(it=>FOOD_MAP[it.id].role==='fat'))continue;
      const need=Math.max(0,targets.fat*.90-day.f),pbMax=profile.budget==='economy'?15:30,g=Math.min(pbMax,Math.max(5,need/(FOOD_MAP.pasta_amendoim.f/100)));
      m.items.push({id:'pasta_amendoim',grams:round5(g)});m.totals=totals(m.items);day=planTotals(meals);
    }
    reconcileCarbs(false);
  }

  // Se o usuário escolheu poucas refeições e ainda falta energia, permita porções
  // maiores de carboidratos em vez de inserir alimentos fora de contexto.
  day=planTotals(meals);
  if(targets.calories-day.kcal>targets.calories*.02)reconcileCarbs(true);

  // Guardrail de volume/fibra: em dietas baseadas em plantas com 4+ refeições,
  // reduz o excesso de leguminosas/PTS e transfere parte da proteína para uma fonte
  // em pó compatível. Assim evita 60–80 g de fibra/dia apenas para fechar proteína.
  day=planTotals(meals);
  const fiberCap=Math.min(55,Math.max(45,targets.fiber*1.50));
  if(['vegan','vegetarian'].includes(profile.dietType) && (+profile.mealsPerDay||4)>=4 && day.fiber>fiberCap){
    const denseIds=new Set(['pts','lentilha','grao_bico','feijao']);
    const dense=[];
    meals.forEach(m=>m.items.forEach(it=>{if(denseIds.has(it.id))dense.push({m,it,f:FOOD_MAP[it.id]})}));
    dense.sort((a,b)=>(b.f.fiber||0)-(a.f.fiber||0));
    for(const x of dense){
      if(day.fiber<=fiberCap)break;
      const min=x.it.id==='pts'?40:50,room=x.it.grams-min;if(room<5)continue;
      const need=(day.fiber-fiberCap)/(x.f.fiber/100||.01);
      let cut=Math.min(room,Math.max(5,need));cut=Math.floor(cut/5)*5;if(cut<5)continue;
      x.it.grams=Math.max(min,x.it.grams-cut);x.m.totals=totals(x.m.items);day=planTotals(meals);
    }
    let proteinNeed=Math.max(0,targets.protein*.94-day.p);
    const excluded=excludedFoodIds(profile);
    const powder=(profile.dietType==='vegetarian'&&!excluded.has('whey'))?'whey':(!excluded.has('proteina_vegetal')?'proteina_vegetal':null);
    if(proteinNeed>2 && powder){
      const pf=FOOD_MAP[powder], eligible=meals.filter(m=>['breakfast','snack','pre','post','ceia'].includes(m.slot));
      for(const m of eligible){
        if(proteinNeed<=2)break;
        let pv=m.items.find(it=>it.id===powder);if(!pv){pv={id:powder,grams:0};m.items.push(pv);}
        const room=50-pv.grams;if(room<=0)continue;
        const add=Math.min(room,proteinNeed/(pf.p/100));pv.grams=round5(pv.grams+add);
        m.totals=totals(m.items);day=planTotals(meals);proteinNeed=Math.max(0,targets.protein*.94-day.p);
      }
    }
    reconcileCarbs(false);
    if(targets.calories-day.kcal>targets.calories*.02)reconcileCarbs(true);
  }

  // Polimento final de macros: correções pequenas depois de todos os ajustes de energia/fibra.
  // Usa apenas componentes já compatíveis com a refeição e reequilibra calorias via carboidrato.
  day=planTotals(meals);
  if(day.p<targets.protein*.90){
    let need=targets.protein*.94-day.p;
    const pmax=(id,slot)=>{if(id==='whey')return 45;if(id==='proteina_vegetal')return 50;if(id==='pts')return (+profile.mealsPerDay||4)<=3?90:60;if(id==='tofu')return 250;if(id==='clara_ovo')return 200;if(id==='ovo')return ['lunch','dinner'].includes(slot)?180:120;if(id==='queijo')return 80;return 220;};
    const arr=[];meals.forEach(m=>m.items.forEach(it=>{const f=FOOD_MAP[it.id];if(f.role==='protein')arr.push({m,it,f})}));
    arr.sort((a,b)=>(b.f.p/b.f.kcal)-(a.f.p/a.f.kcal));
    for(const x of arr){if(need<=2)break;const room=pmax(x.f.id,x.m.slot)-x.it.grams;if(room<=0)continue;const add=Math.min(room,need/(x.f.p/100||.01));x.it.grams=round5(x.it.grams+add);x.m.totals=totals(x.m.items);day=planTotals(meals);need=targets.protein*.94-day.p;}
    const excluded=excludedFoodIds(profile);
    if(need>2 && profile.dietType==='vegetarian' && !excluded.has('clara_ovo')){
      for(const m of meals.filter(m=>['breakfast','lunch','dinner'].includes(m.slot))){if(need<=2)break;let it=m.items.find(x=>x.id==='clara_ovo');if(!it){it={id:'clara_ovo',grams:0};m.items.push(it);}const room=200-it.grams;if(room<=0)continue;const add=Math.min(room,need/(FOOD_MAP.clara_ovo.p/100));it.grams=round5(it.grams+add);m.totals=totals(m.items);day=planTotals(meals);need=targets.protein*.94-day.p;}
    }
    if(need>2 && profile.dietType==='vegan' && !excluded.has('proteina_vegetal')){
      for(const m of meals.filter(m=>['breakfast','snack','pre','post','ceia'].includes(m.slot))){if(need<=2)break;let it=m.items.find(x=>x.id==='proteina_vegetal');if(!it){it={id:'proteina_vegetal',grams:0};m.items.push(it);}const room=50-it.grams;if(room<=0)continue;const add=Math.min(room,need/(FOOD_MAP.proteina_vegetal.p/100));it.grams=round5(it.grams+add);m.totals=totals(m.items);day=planTotals(meals);need=targets.protein*.94-day.p;}
    }
    reconcileCarbs(false);
  }

  day=planTotals(meals);
  if(day.p>targets.protein*1.15){
    for(const m of meals.filter(m=>['snack','ceia'].includes(m.slot))){
      if(day.p<=targets.protein*1.10)break;
      const candidates=m.items.filter(it=>FOOD_MAP[it.id].role==='protein').sort((a,b)=>(FOOD_MAP[b.id].p||0)-(FOOD_MAP[a.id].p||0));
      for(const it of candidates){
        if(day.p<=targets.protein*1.10)break;
        const f=FOOD_MAP[it.id], removable=Math.max(0,it.grams-5);
        if(removable<=0)continue;
        const need=(day.p-targets.protein*1.10)/(f.p/100||.01);
        it.grams=Math.max(0,round5(it.grams-Math.min(removable,need)));
        m.items=m.items.filter(x=>x.grams>0);m.totals=totals(m.items);day=planTotals(meals);
      }
    }
    reconcileCarbs(false);
  }

  day=planTotals(meals);
  if(day.f<targets.fat*.82){
    const excluded=excludedFoodIds(profile), n=(+profile.mealsPerDay||4);
    for(const m of meals.filter(m=>['lunch','dinner'].includes(m.slot))){if(day.f>=targets.fat*.90)break;if(!m.items.some(it=>FOOD_MAP[it.id].role==='veg'))continue;let oil=m.items.find(it=>it.id==='azeite');if(!oil){oil={id:'azeite',grams:0};m.items.push(oil);}const maxOil=20,room=maxOil-oil.grams;if(room<=0)continue;const add=Math.min(room,Math.max(5,(targets.fat*.90-day.f)));oil.grams=Math.min(maxOil,round5(oil.grams+add));m.totals=totals(m.items);day=planTotals(meals);}
    if(day.f<targets.fat*.85 && !excluded.has('pasta_amendoim')){
      for(const m of meals.filter(m=>['breakfast','snack','ceia'].includes(m.slot))){if(day.f>=targets.fat*.90)break;if(m.items.some(it=>FOOD_MAP[it.id].role==='fat'))continue;const maxPb=profile.budget==='economy'?15:30,need=Math.max(0,targets.fat*.90-day.f),g=Math.min(maxPb,Math.max(5,need/(FOOD_MAP.pasta_amendoim.f/100)));m.items.push({id:'pasta_amendoim',grams:round5(g)});m.totals=totals(m.items);day=planTotals(meals);}
    }
    if(day.f<targets.fat*.85 && !excluded.has('abacate')){
      for(const m of meals.filter(m=>['breakfast','snack','ceia','lunch','dinner'].includes(m.slot))){if(day.f>=targets.fat*.92)break;if(m.items.some(it=>FOOD_MAP[it.id].role==='fat'))continue;const need=Math.max(0,targets.fat*.92-day.f),g=Math.min(100,Math.max(30,need/(FOOD_MAP.abacate.f/100)));m.items.push({id:'abacate',grams:round5(g)});m.totals=totals(m.items);day=planTotals(meals);}
    }
    reconcileCarbs(false);
  }

  day=planTotals(meals);
  if(targets.calories-day.kcal>targets.calories*.02)reconcileCarbs(true);

  // Resgate proteico final: em restrições combinadas, distribui uma fonte magra
  // compatível sem forçar volumes irreais de leguminosas. Pós/shake pode acompanhar
  // almoço ou jantar quando o usuário escolheu apenas 3 refeições.
  day=planTotals(meals);
  if(day.p<targets.protein*.88){
    const excluded=excludedFoodIds(profile);
    const ids=profile.dietType==='vegan'
      ? ['proteina_vegetal']
      : profile.dietType==='vegetarian'
        ? ['whey','proteina_vegetal','clara_ovo']
        : ['frango','whey','proteina_vegetal','clara_ovo'];
    let need=targets.protein*.94-day.p;
    for(const id of ids){
      if(need<=2||excluded.has(id)||!FOOD_MAP[id])continue;
      const f=FOOD_MAP[id];
      for(const m of meals){
        if(need<=2)break;
        const supplement=(id==='whey'||id==='proteina_vegetal');
        if(!supplement && !f.slots.includes(m.slot))continue;
        let it=m.items.find(x=>x.id===id);
        if(!it){it={id,grams:0};m.items.push(it);}
        const max=supplement?40:(id==='clara_ovo'?200:220);
        const room=Math.max(0,max-it.grams);
        if(room<=0)continue;
        const add=Math.min(room,need/(f.p/100||.01));
        if(add<2.5)continue;
        it.grams=round5(it.grams+add);
        m.totals=totals(m.items);day=planTotals(meals);need=targets.protein*.94-day.p;
      }
    }
    reconcileCarbs(false);
    day=planTotals(meals);
  }

  // Se muitas refeições/itens mínimos empurrarem a energia acima da meta, reduz
  // porções de forma conservadora preservando os pisos de proteína e gordura.
  // Isso é especialmente útil em planos de baixa caloria com 5–6 refeições.
  day=planTotals(meals);
  if(day.kcal>targets.calories*1.04){
    const ceiling=targets.calories*1.02;
    const candidates=[];
    meals.forEach(m=>m.items.forEach(it=>{
      const f=FOOD_MAP[it.id];
      let min=5;
      if(f.role==='carb')min=carbMin(f.id,m.slot);
      else if(f.role==='fruit'||f.role==='veg')min=50;
      else if(f.role==='fat')min=0;
      else if(f.role==='legume')min=50;
      else if(f.role==='protein'||f.role==='dairy')min=idMin(f.id,m.slot);
      if(it.grams>min)candidates.push({m,it,f,min});
    }));
    // Primeiro reduz itens com menor contribuição relativa de proteína/gordura.
    candidates.sort((a,b)=>{
      const da=((a.f.p*4+a.f.f*9)/(a.f.kcal||1));
      const db=((b.f.p*4+b.f.f*9)/(b.f.kcal||1));
      return da-db;
    });
    for(const x of candidates){
      if(day.kcal<=ceiling)break;
      const room=x.it.grams-x.min;if(room<5)continue;
      const pRoom=x.f.p>0?(day.p-targets.protein*.90)/(x.f.p/100):Infinity;
      const fRoom=x.f.f>0?(day.f-targets.fat*.82)/(x.f.f/100):Infinity;
      const kRoom=(day.kcal-ceiling)/(x.f.kcal/100||.01);
      let cut=Math.min(room,pRoom,fRoom,kRoom);
      cut=Math.floor(cut/5)*5;
      if(cut<5)continue;
      x.it.grams=Math.max(x.min,x.it.grams-cut);
      x.m.items=x.m.items.filter(it=>it.grams>0);
      x.m.totals=totals(x.m.items);day=planTotals(meals);
    }
  }

  day=planTotals(meals);
  meals.forEach(m=>{const issues=validateMealSemantics(m);if(issues.length)throw new Error(`Falha semântica após ajuste: ${issues.join(', ')}`);m.items=m.items.filter(it=>it.grams>0);m.totals=totals(m.items)});
  day=planTotals(meals);
  const kcalDev=Math.abs(day.kcal-targets.calories)/Math.max(1,targets.calories);
  const pRatio=day.p/Math.max(1,targets.protein), cRatio=day.c/Math.max(1,targets.carbs), fRatio=day.f/Math.max(1,targets.fat);
  const finalFiberCap=Math.max(65,Math.min(75,targets.fiber*1.75));
  if(kcalDev>.06 || pRatio<.85 || pRatio>1.15 || cRatio<.80 || cRatio>1.20 || fRatio<.80 || fRatio>1.25 || day.fiber>finalFiberCap){
    throw new Error('As restrições combinadas e o número de refeições não permitem um plano automático dentro dos limites de segurança e precisão. Tente aumentar o número de refeições ou revisar as restrições informadas.');
  }
  return {meals,totals:day,slots};
}

export function planTotals(meals){return meals.reduce((a,m)=>{const t=totals(m.items);a.kcal+=t.kcal;a.p+=t.p;a.c+=t.c;a.f+=t.f;a.fiber+=t.fiber;return a;},{kcal:0,p:0,c:0,f:0,fiber:0});}

function slotTitle(slot,i,slots,p){
  const labels={breakfast:'Café da manhã',snack:'Lanche',lunch:'Almoço',pre:'Pré-treino',post:'Pós-treino',dinner:'Jantar',ceia:'Ceia'};
  if(slot==='pre' && i===0 && p.trainingTime==='morning') return 'Café da manhã / Pré-treino';
  if(slot==='dinner' && p.trainingTime==='evening' && (+p.trainingsPerWeek||0)>0) return 'Jantar / Pós-treino';
  if(slot==='snack') return `${labels[slot]} ${slots.slice(0,i).filter(s=>s==='snack').length+1}`;
  return labels[slot]||slot;
}
