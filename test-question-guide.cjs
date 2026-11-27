const assert=require('node:assert/strict');
const {locate}=require('./dist/question-guide');
let checks=0;
const cases=[
 ['Qual a probabilidade de haver 3 clientes no sistema?','MM1','query-n','Número de clientes no sistema · n'],
 ['Numero medio de maquinas em operacao','MM1N','output','N − L'],
 ['Qual a probabilidade de esperar mais de 12 minutos?','MM1','limit','P(Wq > t)'],
 ['Probabilidade de ficar mais de 12 minutos no sistema','MMs','limit','P(W > t)'],
 ['Probabilidade de esperar no máximo 30 minutos na fila','MM1','limit','1 menos'],
 ['Probabilidade de mais de 3 clientes','MM1','count-limit','Mais de (>)'],
 ['No máximo 3 clientes no sistema','MMsK','count-limit','No máximo (≤)'],
 ['Pelo menos 2 aviões aguardando','MMsK','count-limit','Somente aguardando'],
 ['Menos de 6 pessoas no sistema','MM1','count-limit','Menos de (<)'],
 ['Probabilidade de exatamente 3 clientes','MM1','query-n','Número de clientes no sistema · n'],
 ['Tempo médio na fila','MM1','output','Wq'],
 ['Número médio de pacientes no sistema','MMs','output','L'],
 ['Número médio de caminhões na fila','MM1','output','Lq'],
 ['Probabilidade de o sistema estar vazio','MMs','output','P₀'],
 ['Proporção de tempo sem ninguém esperando','MM1','count-limit','Exatamente (=)'],
 ['Taxa de chegada lambda','MM1','lambda','λ'],
 ['Taxa de atendimento por servidor','MM1','mu','μ'],
 ['Taxa de chegada lambda','PRIORITY','pr-lambda-0','λ'],
 ['Com interrupção e retomada','PRIORITY','pr-discipline','prioridade'],
 ['Número de servidores','MMs','s','servidores'],
 ['Qual o desvio padrão?','MG1','mg-service','Variabilidade'],
 ['Probabilidade de esperar mais de 12 minutos','MMsK','model-choices','não oferece'],
 ['Probabilidade de mais de 3 clientes','MG1','results-title','não oferece'],
 ['Probabilidade de não esperar para ser atendido','MM1','output','1 menos'],
];
for(const [q,model,target,content] of cases){const found=locate(q,model);assert.ok(found.some(x=>x.target===target&&(x.title+' '+x.description).includes(content)),JSON.stringify({q,found}));checks++;}
for(const q of ['', '  ','Qual é o significado da vida?','<script>alert(1)</script>']){assert.deepEqual(locate(q,'MM1'),[]);checks++;}
assert.ok(!locate('atendimento de 15 minutos','MM1').some(c=>c.symbol==='W'));checks++;
console.log(`${checks} perguntas e casos de orientação conferidos.`);
