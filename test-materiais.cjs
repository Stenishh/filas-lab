const assert=require('node:assert/strict');
const engine=require('./dist/engine');const {solve}=require('./dist/solver');
const fixtures=require('./fixtures/exercicios.json');
let checks=0;
function near(actual,expected,label='',tol=1e-9){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=tol*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);checks++;}
function throws(fn,pattern){assert.throws(fn,pattern);checks++;}
const get=(source,exercise)=>{const f=fixtures.find(c=>c.source===source&&c.exercise===exercise);assert.ok(f,`${source}: ${exercise}`);return solve(f.config,f.data).result;};
// Fixed expectations were derived separately using exact rational arithmetic.
for(const f of fixtures){
 const answer=solve(f.config,f.data);assert.equal(answer.kind,'complete',`${f.source}: ${f.exercise}`);checks++;
 const r=answer.result;
 for(const [key,n] of Object.entries(f.expected)){
  const actual=key==='operating'?f.config.N-r.L:key==='availability'?1-r.L/f.config.N:r[key];
  near(actual,n,`${f.source} ${f.exercise} ${key}`);
 }
 if(f.probabilities)for(const [n,p] of f.probabilities.entries())near(engine.probability(r,n),p,`${f.exercise} P(${n})`);
 // Exercise the inference path, not only forward calculation.
 const known={mu:f.data.mu,rho:r.rho,...(f.config.model==='MG1'?{variance:f.data.variance}:{})};
 const inferred=solve(f.config,known);assert.equal(inferred.kind,'complete');checks++;
 near(inferred.result.lambda,f.data.lambda,`${f.exercise} λ inferida`);
}
// M/M/s list, probabilities and service-level constraints.
let r=get('Lista MMs','2');near(engine.tails(r,.5,10).system,Math.exp(-1.6));near(engine.tails(r,.25,10).queue,.8*Math.exp(-.8));
near(engine.poisson(r.lambda,1,10),Math.exp(-12.8)*12.8**10/3628800);near(engine.poisson(r.mu,1,12),Math.exp(-16)*16**12/479001600);
near(engine.countProbability(get('Lista MMs','3'),6,'lt'),1-.8**6);
r=get('Lista MMs','4');near(r.W+1.5,2); // Expected arrival at seat is exactly kickoff, not strictly before.
r=get('Lista MMs','10b/c');near(engine.countProbability(r,4,'lt'),1-(.9/1.4)**4);near(engine.countProbability(r,4,'ge'),(.9/1.4)**4);
near(.9/(.15**.25),1.4461711541009517);
r=get('Lista MMs','11');near(engine.countProbability(r,3,'le','queue'),.96875);
r=get('Lista MMs','12');near(engine.countProbability(r,0,'eq','queue'),5/9);
for(const [ex,maxLq,minCount,minTime,t] of [['14a',1,.95,.99,.5],['14b',1,.95,.99,.5],['14c',1,.95,.99,.5],['15a',1,.95,.95,5],['15b',1,.95,.95,5],['15c',1,.95,.95,5]]){
 r=get('Lista MMs',ex);const meets=r.Lq<=maxLq&&engine.countProbability(r,ex.startsWith('14')?4:5,'le','queue')>=minCount&&1-engine.tails(r,t,0).queue>=minTime;
 assert.equal(meets,['14a','14c','15a','15c'].includes(ex),`Metas ${ex}`);checks++;
}
// Finite queue comparisons must count waiting places separately from servers.
r=get('Lista MMsK','3');near(engine.countProbability(r,2,'gt','queue'),r.probs[4]);
r=get('Lista MMsK','4');near(engine.countProbability(r,2,'gt','queue'),r.probs[5]);
near(r.block,.006768990779687459);
// All five comparisons, including Q=0 (a mass at zero), finite support, and large n.
for(const f of fixtures.filter(f=>f.probabilities&&/[KN]$/.test(f.config.model))){
 r=solve(f.config,f.data).result;
 for(const scope of ['system','queue'])for(let n=0;n<r.probs.length+2;n++){
  const tally=relation=>r.probs.reduce((sum,p,i)=>{const q=scope==='queue'?Math.max(i-r.s,0):i;return sum+({'eq':q===n,'lt':q<n,'le':q<=n,'gt':q>n,'ge':q>=n}[relation]?p:0);},0);
  for(const relation of ['eq','lt','le','gt','ge'])near(engine.countProbability(r,n,relation,scope),tally(relation),`${f.exercise} ${scope} ${relation} ${n}`);
 }
}
for(const ex of ['5','7, dois médicos','15c']){
 r=get('Lista MMs',ex);
 for(let n=0;n<12;n++){
  near(engine.countProbability(r,n,'gt')+engine.countProbability(r,n,'le'),1);
  near(engine.countProbability(r,n,'ge')-engine.countProbability(r,n,'gt'),engine.probability(r,n));
  near(engine.countProbability(r,n,'eq','queue'),n===0?1-r.wait*r.rho:engine.probability(r,n+r.s));
 }
 near(engine.countProbability(r,100000,'le'),1);near(engine.countProbability(r,100000,'le','queue'),1);near(engine.countProbability(r,100000,'eq','queue'),0);near(engine.probability(r,100000),0);
}
// Finite-source costs: labour in #1 is paid while repairing; #5 is paid per day.
r=get('Lista MMsN','1, N=10 explícito');near(8*(30*r.L+10*r.busy),219.18615594338414);
r=get('Lista MMsN','5, um mecânico');near(8*20*r.L+50,208.67431485022306);
r=get('Lista MMsN','5, cada grupo de dois');near(2*(8*20*r.L+50),221.0810810810811);
// Inverse questions about reducing variability and faster service.
near(solve({model:'MG1'},{lambda:.2,Lq:1.6,sd:4}).result.mu,(1+Math.sqrt(2))/8);
near(3600/solve({model:'MG1'},{lambda:25,Lq:25/48,cv:1}).result.mu,72.98189896992176);
// Missing variance/distribution must not silently become deterministic service.
assert.equal(solve({model:'MG1'},{lambda:3,mu:4}).kind,'partial');checks++;
assert.equal(solve({model:'MG1'},{lambda:3,Lq:2}).kind,'partial');checks++;
throws(()=>solve({model:'MMs',s:2},{lambda:40,mu:30,Wq:1/60}),/incompatíveis/);
// Nonpreemptive and preemptive priority exercises (rates per hour/day as stated).
function priority(lambda,mu,s,discipline){return engine.priorities({classes:lambda.map(lambda=>({lambda})),mu,s,discipline});}
function perClass(r,expected){r.classes.forEach((c,i)=>{for(const [key,v] of Object.entries(expected[i]))near(c[key],v,`Classe ${i+1} ${key}`);});}
r=priority([2,10],20,1,'nonpreemptive');perClass(r,[{Wq:1/30,W:1/12,Lq:1/15,L:1/6},{Wq:1/12,W:2/15,Lq:5/6,L:4/3}]);near(r.classes[0].Wq/r.classes[1].Wq,.4);near(r.rho*12,7.2);
r=priority([2,3],6,1,'nonpreemptive');perClass(r,[{Wq:5/24,W:3/8,Lq:5/12,L:3/4},{Wq:5/4,W:17/12,Lq:15/4,L:17/4}]);
r=priority([2,3],3,2,'nonpreemptive');perClass(r,[{Wq:25/132,W:23/44,Lq:25/66,L:23/22},{Wq:25/22,W:97/66,Lq:75/22,L:97/22}]);
for(const [discipline,expected] of [['nonpreemptive',[.2,.35,1.1]],['preemptive',[.125,.3125,1.25]]]){r=priority([2,4,2],10,1,discipline);r.classes.forEach((c,i)=>near(c.W,expected[i]));near(r.W,.5);}
// Hospital list #7, with s=1 and s=2. Expected per-class Wq from exact rational calculations.
for(const [s,discipline,expected] of [[1,'nonpreemptive',[40/174,16/58,4/5]],[1,'preemptive',[1/87,7/87,13/15]],[2,'nonpreemptive',[5/177,20/649,1/22]],[2,'preemptive',[1/10797,4463/1543971,47/858]]]){
 r=priority([.1,.4,1.5],3,s,discipline);r.classes.forEach((c,i)=>near(c.Wq,expected[i],`Hospital s=${s} ${discipline} classe ${i+1}`));
}
r=engine.priorities({s:1,discipline:'nonpreemptive',classes:[{lambda:10,mu:20,variance:1/1800},{lambda:5,mu:15,variance:1/1800}]});
perClass(r,[{Wq:1/18,W:19/180,Lq:5/9,L:19/18},{Wq:1/3,W:2/5,Lq:5/3,L:2}]);
r=priority([10,20],7.5,5,'nonpreemptive');near(r.classes[0].Wq,.020149547422274695);near(r.classes[1].Wq,.10074773711137347);
// Conservation across priorities and equal-class reduction to ordinary queues.
for(const s of [1,2,5])for(const discipline of ['preemptive','nonpreemptive']){
 r=priority([.2,.6,1.2],3,s,discipline);const baseline=engine.calculate({model:s===1?'MM1':'MMs',s,lambda:2,mu:3});
 near(r.L,baseline.L);near(r.Lq,baseline.Lq);near(r.W,baseline.W);
 r.classes.forEach(c=>{near(c.L,c.lambda*c.W);near(c.Lq,c.lambda*c.Wq);near(c.W-c.Wq,1/3);});
 const one=priority([2],3,s,discipline);near(one.W,baseline.W);
}
near(engine.poisson(2,0,0),1);near(engine.poisson(2,0,1),0);near(engine.poisson(1000,1,1000),.0126146113487215);
throws(()=>engine.poisson(2,-1,0),/intervalo/);throws(()=>engine.poisson(2,1,1.2),/contagem/);
throws(()=>engine.probability(get('Lista MMs','5'),-1),/inteiro/);
throws(()=>engine.countProbability(get('Lista MMs','5'),0,'invalid'),/comparação/);
throws(()=>engine.countProbability(get('Lista MG1 e prioridades','1, σ=4'),0),/distribuição/);
throws(()=>priority([2,10],3,2,'preemptive'),/equilíbrio/);
throws(()=>priority([0,1],3,1,'nonpreemptive'),/positivas/);
throws(()=>priority([1],3,0,'nonpreemptive'),/servidores/);
throws(()=>engine.priorities({s:2,mu:3,classes:[{lambda:1,variance:0}]}),/um servidor/);
throws(()=>engine.priorities({s:1,mu:3,discipline:'preemptive',classes:[{lambda:1,variance:0}]}),/sem interrupção/);
console.log(`${checks} verificações adicionais passaram: ${fixtures.length} cenários dos materiais, probabilidades, inferências, custos e prioridades.`);
