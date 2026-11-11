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
function tails(r,t,threshold){
 if(!Number.isFinite(t)||t<0||!Number.isInteger(threshold)||threshold<0)throw Error('Use tempo ≥ 0 e um limite inteiro de clientes ≥ 0.');
 const d=r.s*r.mu-r.lambda, C=r.wait, em=Math.exp(-r.mu*t),ed=Math.exp(-d*t);
 const system=Math.abs(d-r.mu)<1e-9*r.mu?em*(1+C*r.mu*t):em+C*r.mu*(em-ed)/(d-r.mu);
 let log=Math.log(r.p0),tail;
 if(threshold>=r.s-1){for(let i=1;i<=r.s;i++)log+=Math.log(r.lambda/(i*r.mu));tail=Math.exp(log+(threshold+1-r.s)*Math.log(r.rho))/(1-r.rho);}
 else {let sum=r.p0;for(let n=1;n<=threshold;n++){log+=Math.log(r.lambda/(n*r.mu));sum+=Math.exp(log);}tail=1-sum;}
 return {system:Math.max(0,Math.min(1,system)),queue:C*ed,count:Math.max(0,Math.min(1,tail))};
}
root.QueueEngine={calculate,inverse,tails};if(typeof module!=='undefined')module.exports=root.QueueEngine;
})(globalThis);
