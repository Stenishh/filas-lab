const assert=require('node:assert/strict');
require('./dist/engine');const {solve}=require('./dist/solver');
let checks=0;
function near(actual,expected,tolerance=1e-10){assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);checks++;}
const get=(config,data)=>{const answer=solve(config,data);assert.equal(answer.kind,'complete');checks++;return answer.result;};
// Slide 29: 6 clientes / 5 minutos e atendimento médio de 40 segundos.
const posto=get({model:'MM1'},{lambda:6/5,mu:60/40});
near(posto.lambda,1.2);near(posto.mu,1.5);near(posto.rho,.8);
// Slides 41–42: tabela transcrita em ordem de mês, taxa de ocupação de 88%.
const damaged=[9,8,11,10,8,11,13,13,12,12,9,12,11,13,10,13,10,12,11,12,11,12,11,13,9,11,13,10,10,10];
const counts=damaged.reduce((a,n)=>(a[n]=(a[n]||0)+1,a),{});
assert.deepEqual(counts,{8:2,9:3,10:6,11:7,12:6,13:6});checks++;
near(damaged.reduce((a,b)=>a+b,0),330);near(damaged.reduce((a,b)=>a+b,0)/damaged.length,11);
const motors=get({model:'MM1'},{lambda:11,rho:.88});
near(motors.mu,12.5);near(motors.L,22/3);near(motors.Lq,484/75);near(motors.W,2/3);near(motors.Wq,44/75);near(motors.p0,.12);near(motors.rho,.88);
near(QueueEngine.tails(motors,1,0).system,Math.exp(-1.5));near(QueueEngine.tails(motors,1,0).queue,.88*Math.exp(-1.5));
// A conversão em dias exige uma convenção explícita: 30 dias/mês.
const motorDays=get({model:'MM1'},{lambda:11/30,rho:.88});near(motorDays.W,20);near(motorDays.Wq,17.6);near(QueueEngine.tails(motorDays,1,0).system,Math.exp(-.05));
// Slide 43, barbearia: gabaritos publicados L=3, Lq=2.25, W=1h, Wq=45min.
const barber=get({model:'MM1'},{lambda:60/20,mu:60/15});
near(barber.p0,.25);near(barber.L,3);near(barber.Lq,2.25);near(barber.W,1);near(barber.Wq*60,45);
near(QueueEngine.tails(barber,1,0).queue,.75*Math.exp(-1));near(QueueEngine.tails(barber,1,0).system,Math.exp(-1));
near(get({model:'MM1'},{mu:4,W:1.25}).lambda,3.2);
// Slide 49, dois canais: resultados calculados independentemente por Erlang C.
const two=get({model:'MMs',s:2},{lambda:30,mu:20});
near(two.p0,1/7);near(two.wait,9/14);near(two.Lq,27/14);near(two.Wq,9/140);near(two.L,24/7);near(two.W,4/35);
near(QueueEngine.tails(two,12/60,0).system,(9/7)*Math.exp(-2)-(2/7)*Math.exp(-4));near(QueueEngine.tails(two,6/60,0).queue,(9/14)*Math.exp(-1));near(two.probs[3],27/224);
// Slide 50, agência: um caixa original + dois novos = três caixas.
const bank=get({model:'MMs',s:3},{lambda:.6,mu:1/2});
for(const [actual,published,tolerance] of [[bank.rho,.4,1e-12],[bank.L,1.29,.005],[bank.Lq,.094,.0005],[bank.p0,.294,.0005],[bank.Wq,.157,.0005],[bank.W,2.16,.005],[QueueEngine.tails(bank,3,0).system,.2506,.00005],[QueueEngine.tails(bank,2,0).queue,.0233,.00005]])near(actual,published,tolerance);
// Divergência documentada do gabarito: 0.0091 no PDF; fórmula dá 0.009035294...
const exactTail=(12/85)*(.4**3);near(QueueEngine.tails(bank,1,5).count,exactTail);
assert.notEqual(exactTail.toFixed(4),'0.0091');checks++;
// Formulário, página 2: atendimento exponencial e constante são casos de M/G/1.
const mg=get({model:'MG1'},{lambda:3,mu:4,second:2/4**2});near(mg.Lq,barber.Lq);near(mg.Wq,barber.Wq);
const md=get({model:'MG1'},{lambda:3,mu:4,variance:0});near(md.Lq,.75**2/(2*(1-.75)));near(md.Wq,md.Lq/3);
console.log(`${checks} verificações dos exemplos dos PDFs passaram. Divergência registrada: slide 50, P(n>5) = ${exactTail}, gabarito 0.0091.`);
