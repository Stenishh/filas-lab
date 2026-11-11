const assert=require('node:assert/strict');
require('./dist/engine');const {solve}=require('./dist/solver');
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
for(const model of ['MM1','MMs','MM1K','MMsK','MM1N','MMsN','MG1']){
 const config={model,s:3,K:8,N:8},lambda=model.endsWith('N')?.7:3,mu=4;
 const result=QueueEngine.calculate({...config,lambda,mu,cv:.6});
 const cases=[{lambda,mu},{lambda,W:result.W},{mu,rho:result.rho},{L:result.L,W:result.W},{W:result.W,Wq:result.Wq},{Lq:result.Lq,Wq:result.Wq},{p0:result.p0,W:result.W},{effective:result.effective,Wq:result.Wq}];
 for(const known of cases){if(model==='MG1')known.cv=.6;const r=solve(config,known);assert.equal(r.kind,'complete',`${model} ${JSON.stringify(known)} ${r.message}`);near(r.result.lambda,lambda);near(r.result.mu,mu);near(r.result.L,result.L);}
 const partial=solve(config,{rho:result.rho,...(model==='MG1'?{cv:.6}:{})});assert.equal(partial.kind,'partial');near(partial.values.L,result.L);assert.equal(partial.values.mu,undefined);
 assert.throws(()=>solve(config,{lambda,mu,L:result.L+1,...(model==='MG1'?{cv:.6}:{})}),/incompatíveis/);checks++;
}
for(const known of [{lambda:3,mu:4,Wq:.75},{lambda:3,mu:4,sd:.25},{lambda:3,mu:4,variance:.0625},{lambda:3,mu:4,second:.125},{lambda:3,Wq:.75,sd:.25},{lambda:3,W:1,variance:.0625},{mu:4,Wq:.75,sd:.25},{lambda:3,Wq:.75,second:.125}]){const r=solve({model:'MG1'},known);assert.equal(r.kind,'complete');near(r.result.cv,1);}
const noCV=solve({model:'MG1'},{lambda:3,mu:4});assert.equal(noCV.kind,'partial');assert.equal(noCV.values.cv,undefined);
const deterministic=solve({model:'MG1'},{lambda:3,mu:4,cv:0});near(deterministic.result.Lq,1.125);
assert.equal(solve({model:'MM1'},{lambda:3}).kind,'partial');
assert.equal(solve({model:'MM1K',K:1},{mu:4,W:.25}).kind,'partial');
assert.throws(()=>solve({model:'MM1'},{lambda:4,mu:3}),/equilíbrio/);
assert.throws(()=>solve({model:'MMs'},{lambda:1,mu:2}),/servidores/);
assert.throws(()=>solve({model:'MM1'},{W:1,Wq:2}),/incompatíveis/);
for(const [config,known] of [[{model:'MG1'},{lambda:3,mu:4,p0:.5}],[{model:'MG1'},{lambda:3,mu:4,wait:.5}],[{model:'MM1'},{lambda:3,effective:4}],[{model:'MG1'},{lambda:3,mu:4,Lq:.01}],[{model:'MM1K',K:3},{L:4}]]){assert.throws(()=>solve(config,known),/incompatíveis/);checks++;}
console.log(`${checks} verificações de inferência passaram nos sete modelos.`);
