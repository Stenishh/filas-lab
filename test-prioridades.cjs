const assert=require('node:assert/strict');
const {priorities,calculate}=require('./dist/engine');
let checks=0,scenarios=0;
function near(actual,expected,label){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=1e-9*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);checks++;}
function run(rates,mu,s,discipline){scenarios++;return priorities({classes:rates.map(lambda=>({lambda})),mu,s,discipline});}
function expected(r,rows){r.classes.forEach((c,i)=>{for(const [j,key] of ['L','Lq','W','Wq'].entries())near(c[key],rows[i][j],`Classe ${i+1} ${key}`);});}
// Numerical references from the course exercises, with the corrections documented in VALIDACAO-PDFS.md.
expected(run([2,10],20,1,'nonpreemptive'),[[1/6,1/15,1/12,1/30],[4/3,5/6,2/15,1/12]]);
expected(run([2,3],6,1,'nonpreemptive'),[[3/4,5/12,3/8,5/24],[17/4,15/4,17/12,5/4]]);
expected(run([2,3],3,2,'nonpreemptive'),[[23/22,25/66,23/44,25/132],[97/22,75/22,97/66,25/22]]);
expected(run([2,4,2],10,1,'nonpreemptive'),[[.4,.2,.2,.1],[1.4,1,.35,.25],[2.2,2,1.1,1]]);
expected(run([2,4,2],10,1,'preemptive'),[[.25,.05,.125,.025],[1.25,.85,.3125,.2125],[2.5,2.3,1.25,1.15]]);
for(const [s,discipline,times] of [[1,'nonpreemptive',[20/87,8/29,4/5]],[1,'preemptive',[1/87,7/87,13/15]],[2,'nonpreemptive',[5/177,20/649,1/22]],[2,'preemptive',[1/10797,4463/1543971,47/858]]]){
 const r=run([.1,.4,1.5],3,s,discipline);expected(r,r.classes.map((c,i)=>[c.lambda*(times[i]+1/3),c.lambda*times[i],times[i]+1/3,times[i]]));
}
const general=priorities({s:1,discipline:'nonpreemptive',classes:[{lambda:10,mu:20,variance:1/1800},{lambda:5,mu:15,variance:1/1800}]});scenarios++;
expected(general,[[19/18,5/9,19/180,1/18],[2,5/3,2/5,1/3]]);
const police=run([10,20],7.5,5,'nonpreemptive');near(police.classes[0].Wq,.020149547422274695,'Viaturas classe 1');near(police.classes[1].Wq,.10074773711137347,'Viaturas classe 2');
// Conservation of the complete system, Little's law, units, and many-class support.
for(const s of [1,2,5])for(const discipline of ['nonpreemptive','preemptive'])for(const count of [1,2,3,10,20]){
 const rates=Array.from({length:count},(_,i)=>(i+1)*2/(count*(count+1))),r=run(rates,3,s,discipline);
 const baseline=calculate({model:s===1?'MM1':'MMs',lambda:1,mu:3,s});
 near(r.L,baseline.L,'L agregado');near(r.Lq,baseline.Lq,'Lq agregado');near(r.W,baseline.W,'W agregado');near(r.Wq,baseline.Wq,'Wq agregado');
 r.classes.forEach(c=>{near(c.L,c.lambda*c.W,'Little L');near(c.Lq,c.lambda*c.Wq,'Little Lq');near(c.W-c.Wq,1/3,'Tempo de serviço');assert.ok(c.Wq>=0);checks++;});
 const scaled=run(rates.map(x=>x/60),3/60,s,discipline);
 scaled.classes.forEach((c,i)=>{near(c.W,r.classes[i].W*60,'Horas para minutos W');near(c.Wq,r.classes[i].Wq*60,'Horas para minutos Wq');near(c.L,r.classes[i].L,'Contagem independente da unidade');});
}
// Workload conservation for different service means; customer-count conservation applies when means are equal.
for(const variance of [0,.02,.5]){
 const classes=[{lambda:.3,mu:2,variance},{lambda:.7,mu:3,variance:variance*2}],r=priorities({classes,s:1,discipline:'nonpreemptive'});scenarios++;
 const mean=classes.reduce((a,c)=>a+c.lambda/c.mu,0),second=classes.reduce((a,c)=>a+c.lambda*(c.variance+1/c.mu**2),0);
 const reference=calculate({model:'MG1',lambda:1,mu:1/mean,cv:Math.sqrt(second-mean**2)/mean});
 near(r.classes.reduce((a,c)=>a+c.lambda/c.mu*c.Wq,0),mean*reference.Wq,'Conservação da espera ponderada pela carga');
 const equal=priorities({classes:classes.map(c=>({...c,mu:3})),s:1,discipline:'nonpreemptive'});scenarios++;
 const varianceMixture=classes.reduce((a,c)=>a+c.lambda*c.variance,0),equalReference=calculate({model:'MG1',lambda:1,mu:3,cv:Math.sqrt(varianceMixture)*3});
 near(equal.L,equalReference.L,'Mistura com médias iguais L');near(equal.Lq,equalReference.Lq,'Mistura com médias iguais Lq');
}
for(const discipline of ['nonpreemptive','preemptive']){
 const r=run([.499999,.5],1,1,discipline);near(r.rho,.999999,'Próximo da estabilidade');r.classes.forEach(c=>{assert.ok(Number.isFinite(c.W)&&c.W>=1);checks++;});
}
const invalid=[
 {classes:[],mu:3},
 {classes:Array.from({length:21},()=>({lambda:.01})),mu:3},
 {classes:[{lambda:0}],mu:3},
 {classes:[{lambda:-1}],mu:3},
 {classes:[{lambda:NaN}],mu:3},
 {classes:[{lambda:1}],mu:0},
 {classes:[{lambda:1}],mu:Infinity},
 {classes:[{lambda:3}],mu:3},
 {classes:[{lambda:4}],mu:3},
 {classes:[{lambda:1}],mu:3,s:1.5},
 {classes:[{lambda:1}],mu:3,s:0},
 {classes:[{lambda:1}],mu:3,discipline:'invalid'},
 {classes:[{lambda:1,mu:3,variance:-1}]},
 {classes:[{lambda:1,mu:3,variance:0}],s:2},
 {classes:[{lambda:1,mu:3,variance:0}],discipline:'preemptive'}
];
for(const config of invalid){assert.throws(()=>priorities(config),Error);checks++;}
console.log(`${checks} verificações de prioridades passaram em ${scenarios} cenários válidos e ${invalid.length} entradas inválidas.`);
