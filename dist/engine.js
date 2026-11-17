/* Rates use the selected time unit. N denotes a finite source population. */
(function(root){
function calculate({model,lambda,mu,s=1,K=10,N=10,cv=1}){
 if(!Number.isFinite(lambda)||lambda<=0||!Number.isFinite(mu)||mu<=0)throw Error('As taxas de chegada e atendimento devem ser maiores que zero.');
 if(!Number.isInteger(s)||s<1||s>1000)throw Error('Informe de 1 a 1.000 servidores.');
 if(!model.includes('s'))s=1;
 const finite=model.endsWith('K'), source=model.endsWith('N'),a=lambda/mu,rho=a/s;
 if(!finite&&!source&&rho>=1)throw Error('Sem equilíbrio: λ precisa ser menor que s × μ. Reduza as chegadas ou aumente a capacidade de atendimento.');
 if(model==='MG1'){
 if(!Number.isFinite(cv)||cv<0)throw Error('O coeficiente de variação deve ser maior ou igual a zero.');
 const Lq=rho*rho*(1+cv*cv)/(2*(1-rho));return {lambda,mu,s,rho,Lq,L:Lq+rho,Wq:Lq/lambda,W:Lq/lambda+1/mu,p0:1-rho,effective:lambda,busy:rho,block:null,wait:rho,probs:null,method:'Pollaczek–Khinchine: Lq = ρ²(1 + CV²) / [2(1 − ρ)]; Wq = Lq/λ; W = Wq + 1/μ; L = λW.'};
 }
 let probs,L,Lq,busy,p0,block=null,effective= lambda,wait;
 if(finite||source){
 const cap=finite?K:N;
 if(!Number.isInteger(cap)||cap<1||cap>10000)throw Error('K e N devem ser inteiros entre 1 e 10.000.');
 const logs=[0];for(let n=1;n<=cap;n++)logs[n]=logs[n-1]+Math.log((source?(N-n+1)*lambda:lambda)/(Math.min(n,s)*mu));
 const max=Math.max(...logs),weights=logs.map(x=>Math.exp(x-max)),sum=weights.reduce((x,y)=>x+y,0);probs=weights.map(x=>x/sum);
 p0=probs[0];L=probs.reduce((v,p,n)=>v+n*p,0);Lq=probs.reduce((v,p,n)=>v+Math.max(n-s,0)*p,0);busy=L-Lq;
 effective=source?mu*busy:lambda*(1-probs[cap]);block=finite?probs[cap]:null;
 if(effective<=0)throw Error('Parâmetros extremos: a precisão numérica é insuficiente. Use valores menos extremos.');
 wait=probs.reduce((v,p,n)=>v+(n>=s&&n<cap?p*(source?(N-n)*lambda:lambda):0),0)/effective;
 }else{
 // Erlang B recursion avoids factorial overflow; derive Erlang C.
 let B=1;for(let n=1;n<=s;n++)B=a*B/(n+a*B);
 wait=B/(1-rho+rho*B);Lq=wait*rho/(1-rho);L=Lq+a;busy=a;
 let logterm=0,terms=[0];for(let n=1;n<=s;n++){logterm+=Math.log(a/n);terms.push(logterm);}
 terms[s]-=Math.log1p(-rho);const max=Math.max(...terms);p0=Math.exp(-max)/terms.reduce((v,t)=>v+Math.exp(t-max),0);
 probs=Array.from({length:Math.min(s+25,150)},(_,n)=>{let log=0;for(let i=1;i<=n;i++)log+=Math.log(a/Math.min(i,s));return Math.exp(Math.log(p0)+log);});
 }
 return {lambda,mu,s,rho:busy/s,L,Lq,W:L/effective,Wq:Lq/effective,p0,effective,busy,block,wait,probs,method:source?'População finita: λn = (N − n)λ; μn = min(n,s)μ. pn ∝ ∏(λi−1/μi); λef = μ × servidores ocupados. W = L/λef; Wq = Lq/λef.':finite?'Capacidade finita: λn = λ para n < K e zero em K; μn = min(n,s)μ. pn ∝ ∏(λi−1/μi); λef = λ(1 − pK). W = L/λef; Wq = Lq/λef.':'Erlang C: P(espera) = B / (1 − ρ + ρB), com B de Erlang B. Lq = P(espera)ρ/(1 − ρ); Wq = Lq/λ; W = Wq + 1/μ; L = λW.'};
}
function inverse(mode,x,y){
 if(!(x>0&&y>0))throw Error('Informe dois valores positivos.');
 let lambda,mu;
 if(mode==='lambdaW'){lambda=x;mu=x+1/y;}
 if(mode==='muRho'){if(y>=1)throw Error('ρ deve estar entre 0 e 1.');mu=x;lambda=x*y;}
 if(mode==='lambdaRho'){if(y>=1)throw Error('ρ deve estar entre 0 e 1.');lambda=x;mu=x/y;}
 if(mode==='lambdaL'){lambda=x;mu=x*(1+1/y);}
 if(mode==='lambdaWq'){lambda=x;mu=(x+Math.sqrt(x*x+4*x/y))/2;}
 if(mode==='lambdaLq'){lambda=x;const rho=(Math.sqrt(y*y+4*y)-y)/2;mu=x/rho;}
 if(mode==='LW'){lambda=x/y;mu=lambda+1/y;}
 if(mode==='LqWq'){lambda=x/y;mu=(lambda+Math.sqrt(lambda*lambda+4*lambda/y))/2;}
 if(mode==='WWq'){if(x<=y)throw Error('W deve ser maior que Wq.');mu=1/(x-y);lambda=mu-1/x;}
 return {lambda,mu};
}
function probability(r,n){
 if(!Number.isInteger(n)||n<0||n>100000)throw Error('Use um inteiro de 0 a 100.000.');
 if(!r.probs)throw Error('Este modelo não determina P(n) apenas com média e variância.');
 if(r.block!==null||r.method.startsWith('População finita'))return r.probs[n]||0;
 if(n>=r.s)return r.wait*(1-r.rho)*Math.pow(r.rho,n-r.s);
 let log=Math.log(r.p0);for(let i=1;i<=n;i++)log+=Math.log(r.lambda/(Math.min(i,r.s)*r.mu));
 return Math.exp(log);
}
function countProbability(r,threshold,relation='gt',scope='system'){
 if(!Number.isInteger(threshold)||threshold<0||threshold>100000)throw Error('Use um limite inteiro de 0 a 100.000.');
 if(!['gt','ge','lt','le','eq'].includes(relation)||!['system','queue'].includes(scope))throw Error('Selecione uma comparação e uma população válidas.');
 if(!r.probs)throw Error('Este modelo não determina a distribuição de clientes.');
 const offset=scope==='queue'?r.s:0;
 const greater=n=>{
  if(n<0)return 1;
  if(r.block!==null||r.method.startsWith('População finita'))return r.probs.slice(n+1).reduce((a,b)=>a+b,0);
  if(n>=r.s-1)return r.wait*Math.pow(r.rho,n+1-r.s);
  let sum=0;for(let i=0;i<=n;i++)sum+=probability(r,i);return Math.max(0,1-sum);
 };
 const gt=greater(threshold+offset),ge=threshold===0?1:greater(threshold-1+offset);
 let exact;
 if(relation==='eq'){
  const n=threshold+offset;
  exact=scope==='queue'&&threshold===0?1-gt:r.block!==null||r.method.startsWith('População finita')?(r.probs[n]||0):n>=r.s?r.wait*(1-r.rho)*Math.pow(r.rho,n-r.s):probability(r,n);
 }
 const answer={gt,ge,le:1-gt,lt:1-ge,eq:exact}[relation];
 return Math.max(0,Math.min(1,answer));
}
// Potential completions assume continuous service throughout the interval.
function poisson(rate,interval,n){
 if(!Number.isFinite(rate)||rate<=0||!Number.isFinite(interval)||interval<0||!Number.isInteger(n)||n<0||n>100000)throw Error('Use taxa positiva, intervalo ≥ 0 e contagem inteira de 0 a 100.000.');
 const mean=rate*interval;if(!Number.isFinite(mean))throw Error('A média da contagem excede a precisão numérica.');
 if(mean===0)return n===0?1:0;
 let log=-mean+n*Math.log(mean);for(let i=2;i<=n;i++)log-=Math.log(i);return Math.exp(log);
}
function priorities({classes,mu,s=1,discipline='nonpreemptive'}){
 if(!Array.isArray(classes)||classes.length<1||classes.length>20)throw Error('Informe de 1 a 20 classes em ordem de prioridade.');
 if(!['nonpreemptive','preemptive'].includes(discipline))throw Error('Selecione a disciplina de prioridade.');
 if(!Number.isInteger(s)||s<1||s>1000)throw Error('Informe de 1 a 1.000 servidores.');
 const general=classes.some(c=>c.mu!==undefined||c.variance!==undefined);
 if(general&&(s!==1||discipline!=='nonpreemptive'))throw Error('Tempos de atendimento diferentes ou gerais por classe exigem um servidor e prioridade sem interrupção.');
 const input=classes.map(c=>{
  const service=c.mu??mu,variance=c.variance??1/service**2;
  if(!Number.isFinite(c.lambda)||c.lambda<=0||!Number.isFinite(service)||service<=0||!Number.isFinite(variance)||variance<0)throw Error('Informe taxas positivas e variância não negativa em todas as classes.');
  return {lambda:c.lambda,mu:service,variance};
 });
 const lambda=input.reduce((a,c)=>a+c.lambda,0),rho=input.reduce((a,c)=>a+c.lambda/c.mu/s,0);
 if(rho>=1)throw Error('Sem equilíbrio: a carga total precisa ser menor que a capacidade dos servidores.');
 let previous=0,previousL=0;
 const aggregate=general?null:calculate({model:s===1?'MM1':'MMs',lambda,mu,s});
 const residual=general?input.reduce((a,c)=>a+c.lambda*(c.variance+1/c.mu**2)/2,0):aggregate.wait/(s*mu);
 const results=input.map((c,i)=>{
  const cumulative=previous+c.lambda/c.mu/s;let Wq;
  if(discipline==='preemptive'){
   const prefix=lambda*(cumulative/rho),total=calculate({model:s===1?'MM1':'MMs',lambda:prefix,mu,s});
   Wq=(total.L-previousL)/c.lambda-1/mu;previousL=total.L;
  }else Wq=residual/((1-previous)*(1-cumulative));
  previous=cumulative;Wq=Math.max(0,Wq);const W=Wq+1/c.mu;
  return {...c,priority:i+1,rho:c.lambda/c.mu/s,Wq,W,Lq:c.lambda*Wq,L:c.lambda*W};
 });
 const L=results.reduce((a,c)=>a+c.L,0),Lq=results.reduce((a,c)=>a+c.Lq,0);
 return {classes:results,lambda,s,rho,L,Lq,W:L/lambda,Wq:Lq/lambda,busy:rho*s,p0:aggregate?.p0??1-rho,discipline,general};
}
function tails(r,t,threshold){
 if(!Number.isFinite(t)||t<0||!Number.isInteger(threshold)||threshold<0)throw Error('Use tempo ≥ 0 e um limite inteiro de clientes ≥ 0.');
 const d=r.s*r.mu-r.lambda, C=r.wait, em=Math.exp(-r.mu*t),ed=Math.exp(-d*t);
 const system=Math.abs(d-r.mu)<1e-9*r.mu?em*(1+C*r.mu*t):em+C*r.mu*(em-ed)/(d-r.mu);
 let log=Math.log(r.p0),tail;
 if(threshold>=r.s-1){for(let i=1;i<=r.s;i++)log+=Math.log(r.lambda/(i*r.mu));tail=Math.exp(log+(threshold+1-r.s)*Math.log(r.rho))/(1-r.rho);}
 else {let sum=r.p0;for(let n=1;n<=threshold;n++){log+=Math.log(r.lambda/(n*r.mu));sum+=Math.exp(log);}tail=1-sum;}
 return {system:Math.max(0,Math.min(1,system)),queue:C*ed,count:Math.max(0,Math.min(1,tail))};
}
root.QueueEngine={calculate,inverse,tails,probability,countProbability,poisson,priorities};if(typeof module!=='undefined')module.exports=root.QueueEngine;
})(globalThis);
