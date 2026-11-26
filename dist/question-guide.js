/* Local guidance for common queueing questions; no network or automatic data entry. */
(function(root){
 const normalize=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 function locate(text,model){
  const q=normalize(text),items=[];
  if(!q)return [];
  const add=(title,description,target,symbol)=>items.push({title,description,target,symbol});
  const probability=/probabilidade|chance|proporcao|porcentagem|percentual|p\s*\(/.test(q);
  const queue=!/no sistema|no salao|no hospital|permanen|incluindo atendimento/.test(q)&&/fila|aguard|espera|wq|antes d[eo] atendimento|antes de ser atendid|para ser atendid|ate ser atendid/.test(q);
  const time=/tempo|demor|esperar|espera|permanen|minut|hora|segund|wq?\b/.test(q);
  const count=/client|pesso|caminh|avia|avio|pacient|taref|ligac|chamad|carro|trem|trens|maquin|robo|motor|numero|quantidade/.test(q);
  const bound=/mais (?:de|que)|maior (?:do )?que|superior|exced|ultrapass|menos (?:de|que)|menor (?:do )?que|inferior|no maximo|no minimo|pelo menos|ate\s+\d|exatamente/.test(q);
  const symbolicTime=/p\s*\(\s*wq?\b/.test(q);
  if(probability&&time&&(!count||/tempo|minut|hora|segund/.test(q))&&(bound||symbolicTime)){
   if(!['MM1','MMs'].includes(model))add('Probabilidade de tempo','Essa consulta de tempo está disponível em M/M/1 e M/M/s. Escolha um desses modelos somente se ele corresponder ao enunciado. Nos demais modelos, a calculadora não oferece essa distribuição.','model-choices');
   else {
    const upper=/menos|menor|inferior|no maximo|ate\s+\d/.test(q);
    add('Probabilidades de exceder um limite',`Campo: Tempo. Informe o limite e selecione a unidade (Minuto ou Hora). ${queue||/wq/.test(q)?'Resultado: Espera acima do limite — P(Wq > t).':'Resultado: Tempo no sistema acima do limite — P(W > t), que inclui fila e atendimento.'}${upper?' Para a probabilidade de ficar até esse tempo, use 1 menos a probabilidade de exceder o limite.':''}`,'limit');
   }
  }
  if(count&&(bound||(probability&&/\d/.test(q)))&&!/tempo|minut|hora|segund/.test(q)){
   if(['MG1','PRIORITY'].includes(model))add('Probabilidade de quantidade','A calculadora não oferece distribuição de quantidade neste modelo. Médias e variâncias não bastam para determinar todas essas probabilidades.','results-title');
   else {
    const comparison=/no maximo|ate\s+\d/.test(q)?'No máximo (≤)':/pelo menos|no minimo/.test(q)?'Pelo menos (≥)':/menos|menor|inferior/.test(q)?'Menos de (<)':/mais (?:de|que)|maior|superior|exced/.test(q)?'Mais de (>)':'Exatamente (=)';
    if(comparison==='Exatamente (=)'&&!queue)add('Consultar probabilidade P(n)','Campo: Número de clientes no sistema · n. Informe o número do enunciado. O resultado é a probabilidade de haver exatamente esse número de clientes no sistema.','query-n');
    else add('Comparar quantidade de clientes',`Resultados → Comparar quantidade de clientes. Em Onde contar, escolha ${queue?'“Somente aguardando na fila”':'“No sistema (fila e atendimento)”'}. Em Comparação, escolha “${comparison}” e informe o número do enunciado. “Mais de 3” inclui 4, 5…; “no máximo 3” inclui 0, 1, 2 e 3.`,'count-limit');
   }
  }
  if(probability&&queue&&!bound&&!/minut|hora|segund/.test(q))add('Probabilidade de esperar ao chegar',model==='PRIORITY'?'A calculadora não oferece a probabilidade de esperar por classe; ela mostra tempos médios.':'Resultados → Taxas, ocupação e outras medidas → Chance de esperar ao entrar. Se a pergunta pede não esperar, use 1 menos essa probabilidade.','output',model==='PRIORITY'?undefined:'Pespera');
  if(probability&&/vazio|ocios|ninguem no sistema|nenhum cliente no sistema/.test(q))add('Sistema vazio — P₀','Resultados → Taxas, ocupação e outras medidas → Sistema vazio. Com vários servidores, P₀ é a chance de todos estarem ociosos; não é a ociosidade média de cada servidor.','output','P₀');
  if(/ninguem (?:esta )?(?:esperando|aguardando)|nenhum cliente (?:na fila|esperando)|fila vazia/.test(q))add('Nenhum cliente esperando',['MG1','PRIORITY'].includes(model)?'A consulta de distribuição de quantidade não está disponível neste modelo. Fila vazia não é a mesma coisa que sistema vazio.':'Use Comparar quantidade de clientes → Somente aguardando na fila → Exatamente (=) → 0. Fila vazia pode ter clientes em atendimento; não é a mesma coisa que sistema vazio.', ['MG1','PRIORITY'].includes(model)?'results-title':'count-limit');
  if(/ocupac|ocupado|ociosidade|ocioso/.test(q)&&!/vazio/.test(q))add('Ocupação e ociosidade','Resultados → Taxas, ocupação e outras medidas. “Ocupação média por servidor” é a fração de tempo ocupada; a ociosidade média é 1 menos essa ocupação. “Sistema ocupado” é a chance de pelo menos um servidor estar ocupado.','output',model==='PRIORITY'?'ρ':'λef/(sμ)');
  if(/bloque|recus|rejeit|sinal de ocupado|sistema cheio|lotad/.test(q))add('Bloqueio e chegadas recusadas','Nos modelos com K: Resultados → Taxas, ocupação e outras medidas → Probabilidade de bloqueio. K inclui quem está em atendimento. Para recusas por hora, use a taxa de chegadas recusadas.','output','Pbloqueio');
  if(!probability&&time&&!/tempo medio (?:entre chegadas|de atendimento)|taxa/.test(q)){
   const key=queue?'Wq':'W';
   add(key==='Wq'?'Espera média na fila — Wq':'Tempo médio no sistema — W',`Resultados → ${key==='Wq'?'Tempo na fila: antes de começar o atendimento.':'Tempo no sistema: fila mais atendimento.'}${model==='PRIORITY'?' Procure o quadro da classe pedida.':''}`,'output',key);
  }
  if(/em operacao|operacionais|disponibilidade/.test(q)&&model&&model.endsWith('N'))add('População e disponibilidade','Resultados → População e disponibilidade. “Em operação” é N − L. “Disponibilidade individual” é (N − L)/N.','output',/disponibilidade/.test(q)?'A':'N − L');
  if(!probability&&count&&/medio|media/.test(q)&&!/em operacao|operacionais|disponibilidade|tempo|taxa|minut|hora|segund/.test(q))add(queue?'Clientes médios na fila — Lq':'Clientes médios no sistema — L',`Resultados → ${queue?'Na fila (Lq)':'No sistema (L)'}.${model==='PRIORITY'?' Veja a classe solicitada; com interrupção, L e Lq seguem a taxa acumulada dos slides.':''}`,'output',queue?'Lq':'L');
  if(/taxa de chegada|lambda|λ|tempo medio entre chegadas/.test(q))add('Taxa de chegada — λ','Preencha Taxa de chegada ou Tempo médio entre chegadas, em Chegadas e atendimento. Escolha a unidade correspondente. Em população finita N, a taxa é por máquina em operação; em prioridades, informe a chegada de cada classe.',model==='PRIORITY'?'pr-lambda-0':'lambda');
  if(/taxa de atendimento|\bmi\b|\bmu\b|μ|tempo medio de atendimento|tempo de servico/.test(q))add('Taxa de atendimento — μ','Preencha Taxa de atendimento por servidor ou Tempo médio de atendimento. μ é a capacidade de um servidor, não a soma dos canais. Escolha a unidade do enunciado.',model==='PRIORITY'?'pr-service':'mu');
  if(/numero de (?:canais|servidores)|quantos (?:canais|servidores|atendentes)|dois (?:canais|servidores)/.test(q))add('Número de servidores — s','Número de canais é o número de servidores trabalhando em paralelo. Para vários servidores, escolha um modelo com s e preencha Número de servidores.',model&&model.includes('s')||model==='PRIORITY'?'s':'model-choices');
  if(/variancia|desvio padrao|coeficiente de variacao|segundo momento/.test(q))add('Variabilidade do atendimento','Em M/G/1, abra Tipo de atendimento e informe CV, desvio padrão, variância ou segundo momento. Em prioridades com atendimento geral, informe a variância por classe.',model==='PRIORITY'?'pr-service':model==='MG1'?'mg-service':'model-choices');
  if(/prioridade|interrupcao|preempt/.test(q))add('Disciplina de prioridade','Escolha Prioridades. Em Disciplina de prioridade, selecione sem interrupção ou com interrupção e retomada conforme o enunciado. A classe 1 tem a maior prioridade.',model==='PRIORITY'?'pr-discipline':'model-choices');
  if(/custo|multa|reais|r\$/.test(q))add('Custos e multas','Use as médias calculadas para montar o custo pedido: por exemplo, custo por hora × L × horas de trabalho. A calculadora não oferece um campo de custo nem uma distribuição de multas por atraso.','results-title');
  return items;
 }
 root.QuestionGuide={locate};
 if(typeof module!=='undefined')module.exports={locate};
 if(typeof document==='undefined')return;
 const form=document.getElementById('question-guide-form');if(!form)return;
 const results=document.getElementById('question-guide-answer'),notice=document.getElementById('question-guide-notice');
 function go(item){
  if(document.getElementById('status').textContent==='Atualizando')document.getElementById('form').requestSubmit();
  let target=document.getElementById(item.target);
  if(item.target==='model-choices'&&document.getElementById('choose-page').hidden){location.hash='#/';notice.textContent='Escolha o modelo que corresponde às hipóteses do enunciado.';return;}
  if(item.symbol){const labels=[...document.querySelectorAll('#output .measure-label>span')];const match=labels.find(el=>el.textContent===item.symbol);if(match)target=match.closest('.main-measure');else target=null;}
  if(!target||target.closest('[hidden]')){notice.textContent='Escolha o modelo e preencha os dados conhecidos para gerar os resultados. Depois, use este botão novamente.';return;}
  for(let el=target.parentElement;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;
  if(!target.matches('input,select,button,a,summary'))target.tabIndex=-1;
  target.scrollIntoView({block:'center',behavior:'auto'});target.focus({preventScroll:true});notice.textContent='';
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();results.replaceChildren();notice.textContent='';
  const text=document.getElementById('question-text').value;
  const match=location.hash.match(/^#\/modelo\/(\w+)$/),model=match?match[1]:null;
  if(!text.trim()){notice.textContent='Digite a pergunta que você quer localizar.';return;}
  const answers=locate(text,model);
  if(!answers.length){notice.textContent='Não identifiquei uma medida com segurança. Tente uma pergunta por vez, como “tempo médio na fila”, “probabilidade de mais de 3 clientes” ou “probabilidade de esperar mais de 12 minutos”.';return;}
  answers.forEach(item=>{const entry=document.createElement('li'),title=document.createElement('strong'),description=document.createElement('p'),button=document.createElement('button');title.textContent='Use: '+item.title;description.textContent=item.description;button.type='button';button.className='quiet';button.textContent='Ir até essa parte';button.addEventListener('click',()=>go(item));entry.append(title,description,button);results.append(entry);});
 });
 window.addEventListener('hashchange',()=>{results.replaceChildren();notice.textContent='';});
})(globalThis);
