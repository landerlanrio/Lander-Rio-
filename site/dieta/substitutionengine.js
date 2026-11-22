import { FOODS, FOOD_MAP, nutrients, excludedFoodIds } from './foods.js';
import { validateMealSemantics, planTotals } from './mealGenerator.js';

const totals = items => items.reduce((a,it)=>{const n=nutrients(it.id,it.grams); a.kcal+=n.kcal;a.p+=n.p;a.c+=n.c;a.f+=n.f;a.fiber+=n.fiber;return a;},{kcal:0,p:0,c:0,f:0,fiber:0});
const budgetMap={economy:1,normal:2,flexible:3};

export function getSwapCandidates(item, meal, profile) {
  const original=FOOD_MAP[item.id]; if(!original) return [];
  const maxBudget=budgetMap[profile.budget]||3;
  const excluded=excludedFoodIds(profile);
  return FOODS.filter(f=>f.id!==original.id && !excluded.has(f.id) && f.role===original.role && f.slots.includes(meal.slot) && f.diets.includes(profile.dietType||'omnivore') && f.budget<=maxBudget)
    .map(f=>({food:f,...bestPortion(original,item.grams,f)}))
    .sort((a,b)=>a.score-b.score).slice(0,5);
}

function bestPortion(orig,origGrams,cand){
  const target=nutrients(orig.id,origGrams);
  let best={grams:100,score:Infinity};
  for(let g=20;g<=400;g+=5){
    const n=nutrients(cand.id,g);
    const dominant=orig.role==='protein'?'p':orig.role==='carb'?'c':orig.role==='fat'?'f':'kcal';
    const score=Math.abs(n.kcal-target.kcal)/(target.kcal+1)*2 + Math.abs(n[dominant]-target[dominant])/(target[dominant]+1)*1.5 + Math.abs(n.fiber-target.fiber)/(target.fiber+3)*.3;
    if(score<best.score) best={grams:g,score};
  }
  return best;
}

export function swapFood(plan, mealId, itemIndex, candidateId, profile) {
  const clone=structuredClone(plan);
  const meal=clone.meals.find(m=>m.id===mealId); if(!meal) throw new Error('Refeição não encontrada');
  const original=meal.items[itemIndex]; if(!original) throw new Error('Alimento não encontrado');
  const candidate=FOOD_MAP[candidateId]; if(!candidate) throw new Error('Substituto inválido');
  if(excludedFoodIds(profile).has(candidateId) || candidate.role!==FOOD_MAP[original.id].role || !candidate.slots.includes(meal.slot) || !candidate.diets.includes(profile.dietType||'omnivore')) throw new Error('Substituição incompatível com o contexto da refeição');
  const {grams}=bestPortion(FOOD_MAP[original.id],original.grams,candidate);
  meal.items[itemIndex]={id:candidateId,grams};
  const issues=validateMealSemantics(meal); if(issues.length) throw new Error(`Troca rejeitada: ${issues.join(', ')}`);
  meal.totals=totals(meal.items); clone.totals=planTotals(clone.meals);
  return clone;
}
