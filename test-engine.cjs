const assert=require('node:assert/strict');
const {calculate:c,inverse,tails}=require('./dist/engine');
let checks=0;
function near(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);checks++;}
// Apostila, p. 43: interchegadas 20 min e atendimento 15 min.
const barber=c({model:'MM1',lambda:3,mu:4});
near(barber.p0,.25);near(barber.L,3);near(barber.Lq,2.25);near(barber.W,1);near(barber.Wq,.75);
near(tails(barber,1,5).queue,.75*Math.exp(-1));near(tails(barber,1,5).system,Math.exp(-1));near(tails(barber,1,5).count,.75**6);
// Apostila p.49: dois canais, 30 chegadas/h e 20 atendimentos/h/canal.
const multi=c({model:'MMs',lambda:30,mu:20,s:2});
near(multi.p0,1/7);near(multi.Lq,27/14);near(multi.Wq,9/140);
// Equal rates in the convolution: continuous limit must remain finite.
const equal=c({model:'MMs',lambda:20,mu:20,s:2});near(tails(equal,.1,2).system,Math.exp(-2)*(1+equal.wait*2));
// Apostila p.50: three tellers (one original plus two added).
const bank=c({model:'MMs',lambda:.6,mu:.5,s:3});near(bank.rho,.4);near(bank.Lq,.09411764705882353);near(bank.p0,.29411764705882354);near(tails(bank,2,5).queue,(12/85)*Math.exp(-1.8));
// Finite capacity, equal arrival/service rates: uniform distribution.
const uniform=c({model:'MM1K',lambda:1,mu:1,K:4});for(const p of uniform.probs)near(p,.2);near(uniform.L,2);near(uniform.Lq,1.2);near(uniform.effective,.8);
// Finite-source machine repair model: direct birth-death balance.
for(const model of ['MM1K','MMsK','MM1N','MMsN']){
 const r=c({model,lambda:2,mu:3,K:8,N:8,s:3});near(r.probs.reduce((a,b)=>a+b,0),1);near(r.L,r.effective*r.W);near(r.Lq,r.effective*r.Wq);near(r.effective,r.busy*r.mu);
 for(let n=1;n<r.probs.length;n++)near(r.probs[n-1]*(model.endsWith('N')?(8-n+1)*2:2),r.probs[n]*Math.min(n,r.s)*3);
}
// M/G/1 with CV=1 must agree with M/M/1; deterministic service halves Lq.
const mg=c({model:'MG1',lambda:3,mu:4,cv:1});near(mg.wait,.75);near(mg.L,barber.L);near(mg.Wq,barber.Wq);near(c({model:'MG1',lambda:3,mu:4,cv:0}).Lq,barber.Lq/2);
for(const [mode,x,y] of [['lambdaW',3,1],['lambdaRho',3,.75],['muRho',4,.75],['lambdaL',3,3],['lambdaWq',3,.75],['lambdaLq',3,2.25],['LW',3,1],['LqWq',2.25,.75],['WWq',1,.75]]){const r=inverse(mode,x,y);near(r.lambda,3);near(r.mu,4);}
assert.throws(()=>c({model:'MM1',lambda:4,mu:4}));assert.throws(()=>c({model:'MMs',lambda:4,mu:2,s:2}));assert.throws(()=>c({model:'MM1K',lambda:4,mu:2,K:1.5}));checks+=3;
console.log(`${checks} verificações matemáticas passaram, incluindo exemplos da apostila.`);
