const assert=require('node:assert/strict');const {extract}=require('./dist/statement-data');let checks=0;
function near(a,b){assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;}
function check(text,model,expected,unit='hora'){
 const r=extract(text,model,unit);
 for(const [field,n] of Object.entries(expected)){const c=r.suggestions.find(c=>c.field===field);assert.ok(c,`${field} ausente: ${JSON.stringify(r)}`);checks++;if(typeof n==='number')near(c.value,n);else{assert.equal(c.value,n);checks++;}}
 return r;
}
check('Clientes chegam a uma barbearia com tempo médio entre chegadas de 20 minutos. O barbeiro gasta em média 15 minutos com cada cliente.','MM1',{lambda:3,mu:4});
check('Caminhões chegam a uma taxa de 3 caminhões por hora. O tempo de atendimento é exponencial com média de 15 minutos.','MM1',{lambda:3,mu:4});
check('Aviões chegam a cada 4 minutos. Há duas pistas. Apenas 3 aviões podem permanecer em espera. O tempo para pousar tem média de 3 minutos.','MMsK',{lambda:15,mu:20,s:2,cap:5});
check('A empresa possui 10 máquinas. Cada máquina trabalha em média 100 horas antes de quebrar. O tempo de reparo tem média de 8 horas.','MM1N',{lambda:.01,mu:.125,cap:10});
check('s = 2; μ = 5/h; λ1 = 0,6/h; λ2 = 1,4/h; λ3 = 2/h.','PRIORITY',{'pr-count':3,s:2,'pr-mu':5,'pr-lambda-0':.6,'pr-lambda-1':1.4,'pr-lambda-2':2});
check('Clientes chegam a uma taxa de 25 por hora. Para servir um cliente, a máquina precisa exatamente 90 segundos.','MG1',{lambda:25,mu:40,'mg-service':'constant'});
check('Clientes chegam a uma taxa de 25 por hora. O tempo para atender tem distribuição exponencial com média de 90 segundos.','MG1',{lambda:25,mu:40,'mg-service':'exponential'});
check('lambda = 3/h; mu = 4/h.','MM1',{lambda:.05,mu:1/15},'minuto');
check('Chegam 6 clientes a cada 5 minutos. Atendimento médio de 40 segundos.','MM1',{lambda:72,mu:90});
check('Tempo médio de espera na fila de 15 minutos. Ocupação do sistema de 80%.','MM1',{rho:80,Wq:15});
check('Capacidade limitada de 5. λ = 4/h; μ = 6/h; s = 2.','MMsK',{lambda:4,mu:6,s:2,cap:5});
check('Capacidade total de 5. λ = 4/h; μ = 6/h; s = 2.','MMsK',{lambda:4,mu:6,s:2,cap:5});
check('A fábrica utiliza cinco robôs. Cada robô quebra a cada 30 horas. O tempo de reparo tem média de 3 horas.','MMsN',{lambda:1/30,mu:1/3,cap:5});
check('Atendimento tem média de 4 minutos. O desvio padrão de 2 minutos.','MG1',{mu:15,sd:2});
for(const q of ['Qual a probabilidade de um cliente esperar 12 minutos para ser atendido?','Tempo médio de espera na fila de 15 minutos.','Tempo médio no sistema de 30 minutos.']){assert.ok(!extract(q,'MM1').suggestions.some(c=>c.field==='mu'));checks++;}
let r=extract('λ = 3/h. λ = 5/h. μ = 6/h.','MM1');assert.ok(!r.suggestions.some(c=>c.field==='lambda'));assert.ok(r.warnings.some(w=>w.includes('cenários')));checks+=2;
r=extract('Clientes chegam a uma taxa de 3 por hora.','MM1N');assert.ok(!r.suggestions.some(c=>c.field==='lambda'));checks++;
r=extract('Dois caixas atendem 20 clientes por hora.','MMs');assert.ok(!r.suggestions.some(c=>c.field==='mu'));checks++;
r=extract('Chegadas de Poisson com taxa de 3 por hora. Atendimento médio de 15 minutos.','MG1');assert.ok(!r.suggestions.some(c=>c.field==='mg-service'));checks++;
r=extract('Qual a probabilidade de no máximo 3 clientes no sistema?','MMsK');assert.ok(!r.suggestions.some(c=>c.field==='cap'));checks++;
r=extract('O tempo entre chegadas é exponencial com média de 5 minutos. Tempo de atendimento médio de 4 minutos.','MG1');assert.ok(!r.suggestions.some(c=>c.field==='mg-service'));checks++;
assert.deepEqual(extract('','MM1').suggestions,[]);checks++;
console.log(`${checks} verificações da leitura de enunciados passaram.`);
