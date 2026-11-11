/* Infer from independent observations. Never assign a default to an unknown. */
(function(root){
const powers={lambda:1,mu:1,effective:1,W:-1,Wq:-1,L:0,Lq:0,rho:0,p0:0,load:0,busy:0,block:0,wait:0,U:0};
const names={lambda:'λ',mu:'μ',effective:'λef',W:'W',Wq:'Wq',L:'L',Lq:'Lq',rho:'ocupação por servidor',p0:'P₀',load:'λ/μ',busy:'E(S)',block:'Pbloqueio',wait:'Pespera',U:'U',cv:'CV',sd:'σ',variance:'σ²',second:'E[ts²]'};
function enrich(r,cv){return {...r,load:r.lambda/r.mu,U:1-r.p0,cv,sd:cv/r.mu,variance:cv*cv/r.mu**2,second:(1+cv*cv)/r.mu**2};}
function solve(config,observed){
 const k={...observed}, supplied={...observed},steps=[];
 const multi=config.model.includes('s'), finite=/[KN]$/.test(config.model), mg=config.model==='MG1',s=multi?config.s:1;
 if(multi&&(!Number.isInteger(s)||s<2||s>1000))throw Error('Informe o número de servidores s, um inteiro de 2 a 1.000.');
 if(finite){let cap=config.model.endsWith('K')?config.K:config.N;if(!Number.isInteger(cap)||cap<1||cap>10000)throw Error('Informe '+(config.model.endsWith('K')?'a capacidade total K':'a população N')+', um inteiro de 1 a 10.000.');}
 for(const [key,n] of Object.entries(k)){
 if(!Number.isFinite(n)||n<0)throw Error('O campo '+(names[key]||key)+' deve ser um número não negativo.');
 if(['lambda','mu','effective','W','L','load'].includes(key)&&n===0)throw Error('O campo '+names[key]+' deve ser maior que zero.');
 if(['rho','p0','U','wait','block'].includes(key)&&n>1)throw Error('Probabilidades e ocupação devem ficar entre 0% e 100%.');
 }
 const has=key=>k[key]!==undefined;
 function set(key,n,why){
 if(!Number.isFinite(n))return false;
 if(n < -1e-7)throw Error('Dados incompatíveis: a relação entre os valores fornecidos produziria '+(names[key]||key)+' negativo. Confira os valores e as unidades.');
 n=Math.max(0,n);
 if(has(key)){
 const tolerance=1e-7+.005*Math.max(Math.abs(n),Math.abs(k[key]));
 if(Math.abs(k[key]-n)>tolerance)throw Error('Dados incompatíveis: confira '+(names[key]||key)+'. As informações preenchidas não satisfazem as relações do modelo (tolerância de 0,5% para arredondamentos).');
 return false;
 }
 k[key]=n;if(why)steps.push(why);return true;
 }
 function propagate(){
 for(let pass=0;pass<12;pass++){
 const before=Object.keys(k).length;
 for(const [qty,t] of [['L','W'],['Lq','Wq']]){
 if(has(qty)&&has(t)&&k[t]>0)set('effective',k[qty]/k[t],'Lei de Little: λef = '+qty+'/'+t+'.');
 if(has('effective')&&has(t))set(qty,k.effective*k[t]);
 if(has(qty)&&has('effective')&&k.effective>0)set(t,k[qty]/k.effective);
 }
 if(!finite){if(has('lambda'))set('effective',k.lambda);if(has('effective'))set('lambda',k.effective);}
 if(has('W')&&has('Wq')&&k.W>k.Wq)set('mu',1/(k.W-k.Wq),'Tempo de atendimento: μ = 1/(W − Wq).');
 if(has('W')&&has('mu'))set('Wq',k.W-1/k.mu);
 if(has('Wq')&&has('mu'))set('W',k.Wq+1/k.mu);
 if(has('U'))set('p0',1-k.U);if(has('p0'))set('U',1-k.p0);
 if(has('rho'))set('busy',s*k.rho);if(has('busy'))set('rho',k.busy/s);
 if(has('L')&&has('Lq'))set('busy',k.L-k.Lq);
 if(has('busy')&&has('L'))set('Lq',k.L-k.busy);
 if(has('busy')&&has('Lq'))set('L',k.Lq+k.busy);
 if(has('effective')&&has('mu'))set('busy',k.effective/k.mu);
 if(has('effective')&&has('busy')&&k.busy>0)set('mu',k.effective/k.busy);
 if(has('busy')&&has('mu'))set('effective',k.busy*k.mu);
 if(has('lambda')&&has('mu'))set('load',k.lambda/k.mu);
 if(!finite){if(has('load'))set('rho',k.load/s);if(has('rho'))set('load',s*k.rho);}
 if(has('load')&&has('lambda')&&k.load>0)set('mu',k.lambda/k.load);
 if(has('load')&&has('mu'))set('lambda',k.load*k.mu);
 if(mg){
 if(has('p0'))set('rho',1-k.p0);if(has('wait'))set('rho',k.wait);
 if(has('rho')){set('p0',1-k.rho);set('wait',k.rho);}
 if(has('mu')){if(has('sd'))set('cv',k.sd*k.mu);if(has('variance'))set('cv',Math.sqrt(k.variance)*k.mu);if(has('second')){let sq=k.second*k.mu*k.mu-1;if(sq>=-1e-8)set('cv',Math.sqrt(Math.max(0,sq)));}}
 if(has('rho')&&has('Lq')&&k.rho>0&&k.rho<1){const sq=2*k.Lq*(1-k.rho)/(k.rho*k.rho)-1;if(sq>=-1e-8)set('cv',Math.sqrt(Math.max(0,sq)),'Variabilidade inferida pela fórmula de Pollaczek–Khinchine.');}
 if(has('rho')&&has('cv')&&k.rho<1)set('Lq',k.rho*k.rho*(1+k.cv*k.cv)/(2*(1-k.rho)));
 }
 if(Object.keys(k).length===before)break;
 }
 }
 propagate();
 if(!finite&&has('load')&&k.load>=s)throw Error('Sem equilíbrio: λ precisa ser menor que s × μ.');
 if(has('W')&&has('Wq')&&k.W<=k.Wq)throw Error('Dados incompatíveis: W deve ser maior que Wq, pois inclui o atendimento.');
 if(has('L')&&has('Lq')&&k.L<=k.Lq)throw Error('Dados incompatíveis: L deve ser maior que Lq, pois inclui os clientes em atendimento.');
 if(has('p0')&&(k.p0<=0||k.p0>=1))throw Error('Com taxas positivas e finitas, P₀ deve estar entre 0% e 100%, sem incluir os extremos.');
 if(has('rho')&&(k.rho<=0||k.rho>=1))throw Error('A ocupação média por servidor deve estar entre 0% e 100%, sem incluir os extremos.');
 if(finite){const cap=config.model.endsWith('K')?config.K:config.N;if((has('L')&&k.L>cap)||(has('Lq')&&k.Lq>Math.max(cap-s,0))||(has('busy')&&k.busy>Math.min(s,cap)))throw Error('Dados incompatíveis com o limite de clientes ou de servidores do sistema.');}
 if(mg&&has('lambda')&&has('mu')){
 const rho=k.lambda/k.mu,minLq=rho*rho/(2*(1-rho));
 if((has('Lq')&&k.Lq<minLq-1e-7)||(has('second')&&k.second<1/k.mu**2-1e-10))throw Error('Dados incompatíveis: a variância do atendimento não pode ser negativa. Confira Lq, Wq ou E[ts²].');
 }
 // In M/G/1 an absolute variance or second moment also permits inverse solving.
 if(mg&&!has('cv')&&(has('sd')||has('variance')||has('second'))){
 const second=mu=>has('second')?k.second:(has('variance')?k.variance:k.sd*k.sd)+1/mu**2;
 if(has('mu')&&has('Wq')){set('lambda',2*k.Wq/(second(k.mu)+2*k.Wq/k.mu),'λ inferida pela fórmula de Pollaczek–Khinchine.');propagate();}
 if(has('lambda')&&(has('W')||has('Wq'))&&!has('mu')){
 const key=has('Wq')?'Wq':'W',target=k[key],lambda=k.lambda;
 let lo=lambda*(1+1e-10);if(has('second'))lo=Math.max(lo,1/Math.sqrt(k.second));
 const predict=mu=>lambda*second(mu)/(2*(1-lambda/mu))+(key==='W'?1/mu:0);
 let hi=Math.max(lo*2,1);for(let j=0;j<80&&predict(hi)>target;j++)hi*=2;
 if(target>0&&predict(lo)>=target&&predict(hi)<=target){for(let j=0;j<80;j++){const mid=Math.sqrt(lo*hi);if(predict(mid)>target)lo=mid;else hi=mid;}set('mu',Math.sqrt(lo*hi),'μ inferida a partir da variabilidade e do tempo médio, por Pollaczek–Khinchine.');propagate();}
 }
 }
 function check(values){
 const conflicts=[];for(const [key,v] of Object.entries(supplied)){if(values[key]===undefined||values[key]===null)continue;const actual=values[key],tol=1e-7+0.005*Math.max(Math.abs(v),Math.abs(actual));if(Math.abs(actual-v)>tol)conflicts.push(names[key]||key);}
 if(conflicts.length)throw Error('Dados incompatíveis com o modelo: confira '+conflicts.join(', ')+'. A tolerância para valores arredondados é de 0,5%. Apague os dados incertos ou corrija os valores.');
 }
 function finish(){
 const cv=mg?k.cv:1;
 if(has('lambda')&&has('mu')&&(!mg||cv!==undefined)){
 const r=enrich(root.QueueEngine.calculate({...config,lambda:k.lambda,mu:k.mu,cv}),cv);check(r);return {kind:'complete',values:r,result:r,steps};
 }
 }
 let done=finish();if(done)return done;
 // Scale invariance: r(a, μ) = r(a,1) μ^power, a=λ/μ.
 // A dimensionless datum or a ratio/product of dimensionful data identifies a.
 if(!mg||has('cv')){
 const cv=mg?k.cv:1, entries=Object.keys(k).filter(key=>powers[key]!==undefined);
 const dims=entries.filter(key=>powers[key]===0),rates=entries.filter(key=>powers[key]!==0&&k[key]>0);
 const equations=dims.map(key=>({keys:[key],target:k[key],predict:r=>r[key]}));
 for(let i=0;i<rates.length;i++)for(let j=i+1;j<rates.length;j++){
 const x=rates[i],y=rates[j];equations.push({keys:[x,y],target:Math.log(k[x])/powers[x]-Math.log(k[y])/powers[y],predict:r=>r[x]>0&&r[y]>0?Math.log(r[x])/powers[x]-Math.log(r[y])/powers[y]:NaN});
 }
 const high=finite?18:Math.log(s*(1-1e-9)),low=-18, cache=new Map();
 function forward(loga){if(!cache.has(loga)){try{cache.set(loga,enrich(root.QueueEngine.calculate({...config,lambda:Math.exp(loga),mu:1,cv}),cv));}catch{cache.set(loga,null);}}return cache.get(loga);}
 let shape,unmatched=false;
 for(const eq of equations){
 let prev,rootLog,loY=Infinity,hiY=-Infinity,brackets=[];
 for(let i=0;i<=90;i++){const x=low+(high-low)*i/90,r=forward(x);if(!r)continue;const predicted=eq.predict(r),y=predicted-eq.target;if(!Number.isFinite(y))continue;loY=Math.min(loY,predicted);hiY=Math.max(hiY,predicted);if(y===0)rootLog=x;if(prev&&y*prev.y<0)brackets.push([prev.x,x]);prev={x,y};}
 if(hiY-loY<1e-8){if(Number.isFinite(loY)&&Math.abs(loY-eq.target)>1e-7+.005*Math.max(Math.abs(loY),Math.abs(eq.target)))throw Error('Dados incompatíveis: confira '+eq.keys.map(key=>names[key]).join(' e ')+'. Essas medidas não satisfazem as equações do modelo.');continue;}
 if(brackets.length>1)continue; // Do not choose arbitrarily between multiple roots.
 if(brackets.length){let [lo,hi]=brackets[0],yl=eq.predict(forward(lo))-eq.target;for(let j=0;j<65;j++){const mid=(lo+hi)/2,ym=eq.predict(forward(mid))-eq.target;if(ym*yl>0){lo=mid;yl=ym;}else hi=mid;}rootLog=(lo+hi)/2;}
 if(rootLog!==undefined){shape=forward(rootLog);steps.push('Parâmetros inferidos a partir de '+eq.keys.map(key=>names[key]).join(' e ')+', usando as equações do modelo.');break;}else unmatched=true;
 }
 if(shape){
 const scaleKey=rates.find(key=>shape[key]>0);
 if(scaleKey){const mu=Math.pow(k[scaleKey]/shape[scaleKey],1/powers[scaleKey]);set('mu',mu);set('lambda',shape.load*mu);propagate();done=finish();if(done)return done;}
 const vals={};for(const key of Object.keys(powers))if(powers[key]===0&&shape[key]!==null)vals[key]=shape[key];check(vals);return {kind:'partial',values:{...k,...vals},steps,message:'Já foi possível calcular as medidas sem unidade de tempo. Informe uma taxa (λ ou μ) ou um tempo médio (W ou Wq) para calcular os tempos e as taxas.'};
 }
 if(unmatched)throw Error('Não foi encontrada uma solução válida para os dados preenchidos. Confira as unidades, os limites do sistema e os valores arredondados; parâmetros extremos podem exceder a precisão numérica.');
 }
 check(k);
 const message=mg&&!has('cv')?'Para completar M/G/1, informe dados que determinem as chegadas, o atendimento e a variabilidade: por exemplo λ, μ e CV (ou σ, σ², E[ts²]); a variabilidade também pode ser inferida se houver Wq ou Lq suficiente.':'Ainda faltam dados independentes. Por exemplo: λ e μ; λ e W; μ e ocupação; ou L e W. Duas taxas equivalentes (λ e 1/TMC) não contam como dois dados independentes.';
 return {kind:'partial',values:k,steps,message};
}
root.QueueSolver={solve,names};if(typeof module!=='undefined')module.exports=root.QueueSolver;
})(globalThis);
