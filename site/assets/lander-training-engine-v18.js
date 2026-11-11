/* LANDER RIO — TRAINING BLUEPRINT V18 / volume-first, duration-last. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LanderTrainingEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LABEL={peito:'Peito',costas:'Costas',ombros:'Ombros',quadriceps:'Quadríceps',posteriores:'Posteriores',gluteos:'Glúteos',biceps:'Bíceps',triceps:'Tríceps',panturrilhas:'Panturrilhas',abdomen:'Core'};
// Order within groups follows practical movement diversity; press/row, then alternative angle, then isolation.
const EX={
 academia:{
 peito:[['Supino reto com halteres','composto'],['Supino inclinado com halteres','composto'],['Crucifixo na máquina','isolado'],['Supino em máquina','composto'],['Crossover na polia','isolado'],['Flexão de braços','composto']],
 costas:[['Puxada frontal na polia','composto'],['Remada articulada','composto'],['Remada baixa na polia','composto'],['Remada unilateral com halter','composto'],['Pulldown com braços estendidos','isolado']],
 ombros:[['Desenvolvimento com halteres','composto'],['Elevação lateral com halteres','isolado'],['Crucifixo inverso na máquina','isolado'],['Elevação lateral na polia','isolado'],['Desenvolvimento em máquina','composto']],
 quadriceps:[['Agachamento livre (ou máquina guiada)','composto'],['Leg press','composto'],['Cadeira extensora','isolado'],['Afundo reverso com halteres','composto'],['Agachamento goblet','composto']],
 posteriores:[['Mesa flexora','isolado'],['Levantamento romeno com halteres','composto'],['Cadeira flexora','isolado'],['Stiff com halteres','composto']],
 gluteos:[['Elevação pélvica','composto'],['Afundo reverso com halteres','composto'],['Abdução de quadril na máquina','isolado'],['Coice na polia','isolado']],
 biceps:[['Rosca direta na barra W','isolado'],['Rosca alternada com halteres','isolado'],['Rosca martelo com halteres','isolado'],['Rosca na polia','isolado']],
 triceps:[['Tríceps na corda','isolado'],['Tríceps acima da cabeça na polia','isolado'],['Tríceps na barra V','isolado'],['Extensão de tríceps com halter','isolado']],
 panturrilhas:[['Panturrilha em pé na máquina','isolado'],['Panturrilha sentada','isolado'],['Panturrilha unilateral em pé','isolado']],
 abdomen:[['Prancha frontal','tempo'],['Crunch no solo','isolado'],['Abdominal na polia','isolado'],['Dead bug','tempo']]
 },
 halteres:{
 peito:[['Supino com halteres no chão','composto'],['Flexão de braços','composto'],['Supino neutro com halteres no chão','composto'],['Crucifixo parcial no chão (amplitude confortável)','isolado']],
 costas:[['Remada unilateral com halter','composto'],['Remada curvada com halteres','composto'],['Remada apoiada no joelho com halter','composto'],['Pullover com halter','isolado']],
 ombros:[['Desenvolvimento com halteres','composto'],['Elevação lateral com halteres','isolado'],['Crucifixo inverso com halteres','isolado'],['Elevação lateral unilateral','isolado']],
 quadriceps:[['Agachamento goblet','composto'],['Afundo com halteres','composto'],['Agachamento com halteres','composto'],['Agachamento búlgaro adaptado','composto']],
 posteriores:[['Levantamento romeno com halteres','composto'],['Stiff unilateral com halter','composto'],['Ponte de glúteos com calcanhares afastados','composto']],
 gluteos:[['Elevação pélvica com halter','composto'],['Afundo reverso com halteres','composto'],['Ponte de glúteos com halter','isolado']],
 biceps:[['Rosca alternada com halteres','isolado'],['Rosca martelo com halteres','isolado'],['Rosca concentrada com halter','isolado']],
 triceps:[['Extensão de tríceps com halter','isolado'],['Tríceps testa com halteres','isolado'],['Tríceps acima da cabeça unilateral','isolado']],
 panturrilhas:[['Elevação de panturrilhas com halteres','isolado'],['Panturrilha unilateral em pé','isolado']],
 abdomen:[['Prancha frontal','tempo'],['Abdominal reverso','isolado'],['Dead bug','tempo']]
 },
 corporal:{
 peito:[['Flexão de braços (adapte a inclinação)','composto'],['Flexão de braços com mãos afastadas','composto'],['Flexão com pés elevados (se confortável)','composto'],['Flexão com pausa na descida','composto']],
 costas:[['Puxada isométrica com toalha (oposição das mãos)','isolado'],['Extensão de tronco no solo','isolado'],['Remada isométrica contra ponto fixo seguro','isolado']],
 ombros:[['Flexão pike adaptada','composto'],['Elevação em Y deitado de bruços','isolado'],['Elevação em T deitado de bruços','isolado']],
 quadriceps:[['Agachamento livre','composto'],['Afundo reverso sem carga','composto'],['Agachamento com pausa','composto'],['Agachamento búlgaro apoiado','composto']],
 posteriores:[['Ponte de glúteos com pés afastados','composto'],['Flexão de joelhos deslizante (piso seguro)','isolado'],['Ponte unilateral com apoio','composto']],
 gluteos:[['Ponte de glúteos','composto'],['Afundo reverso sem carga','composto'],['Elevação pélvica unilateral','composto']],
 biceps:[['Isometria de flexão de cotovelo com oposição manual','isolado'],['Flexão de cotovelo autorrresistida (mão oposta)','isolado']],
 triceps:[['Flexão fechada com joelhos apoiados','composto'],['Extensão de cotovelo com oposição manual','isolado']],
 panturrilhas:[['Panturrilha unilateral em pé','isolado'],['Panturrilha bilateral com pausa','isolado']],
 abdomen:[['Prancha frontal','tempo'],['Dead bug','tempo'],['Abdominal reverso','isolado']]
 }
};
// Each template describes deliberately complete sessions. Repeating a group means a distinct exercise.
const TEMPLATES={
 fullA:{name:'Corpo inteiro A',slots:['quadriceps','peito','costas','posteriores','ombros','abdomen','panturrilhas']},
 fullB:{name:'Corpo inteiro B',slots:['posteriores','costas','peito','quadriceps','gluteos','triceps','biceps']},
 fullC:{name:'Corpo inteiro C',slots:['quadriceps','gluteos','peito','costas','posteriores','ombros','abdomen']},
 upperA:{name:'Superiores A · Peito e costas',slots:['peito','costas','peito','costas','ombros','triceps','biceps']},
 upperB:{name:'Superiores B · Costas e peito',slots:['costas','peito','costas','peito','ombros','biceps','triceps']},
 lowerA:{name:'Inferiores A · Ênfase quadríceps',slots:['quadriceps','posteriores','quadriceps','gluteos','posteriores','panturrilhas','abdomen']},
 lowerB:{name:'Inferiores B · Ênfase posterior',slots:['posteriores','quadriceps','posteriores','gluteos','quadriceps','panturrilhas','abdomen']},
 pushA:{name:'Push A · Peito, ombros e tríceps',slots:['peito','peito','ombros','peito','ombros','triceps','triceps']},
 pushB:{name:'Push B · Peito, ombros e tríceps',slots:['peito','ombros','peito','peito','ombros','triceps','triceps']},
 pullA:{name:'Pull A · Costas e bíceps',slots:['costas','costas','costas','ombros','biceps','biceps','abdomen']},
 pullB:{name:'Pull B · Costas e bíceps',slots:['costas','costas','ombros','costas','biceps','biceps','abdomen']},
 legsA:{name:'Legs A · Pernas completas',slots:['quadriceps','posteriores','quadriceps','posteriores','gluteos','panturrilhas','quadriceps','abdomen']},
 legsB:{name:'Legs B · Pernas completas',slots:['posteriores','quadriceps','posteriores','quadriceps','gluteos','panturrilhas','quadriceps','abdomen']},
 chest:{name:'Peito e tríceps',slots:['peito','peito','peito','peito','ombros','triceps','triceps']},
 back:{name:'Costas e bíceps',slots:['costas','costas','costas','costas','ombros','biceps','biceps']},
 quad:{name:'Quadríceps · Dia de pernas',slots:['quadriceps','quadriceps','posteriores','quadriceps','gluteos','panturrilhas','abdomen']},
 shoulder:{name:'Ombros e braços',slots:['ombros','ombros','ombros','biceps','triceps','biceps','triceps']},
 posterior:{name:'Posteriores e glúteos',slots:['posteriores','posteriores','gluteos','quadriceps','gluteos','panturrilhas','abdomen']}
};
const GOALS=['hipertrofia','emagrecimento','forca','condicionamento','saude'];
const SPLITS=['automatico','fullbody','upperlower','ppl','abcde'];
function validated(p){
 if(!p||typeof p!=='object')throw Error('Dados inválidos.');
 const idade=Number(p.idade),peso=Number(p.peso),altura=Number(p.altura),dias=Number(p.dias);
 if(!Number.isInteger(idade)||idade<18||idade>100)throw Error('Este aplicativo atende apenas adultos de 18 a 100 anos.');
 if(!Number.isFinite(peso)||peso<35||peso>300)throw Error('Informe um peso entre 35 e 300 kg.');
 if(!Number.isFinite(altura)||altura<130||altura>230)throw Error('Informe uma altura entre 130 e 230 cm.');
 if(!Number.isInteger(dias)||dias<1||dias>6)throw Error('Escolha de 1 a 6 dias na semana.');
 const objetivo=GOALS.includes(p.objetivo)?p.objetivo:'hipertrofia';
 const nivel=['iniciante','intermediario','avancado'].includes(p.nivel)?p.nivel:'iniciante';
 const equipamentos=['academia','halteres','corporal'].includes(p.equipamentos)?p.equipamentos:'academia';
 const divisao=SPLITS.includes(p.divisao)?p.divisao:'automatico';
 if(divisao==='abcde'&&dias<5)throw Error('A divisão ABCDE precisa de 5 ou 6 dias. Escolha outra divisão ou aumente a frequência.');
 const cardio=['objetivo','essencial','equilibrado','alto','nenhum'].includes(p.cardio)?p.cardio:'objetivo';
 const enfase=(Array.isArray(p.enfase)?p.enfase:[]).filter(g=>Object.prototype.hasOwnProperty.call(LABEL,g)).filter((g,i,a)=>a.indexOf(g)===i).slice(0,2);
 return {idade,peso,altura,dias,objetivo,nivel,equipamentos,divisao,cardio,enfase,limitacao:!!p.limitacao};
}
function selectPattern(days,split){
 if(days===1)return ['fullA'];
 if(days===2)return ['fullA','fullB'];
 if(split==='abcde')return days===5?['chest','back','quad','shoulder','posterior']:['chest','back','quad','shoulder','posterior','upperB'];
 if(split==='fullbody')return Array.from({length:days},(_,i)=>['fullA','fullB','fullC'][i%3]);
 if(split==='upperlower')return days===3?['upperA','lowerA','fullC']:Array.from({length:days},(_,i)=>['upperA','lowerA','upperB','lowerB'][i%4]);
 if(split==='ppl'){
  if(days===3)return ['pushA','pullA','legsA'];
  if(days===4)return ['pushA','pullA','legsA','fullB'];
  if(days===5)return ['pushA','pullA','legsA','upperB','lowerB'];
  return ['pushA','pullA','legsA','pushB','pullB','legsB'];
 }
 if(days===3)return ['fullA','fullB','fullC'];
 if(days===4)return ['upperA','lowerA','upperB','lowerB'];
 if(days===5)return ['upperA','lowerA','pushA','pullA','legsA'];
 return ['pushA','pullA','legsA','pushB','pullB','legsB'];
}
function cardioSetup(p){
 let target=(p.objetivo==='forca')?90:(p.objetivo==='hipertrofia')?120:150;
 if(p.cardio==='essencial')target=60;
 if(p.cardio==='equilibrado')target=150;
 if(p.cardio==='alto')target=210;
 if(p.cardio==='nenhum')target=0;
 const perDay=target?Math.min(30,Math.floor(target/p.dias/5)*5):0;
 const remaining=target-perDay*p.dias;
 const activity=p.equipamentos==='academia'?'caminhada inclinada, bicicleta ou elíptico':'caminhada rápida, bicicleta ou outra atividade segura';
 return {target,perDay,remaining,activity};
}
function exerciseEstimate(e){
 const work=e.type==='tempo'?40:e.type==='composto'?45:40;
 const rest=e.rest==='120–180 s'?150:e.rest==='90–120 s'?105:70;
 return (e.sets*work+Math.max(0,e.sets-1)*rest+45)/60;
}
function estimate(s){return Math.ceil(s.warmup+s.exercises.reduce((v,e)=>v+exerciseEstimate(e),0));}
// Bias for repeat sessions, but keep multi-joint before isolation; preserve exercise variety and avoid same-session duplicates.
function selectExercise(equipment,group,ordinal,dayIndex,used,nivel){
 const variants=EX[equipment][group];
 let alternatives=variants.filter(v=>!used.has(v[0]));
 if(!alternatives.length)return null;
 if(group==='peito'||group==='costas'||group==='quadriceps'||group==='posteriores'||group==='ombros'){
   const desired=group==='ombros'||group==='posteriores'? (ordinal===0?'composto':'isolado') : (ordinal<=1?'composto':'isolado');
   if(desired){const filtered=alternatives.filter(v=>v[1]===desired);if(filtered.length)alternatives=filtered;}
 }
 if(group==='quadriceps'&&nivel==='iniciante'){const safe=alternatives.filter(v=>!v[0].startsWith('Agachamento livre'));if(safe.length)alternatives=safe;}
 if(group==='peito'&&ordinal===0){const presses=alternatives.filter(v=>v[1]==='composto'&&!v[0].includes('Flexão'));if(presses.length)return presses[(Math.floor(dayIndex/2))%Math.min(2,presses.length)];}
 if((group==='peito'&&ordinal===1)||(group==='costas'&&ordinal<=1)||(group==='ombros'&&ordinal<=2)||(group==='posteriores'&&ordinal<=1))return alternatives[0];
 return alternatives[(dayIndex+ordinal)%alternatives.length];
}
function repsAndRest(type,p){
 if(type==='tempo')return {reps:'20–40 s',rest:'45–75 s'};
 if(p.objetivo==='forca'&&type==='composto'&&p.nivel!=='iniciante')return {reps:'4–6',rest:'120–180 s'};
 if(type==='composto')return {reps:p.objetivo==='condicionamento'||p.objetivo==='saude'?'10–15':'6–10',rest:'90–120 s'};
 return {reps:'10–15',rest:'60–90 s'};
}
function plan(input){
 const p=validated(input),patternKeys=selectPattern(p.dias,p.divisao),cardio=cardioSetup(p);
 const totals=Object.fromEntries(Object.keys(LABEL).map(g=>[g,0]));
 const sessionsPlaceholder=Object.fromEntries(Object.keys(LABEL).map(g=>[g,0]));
 const sessions=patternKeys.map((key,index)=>{
   const pattern=TEMPLATES[key];if(!pattern)throw Error('Divisão não encontrada.');
   const slotGroups=[...pattern.slots];
   // Emphasis is an extra distinct movement in sessions that already contain that muscle.
   // Never add emphasis to all sessions for 6-day programs: preserve sensible weekly load.
   for(const group of p.enfase){
     const baseline=patternKeys.reduce((sum,k)=>sum+TEMPLATES[k].slots.filter(g=>g===group).length,0);
     const groupBaselineSets=baseline*((p.nivel==='iniciante'||(p.divisao==='fullbody'&&p.dias>=5))?2:3);
     const alreadyAdded=sessionsPlaceholder[group]||0;
     const maxDirect=p.nivel==='iniciante'?14:18;
     const nextSets=((p.nivel==='iniciante'||(p.divisao==='fullbody'&&p.dias>=5))?2:3);
     const occurrences=slotGroups.filter(g=>g===group).length;
     const eligible=occurrences>0&&occurrences<3&&(p.dias<=4?index%2===0:index%3===0);
     if(eligible&&EX[p.equipamentos][group].length>occurrences&&groupBaselineSets+alreadyAdded+nextSets<=maxDirect){
       const after=slotGroups.lastIndexOf(group)+1;slotGroups.splice(after,0,group);sessionsPlaceholder[group]+=nextSets;
     }
   }
   const used=new Set(),counts={},exercises=[];
   for(const group of slotGroups){
     let nth=counts[group]||0;
     let pick=selectExercise(p.equipamentos,group,nth,index,used,p.nivel);
     // Pull and dedicated back sessions train the rear delts, not another overhead press.
     if(group==='ombros'&&(key==='pullA'||key==='pullB'||key==='back')){
       const rear=EX[p.equipamentos].ombros.find(v=>/Crucifixo inverso|Elevação em T/.test(v[0])&&!used.has(v[0]));
       if(rear)pick=rear;
     }
     // The main quad exercise of a leg session should be a scalable squat/leg-press pattern.
     if(group==='quadriceps'&&nth===0&&p.equipamentos==='academia'){
       const preferred=p.nivel==='iniciante'||key==='legsB'||key==='lowerB'?'Leg press':'Agachamento livre (ou máquina guiada)';
       const base=EX.academia.quadriceps.find(v=>v[0]===preferred&&!used.has(v[0]));
       if(base)pick=base;
     }
     if(!pick)continue;
     counts[group]=nth+1;used.add(pick[0]);
     const type=pick[1], rr=repsAndRest(type,p);
     // Beginners build skill with 2 sets; intermediates/advanced get 3. Across six full-body
     // days reduce all sets to 2 to avoid an excessive volume by repetition alone.
     let sets=(p.nivel==='iniciante'||(p.divisao==='fullbody'&&p.dias>=5))?2:3;
     // For a 5-6 day ABCDE specialist, 3 series per exercise is adequate; no arbitrary boosts.
     const entry={name:pick[0],group,label:LABEL[group],type,sets,reps:rr.reps,rest:rr.rest,rir:p.nivel==='iniciante'?'3–4':p.objetivo==='forca'?'2–3':'1–3'};
     exercises.push(entry);totals[group]+=sets;
   }
   const session={day:index+1,name:pattern.name,exercises,cardioMinutes:cardio.perDay,cardioActivity:cardio.activity,warmup:8};
   session.durationEstimate=estimate(session);
   return session;
 });
 const tips=[
 'Aquecimento: 5–10 minutos de movimento leve e 1–3 séries progressivas leves antes do primeiro exercício pesado (as séries de aquecimento não entram no volume de trabalho).',
 'Escolha a carga pela execução e pelo RIR (repetições que ainda conseguiria fazer). Seu peso corporal não define os pesos utilizados nos exercícios.',
 'Progrida gradualmente: ao atingir o topo da faixa de repetições com técnica consistente por duas sessões, aumente um pouco a resistência; mantenha o controle.',
 'Volume semanal exibido contabiliza apenas séries diretas dos exercícios listados. Exercícios compostos também recrutam músculos secundários.',
 'Distribua os dias conforme recuperação e disponibilidade. Evite repetir sessões pesadas dos mesmos músculos sem recuperação suficiente.'
 ];
 if(p.dias===1)tips.push('Um único dia semanal é um começo possível, mas o ideal é distribuir fortalecimento por pelo menos 2 dias quando viável.');
 if(p.divisao==='ppl'&&p.dias===3)tips.push('Push/Pull/Legs em 3 dias dá um foco direto principal por grupo a cada semana; corpo inteiro 3 vezes pode oferecer melhor frequência para alguns objetivos.');
 if(p.divisao==='abcde')tips.push('ABCDE oferece sessões com foco muscular, mas alguns grupos têm apenas um grande dia semanal. Distribuir estímulo duas vezes na semana pode ser vantajoso conforme a recuperação.');
 if(p.divisao==='fullbody'&&p.dias>=5)tips.push('Corpo inteiro em 5–6 dias exige atenção à recuperação. O sistema reduz séries por sessão; considere alternar sessões leves ou escolher outra divisão.');
 if(p.equipamentos==='corporal')tips.push('Somente peso corporal limita especialmente o estímulo de dorsais e bíceps. Para treino mais completo, inclua equipamento de puxada seguro ou busque orientação profissional.');
 if(p.limitacao)tips.push('Você relatou dor, lesão ou restrição. A ferramenta não avalia sua condição nem troca exercícios por critérios clínicos. Não siga uma ficha que provoque sintomas; procure orientação individual.');
 if(cardio.target<150)tips.push('O volume aeróbico escolhido é menor que a recomendação geral de pelo menos 150 minutos moderados por semana para adultos.');
 if(cardio.target)tips.push('O cardio é uma sugestão independente. Execute após a musculação ou em outro horário, sem cortar exercícios de força para encaixá-lo.');
 return {profile:p,sessions,cardio,weeklySets:totals,tips,splitName:p.divisao==='automatico'?'Divisão recomendada':({fullbody:'Corpo inteiro',upperlower:'Superior / inferior',ppl:'Push / Pull / Legs',abcde:'ABCDE · por grupo'}[p.divisao]),planVersion:'18.0'};
}
function toText(r){const p=r.profile;let lines=['LANDER RIO | TRAINING BLUEPRINT V18','Ficha educativa · landerrio.com.br/treino/','',`Objetivo: ${p.objetivo} | ${p.dias} dia(s)/semana | Nível: ${p.nivel} | Equipamentos: ${p.equipamentos}`,'Tempo: estimado a partir dos exercícios e intervalos, nunca utilizado como limite.',''];
 for(const s of r.sessions){lines.push(`DIA ${s.day} · ${s.name}`);for(const [i,e] of s.exercises.entries())lines.push(`${i+1}. ${e.name} · ${e.sets}×${e.reps} · descanso ${e.rest} · RIR ${e.rir}`);lines.push(`Aquecimento: ${s.warmup} min + séries leves de aproximação | Cardio: ${s.cardioMinutes} min (opcional, após musculação ou separado) | Estimativa musculação: ${s.durationEstimate} min`,'');}
 lines.push(`CARDIO NA SEMANA: ${r.cardio.target} min; ${r.cardio.remaining} min complementares em outros momentos da semana.`, '', 'SÉRIES DIRETAS POR SEMANA', ...Object.entries(r.weeklySets).filter(([g,v])=>v).map(([g,v])=>`${LABEL[g]}: ${v} séries`),'','ORIENTAÇÕES',...r.tips.map(t=>'• '+t),'','Ferramenta educativa para adultos saudáveis, não substitui prescrição individual.');return lines.join('\n');}
return {plan,toText,validated,selectPattern,LABEL,TEMPLATES};
});
