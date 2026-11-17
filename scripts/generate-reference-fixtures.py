"""Regenerate fixed reference values with exact rational arithmetic.

Independent oracle for the locally supplied exercise sheets. Run from repo root:
python3 scripts/generate-reference-fixtures.py

Times/rates follow each exercise; finite capacities include service positions.
The generated data validates formulas, not every printed answer. See VALIDACAO-PDFS.md.
"""
from fractions import Fraction as F
from math import factorial
from pathlib import Path
import json
cases=[]
def model(model,la,mu,s=1,K=None,N=None,variance=None):
 la,mu=F(str(la)),F(str(mu));a=la/mu
 if K is not None or N is not None:
  cap=K if K is not None else N
  weights=[F(1)]
  for n in range(1,cap+1):weights.append(weights[-1]*la*(N-n+1 if N is not None else 1)/(min(n,s)*mu))
  probs=[v/sum(weights) for v in weights];L=sum(n*p for n,p in enumerate(probs));Lq=sum(max(n-s,0)*p for n,p in enumerate(probs));busy=L-Lq
  eff=mu*busy;p0=probs[0];wait=sum(p*(N-n if N is not None else 1)*la for n,p in enumerate(probs) if n>=s and n<cap)/eff
  block=probs[-1] if K is not None else None
 elif variance is not None:
  rho=a;p0=1-rho;Lq=(la*la*F(str(variance))+rho*rho)/(2*(1-rho));L=Lq+rho;eff=la;busy=a;wait=a;probs=None;block=None
 else:
  rho=a/s;p0=1/(sum(a**n/factorial(n) for n in range(s))+a**s/factorial(s)/(1-rho));wait=a**s/factorial(s)/(1-rho)*p0;Lq=wait*rho/(1-rho);L=Lq+a;busy=a;eff=la;block=None
  probs=[p0*a**n/(factorial(n) if n<=s else factorial(s)*s**(n-s)) for n in range(12)]
 r=dict(p0=p0,L=L,Lq=Lq,W=L/eff,Wq=Lq/eff,rho=busy/s,effective=eff,busy=busy,wait=wait)
 if block is not None:r['block']=block
 if N is not None:r['operating']=N-L;r['availability']=1-L/N
 return r,probs

def add(source,exercise,mod,la,mu,s=1,K=None,N=None,variance=None):
 config=dict(model=mod)
 if 's' in mod:config['s']=s
 if K is not None:config['K']=K
 if N is not None:config['N']=N
 data=dict(lambda_=float(F(str(la))),mu=float(F(str(mu))))
 data['lambda']=data.pop('lambda_')
 if variance is not None:data['variance']=float(F(str(variance)))
 r,probs=model(mod,la,mu,s,K,N,variance)
 cases.append(dict(source=source,exercise=exercise,config=config,data=data,expected={k:float(v) for k,v in r.items()},probabilities=[float(v) for v in probs] if probs else None))

# List of M/M/s exercises, including variants and finite capacity in exercise 10e.
for ex,mod,la,mu,s,K in [
 ('2','MM1','12.8',16,1,None),('3','MM1',8,10,1,None),('4','MM1',1,3,1,None),('5','MM1',3,4,1,None),('6','MM1',4,5,1,None),
 ('7, um médico','MM1',2,3,1,None),('7, dois médicos','MMs',2,3,2,None),('8','MMs',40,30,2,None),('9, atual','MM1',5,7,1,None),('9, proposto','MMs',5,7,2,None),
 ('10, atual','MM1','0.9','1.2',1,None),('10b/c','MM1','0.9','1.4',1,None),('10e','MM1K','0.9','1.2',1,3),('11','MM1',2,4,1,None),('12','MM1',10,15,1,None),
 ('13, atual','MM1',20,30,1,None),('13, proposto','MM1',20,40,1,None),('14a','MM1',10,20,1,None),('14b','MM1',15,20,1,None),('14c','MMs',25,20,2,None),
 ('15a','MMs',2,1,4,None),('15b','MMs',3,1,4,None),('15c','MMs',3,1,5,None)]:add('Lista MMs',ex,mod,la,mu,s,K)
for ex,mod,la,mu,s,K in [('1','MM1K',2,4,1,5),('2','MM1K',1,'4/3',1,4),('3','MM1K','1/4','1/3',1,4),('4','MMsK','1/4','1/3',2,5),('5','MMsK',1,'4/3',2,5),('6, um terminal','MM1K',3,4,1,4),('6, dois terminais','MMsK',3,4,2,5)]:add('Lista MMsK',ex,mod,la,mu,s,K)
for ex,mod,la,mu,s,N in [('1, N=10 explícito','MM1N','1/200','1/10',1,10),('2','MM1N','1/30','3/20',1,6),('3','MM1N','1/10','1/8',1,2),('4, um técnico','MM1N','1/9','1/2',1,3),('4, dois técnicos','MMsN','1/9','1/2',2,3),('5, um mecânico','MM1N','1/10','1/2',1,4),('5, cada grupo de dois','MM1N','1/10','1/2',1,2),('6','MMsN','1/100','1/10',2,4)]:add('Lista MMsN',ex,mod,la,mu,s,N=N)
for sigma in [4,3,2,1,0]:add('Lista MG1 e prioridades',f'1, σ={sigma}','MG1','1/5','1/4',variance=sigma*sigma)
for ex,la,mu,var in [('6, lava-rápido exponencial',4,6,'1/36'),('6, lava-rápido constante',4,6,0),('7, café exponencial',25,40,'1/1600'),('7, café constante',25,40,0)]:add('Teoria MG1, página '+ex.split(',')[0],ex,'MG1',la,mu,variance=var)
for ex,mod,la,mu,s,K,N in [('7','MM1K','3/10','1/2',1,2,None),('8','MM1K',3,4,1,5,None),('13, um atendente, K=5','MM1K',5,7,1,5,None),('13, dois atendentes, K=5','MMsK',5,7,2,5,None),('14','MMsK',1,'1/6',3,7,None),('18','MM1N','1/100','1/8',1,None,10),('19','MM1N','1/30','1/3',1,None,5),('23','MMsN','1/100','1/8',2,None,10),('24','MMsN','1/30','1/3',2,None,5)]:add('Teoria MMsK e MMsN, página '+ex.split(',')[0],ex,mod,la,mu,s,K,N)
Path('fixtures').mkdir(exist_ok=True)
Path('fixtures/exercicios.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2)+'\n')
