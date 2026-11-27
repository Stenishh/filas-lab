/* Local statement guidance; only explicit user actions apply suggested values. */
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
  if(!probability&&time&&!/tempo medio (?:entre chegadas|de atendimento)|taxa/.test(q)&&!(!queue&&/atendimento|servico|reparo|entre chegadas/.test(q))){
   const key=queue?'Wq':'W';
   add(key==='Wq'?'Espera média na fila — Wq':'Tempo médio no sistema — W',`Resultados → ${key==='Wq'?'Tempo na fila: antes de começar o atendimento.':'Tempo no sistema: fila mais atendimento.'}${model==='PRIORITY'?' Procure o quadro da classe pedida.':''}`,'output',key);
  }
  if(/em operacao|operacionais|disponibilidade/.test(q)&&model&&model.endsWith('N'))add('População e disponibilidade','Resultados → População e disponibilidade. “Em operação” é N − L. “Disponibilidade individual” é (N − L)/N.','output',/disponibilidade/.test(q)?'A':'N − L');
  if(!probability&&count&&/medio|media/.test(q)&&!/em operacao|operacionais|disponibilidade|tempo|taxa|minut|hora|segund/.test(q))add(queue?'Clientes médios na fila — Lq':'Clientes médios no sistema — L',`Resultados → ${queue?'Na fila (Lq)':'No sistema (L)'}.${model==='PRIORITY'?' Veja a classe solicitada; com interrupção, L e Lq seguem a taxa acumulada dos slides.':''}`,'output',queue?'Lq':'L');
  if(/taxa de chegada|lambda|λ|tempo medio entre chegadas/.test(q))add('Taxa de chegada — λ','Preencha Taxa de chegada ou Tempo médio entre chegadas, em Chegadas e atendimento. Escolha a unidade correspondente. Em população finita N, a taxa é por máquina em operação; em prioridades, informe a chegada de cada classe.',model==='PRIORITY'?'pr-lambda-0':'lambda');
  if(/taxa de atendimento|\bmi\b|\bmu\b|μ|tempo medio de atendimento|tempo de servico|^(?:atendimento|servico|reparo) (?:de|em|:) /.test(q))add('Taxa de atendimento — μ','Preencha Taxa de atendimento por servidor ou Tempo médio de atendimento. μ é a capacidade de um servidor, não a soma dos canais. Escolha a unidade do enunciado.',model==='PRIORITY'?'pr-service':'mu');
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
 const dataResults=document.getElementById('statement-data-results');
 let pendingModelText=null;
 const labels={lambda:'Taxa de chegada · λ (lambda)',mu:'Taxa de atendimento por servidor · μ (mi)',s:'Número de servidores · s',rho:'Ocupação média por servidor · ρ',W:'Tempo médio no sistema · W',Wq:'Espera média na fila · Wq',sd:'Desvio padrão · σ',variance:'Variância · σ²','pr-count':'Número de classes','pr-mu':'Taxa de atendimento por servidor · μ (mi)','mg-service':'Tipo de atendimento'};
 const unitSeconds={hora:3600,minuto:60,segundo:1,dia:86400,mes:2592000};
 function fieldLabel(c,model){return c.field==='cap'?(model.endsWith('N')?'População · N':'Capacidade total · K'):c.field.startsWith('pr-lambda-')?'Taxa de chegada da classe '+(Number(c.field.split('-').pop())+1)+' · λ':labels[c.field]||c.field;}
 function applySuggestion(c,model){
  const el=document.getElementById(c.field);
  if(!el||el.closest('[hidden]')){notice.textContent='O campo não está disponível neste modo. Em prioridades, confira o número de classes e o tipo de atendimento.';return;}
  if(c.field==='pr-count'){
   if(Number(el.value)>=c.value){notice.textContent='O formulário já tem classes suficientes; mantive as entradas.';return;}
   el.value=String(c.value);el.dispatchEvent(new Event('change',{bubbles:true}));notice.textContent='Número de classes atualizado. Agora confira e preencha cada taxa.';return;
  }
  if(c.field==='mg-service'){
   if(el.value!=='general'&&el.value!==c.value){notice.textContent='Mantive o tipo de atendimento que você já escolheu. Confira a sugestão antes de trocar manualmente.';return;}
   if(['cv','sd','variance','second'].some(id=>document.getElementById(id)?.value.trim())){notice.textContent='Já há dados de variabilidade preenchidos; mantive esses valores. Confira o tipo de atendimento manualmente.';return;}
   el.value=c.value;el.dispatchEvent(new Event('change',{bubbles:true}));notice.textContent='Tipo de atendimento atualizado conforme o enunciado.';return;
  }
  if(el.value.trim()!==''){notice.textContent='Mantive o valor que você já preencheu em '+fieldLabel(c,model)+'. Para usar a sugestão, confira e limpe esse campo primeiro.';return;}
  const alternative=c.field==='lambda'?'tmc':c.field==='mu'?'tms':null;
  if(alternative&&document.getElementById(alternative)?.value.trim()){notice.textContent='Já há um tempo médio preenchido para essa taxa. Mantive os dados; confira a conversão mostrada na sugestão.';return;}
  let number=c.value;
  const unitSelect=document.getElementById(c.field+'-unit');
  if(c.unit&&unitSelect)unitSelect.value=c.unit;
  else if(c.unit&&c.field.startsWith('pr-'))number*=unitSeconds[document.getElementById('unit').value]/unitSeconds[c.unit];
  el.value=String(Number(number.toPrecision(14))).replace('.',',');
  el.dispatchEvent(new Event('input',{bubbles:true}));
  notice.textContent='Preenchido: '+fieldLabel(c,model)+'. Confira o valor e a unidade.';
 }
 function renderModel(text,model){
  const box=document.getElementById('statement-model-results');box.replaceChildren();
  if(!root.StatementData?.recommend)return;
  const suggestion=root.StatementData.recommend(text,model),heading=document.createElement('h3'),detail=document.createElement('p');
  heading.textContent=suggestion.matches?'O modelo selecionado corresponde aos indícios do texto':suggestion.models.length?'Confira o modelo de fila':'Faltam hipóteses para indicar um modelo';
  detail.textContent=[...suggestion.reasons,suggestion.check].filter(Boolean).join(' ');box.append(heading,detail);
  suggestion.models.forEach(item=>{
   const p=document.createElement('p'),label=document.createElement('strong');label.textContent=item.name+(item.key===model?' — modelo atual':'');p.append(label);
   if(item.key!==model){const link=document.createElement('a');link.className='quiet model-suggestion-link';link.href='#/modelo/'+item.key;link.textContent='Abrir '+item.name;
    link.addEventListener('click',()=>{pendingModelText=document.getElementById('question-text').value;});p.append(document.createTextNode(' '),link);}
   box.append(p);
  });
 }
 function renderData(text,model){
  dataResults.replaceChildren();if(!root.StatementData)return 0;
  const parsed=root.StatementData.extract(text,model,document.getElementById('unit').value);
  if(parsed.clarifications?.length){
   const heading=document.createElement('h3'),p=document.createElement('p');heading.textContent='O que esse tempo representa?';p.textContent='Um tempo sozinho pode ser chegada, atendimento ou espera. Escolha o significado do trecho para indicar o campo correto.';dataResults.append(heading,p);
   for(const item of parsed.clarifications){const button=document.createElement('button');button.type='button';button.className='quiet fragment-choice';button.textContent=item.label;button.addEventListener('click',()=>{document.getElementById('question-text').value=item.text;form.requestSubmit();});dataResults.append(button);}
   return parsed.clarifications.length;
  }
  if(!parsed.suggestions.length)return 0;
  const heading=document.createElement('h3');heading.textContent='Dados identificados no enunciado';dataResults.append(heading);
  const list=document.createElement('ul');
  parsed.suggestions.forEach(c=>{
   const li=document.createElement('li'),title=document.createElement('strong'),detail=document.createElement('p'),source=document.createElement('p'),button=document.createElement('button');
   const value=typeof c.value==='string'?(c.value==='constant'?'Constante':'Exponencial'):c.value.toLocaleString('pt-BR',{maximumSignificantDigits:10});
   title.textContent=fieldLabel(c,model)+': '+value+(c.unit?' '+(['lambda','mu','pr-mu'].includes(c.field)||c.field.startsWith('pr-lambda-')?'por ':'')+c.unit+(c.field==='variance'?'²':''):'')+(c.field==='rho'?'%':'');
   detail.textContent=c.explanation;source.className='hint';source.textContent='Trecho identificado: “'+c.source+'”.';
   button.type='button';button.className='quiet';button.textContent='Usar este valor';button.dataset.field=c.field;button.addEventListener('click',()=>applySuggestion(c,model));
   li.append(title,detail,source);if(!c.infoOnly)li.append(button);list.append(li);
  });dataResults.append(list);
  for(const warning of parsed.warnings){const p=document.createElement('p');p.className='hint';p.textContent=warning;dataResults.append(p);}
  return parsed.suggestions.length;
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();results.replaceChildren();dataResults.replaceChildren();document.getElementById('statement-model-results').replaceChildren();notice.textContent='';
  const text=document.getElementById('question-text').value;
  const match=location.hash.match(/^#\/modelo\/(\w+)$/),model=match?match[1]:null;
  if(!text.trim()){notice.textContent='Digite a pergunta que você quer localizar.';return;}
  renderModel(text,model);
  const dataCount=renderData(text,model);
  const question=text.match(/(?:qual|quais|calcule|determine|pede-se|encontre)[\s\S]*$/i);
  const answers=locate(question?question[0]:text,model);
  if(!answers.length&&!dataCount){notice.textContent='Não identifiquei uma medida com segurança. Tente uma pergunta por vez, como “tempo médio na fila”, “probabilidade de mais de 3 clientes” ou “probabilidade de esperar mais de 12 minutos”.';return;}
  answers.forEach(item=>{const entry=document.createElement('li'),title=document.createElement('strong'),description=document.createElement('p'),button=document.createElement('button');title.textContent='Use: '+item.title;description.textContent=item.description;button.type='button';button.className='quiet';button.textContent='Ir até essa parte';button.addEventListener('click',()=>go(item));entry.append(title,description,button);results.append(entry);});
 });
 window.addEventListener('hashchange',()=>{results.replaceChildren();dataResults.replaceChildren();document.getElementById('statement-model-results').replaceChildren();notice.textContent='';if(pendingModelText!==null){document.getElementById('question-text').value=pendingModelText;pendingModelText=null;document.querySelector('.question-guide').open=true;form.requestSubmit();}});
 document.getElementById('question-text').addEventListener('input',()=>{dataResults.replaceChildren();results.replaceChildren();document.getElementById('statement-model-results').replaceChildren();notice.textContent='';});
})(globalThis);
