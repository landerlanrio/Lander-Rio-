export function validateProfile(p) {
  const errors = [];
  if (!Number.isFinite(+p.age) || +p.age < 18 || +p.age > 70) errors.push('Esta ferramenta atende adultos de 18 a 70 anos.');
  if (!Number.isFinite(+p.height) || +p.height < 130 || +p.height > 220) errors.push('Altura fora da faixa aceita (130–220 cm).');
  if (!Number.isFinite(+p.weight) || +p.weight < 35 || +p.weight > 250) errors.push('Peso fora da faixa aceita (35–250 kg).');
  if (p.bodyFat !== '' && p.bodyFat != null && (!Number.isFinite(+p.bodyFat) || +p.bodyFat < 4 || +p.bodyFat > 60)) errors.push('Percentual de gordura deve estar entre 4% e 60%, ou deixe em branco.');
  if (!['male','female'].includes(p.sex)) errors.push('Selecione o sexo biológico usado pela equação energética.');
  if (!['loss','gain','recomp','maintain'].includes(p.goal)) errors.push('Selecione um objetivo válido.');
  if (!['omnivore','vegetarian','vegan'].includes(p.dietType)) errors.push('Selecione um padrão alimentar válido.');
  for (const [key,min,max] of [['trainingsPerWeek',0,7],['trainingDuration',0,180],['mealsPerDay',3,6]]) if (p[key]==='' || !Number.isFinite(+p[key]) || +p[key]<min || +p[key]>max || !Number.isInteger(+p[key])) errors.push('Revise frequência, duração e número de refeições.');
  return errors;
}

export function screenSafety(p) {
  const reasons = [];
  const h = +p.height / 100;
  const bmi = +p.weight / (h*h);
  if (+p.age < 18) reasons.push('menor de 18 anos');
  if (+p.age > 70) reasons.push('idade acima de 70 anos');
  if (p.pregnant) reasons.push('gestação ou amamentação');
  if (p.renal) reasons.push('doença renal');
  if (p.hepatic) reasons.push('doença hepática');
  if (p.diabetes) reasons.push('diabetes em tratamento');
  if (p.eatingDisorder) reasons.push('transtorno alimentar atual ou recente');
  if (p.therapeuticDiet) reasons.push('condição/medicação que exige dieta terapêutica individualizada');
  if (p.severeAllergy) reasons.push('alergia alimentar diagnosticada ou suspeita');
  if (Number.isFinite(bmi) && bmi < 18.5) reasons.push('IMC abaixo de 18,5');
  if (Number.isFinite(bmi) && bmi >= 40) reasons.push('IMC igual ou acima de 40');
  return { blocked: reasons.length > 0, reasons, bmi };
}
