// Fixed slide references were computed with rational arithmetic independently of engine.js.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=require('./dist/engine');
const fixtures=require('./fixtures/slides.json');
let checks=0;
function near(actual,expected,label){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);checks++;}
for(const item of fixtures){
 const r=engine.calculate(item.config);
 for(const [key,expected] of Object.entries(item.expected)){
  const actual=key==='operating'?item.config.N-r.L:key==='availability'?1-r.L/item.config.N:r[key];
  near(actual,expected,`${item.source} p.${item.page}: ${item.label} ${key}`);
 }
}
// Exercise the real form and HTML rendering, including the course's cumulative-rate convention.
const source=fs.readFileSync('dist/app.js','utf8').split(" $('model-choices').innerHTML=")[0];
const hospital=[
 [1,'nonpreemptive',[4/7,152/231,41/33]],
 [2,'nonpreemptive',[21/58,829/2262,119/312]],
 [1,'preemptive',[5/14,75/154,15/11]],
 [2,'preemptive',[300/899,67800/198679,705/1768]],
];
const cases=hospital.map(([s,discipline,W])=>({s,discipline,W,rates:[.2,.6,1.2],mu:3}));
cases.push({s:2,discipline:'preemptive',rates:[.6,1.4,2],mu:5,W:[.20072260136491368,.2115950756055132,15/56]});
for(const test of cases)for(const unit of ['hora','minuto']){
 const scale=unit==='minuto'?60:1;
 const elements={};
 for(const id of ['unit','pr-service','s','pr-mu','pr-count','pr-discipline','error','status','feedback','output'])elements[id]={};
 elements.unit.value=unit;elements['pr-service'].value='common';elements.s.value=String(test.s);
 elements['pr-mu'].value=String(test.mu/scale);elements['pr-count'].value=String(test.rates.length);elements['pr-discipline'].value=test.discipline;
 test.rates.forEach((lambda,i)=>elements['pr-lambda-'+i]={value:String(lambda/scale).replace('.',',')});
 const context={QueueEngine:engine,document:{getElementById:id=>elements[id],querySelectorAll:()=>[]},setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(source+';runPriority();',context);
 let cumulative=0;
 test.rates.forEach((lambda,i)=>{
  cumulative+=lambda;
  const W=test.W[i]*scale,Wq=W-scale/test.mu;
  const expectedRate=test.discipline==='preemptive'?cumulative:lambda;
  const section=elements.output.innerHTML.split(`aria-label="Resultados da classe ${i+1}"`)[1].split('</section>')[0];
  const numbers=[...section.matchAll(/<strong>([^<]+)<\/strong>/g)].slice(0,4).map(m=>Number(m[1].replace(/\./g,'').replace(',','.')));
  const expected=[expectedRate/scale*W,expectedRate/scale*Wq,W,Wq];
  numbers.forEach((n,j)=>near(n,Number(expected[j].toFixed(5)),`${test.discipline} s=${test.s} ${unit} classe ${i+1}`));
  assert.equal(section.includes('Convenção dos slides'),test.discipline==='preemptive');checks++;
 });
 // Whole-system totals remain physical means, independently of the slide display convention.
 const base=engine.calculate({model:test.s===1?'MM1':'MMs',s:test.s,lambda:test.rates.reduce((a,b)=>a+b,0)/scale,mu:test.mu/scale});
 const totals=elements.output.innerHTML.split('<section class="priority-results"')[0];
 for(const key of ['L','Lq','W','Wq']){assert.ok(totals.includes('<strong>'+base[key].toLocaleString('pt-BR',{maximumFractionDigits:5})+'</strong>'));checks++;}
}
console.log(`${checks} verificações dos slides passaram: ${fixtures.length} cenários básicos e 10 apresentações de prioridades (horas/minutos).`);
