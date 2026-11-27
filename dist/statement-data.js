/* Conservative, local extraction of explicit queueing inputs from Portuguese statements. */
(function(root){
 const seconds={hora:3600,minuto:60,segundo:1,dia:86400,mes:2592000};
 const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 const words={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,quinze:15,vinte:20};
 const numeric='(?:\\d+(?:[.,]\\d+)?(?:\\s*\\/\\s*\\d+(?:[.,]\\d+)?)?|'+Object.keys(words).join('|')+')';
 const unitPattern='(segundos?|minutos?|horas?|dias?|meses|mes|h|min|s)\\b';
 const amount=s=>{if(words[s]!==undefined)return words[s];const parts=s.replace(/\s/g,'').replace(/,/g,'.').split('/').map(Number);return parts.length===2?parts[0]/parts[1]:parts[0];};
 const unit=s=>s==='s'||s.startsWith('segundo')?'segundo':s==='min'||s.startsWith('minuto')?'minuto':s==='h'||s.startsWith('hora')?'hora':s.startsWith('dia')?'dia':'mes';
 const format=n=>n.toLocaleString('pt-BR',{maximumSignificantDigits:10});
 function extract(text,model,outputUnit='hora'){
  const q=norm(text),suggestions=[],warnings=[],candidates=new Map();
  outputUnit=seconds[outputUnit]?outputUnit:'hora';
  const shortText=q.replace(/[.!?]+$/,'').trim();
  const bareTime=shortText.match(new RegExp('^('+numeric+')\\s*'+unitPattern+'$'));
  if(bareTime)return {suggestions:[],warnings:[],clarifications:[
   {label:'É tempo de atendimento',text:'Atendimento de '+bareTime[0]},
   {label:'É intervalo entre chegadas',text:'Chegadas a cada '+bareTime[0]},
   {label:'É espera média na fila',text:'Tempo médio de espera na fila de '+bareTime[0]}
  ]};

  const add=(field,value,u,explanation,source)=>{
   if(field==='mg-service'){if(!['constant','exponential'].includes(value))return;}else if(!Number.isFinite(value)||value<0)return;
   if((field==='mu'||field==='lambda'||field.startsWith('pr-lambda-'))&&value===0){warnings.push('As taxas de chegada e atendimento devem ser positivas. Confira os valores do texto.');return;}
   if(['s','cap','pr-count'].includes(field)&&(!Number.isInteger(value)||value<1))return;
   if(!candidates.has(field))candidates.set(field,[]);
   candidates.get(field).push({field,value,unit:u,explanation,source});
  };
  const matches=(pattern,fn)=>{for(const m of q.matchAll(new RegExp(pattern,'g')))fn(m);};
  const rate=(field,value,u,source,explanation)=>add(field,value*seconds[outputUnit]/seconds[u],outputUnit,explanation||`${format(value)} por ${u} = ${format(value*seconds[outputUnit]/seconds[u])} por ${outputUnit}.`,source);
  const inverse=(field,value,u,source)=>{if(value<=0)return;rate(field,1/value,u,source,`Tempo médio de ${format(value)} ${u}${value===1?'':'s'}: ${field==='lambda'?'λ':'μ'} = 1/tempo = ${format(seconds[outputUnit]/(value*seconds[u]))} por ${outputUnit}.`);};
  // Structural quantities are accepted only with explicit system nouns, never from a probability threshold.
  matches('('+numeric+')\\s+(?:servidor(?:es)?|atendentes?|caixas?|barbeiros?|medicos?|tecnicos?|pistas?|terminais?|(?:canal|canais))(?![a-z])',m=>{if(!/\bmais\b|adicion/.test(q.slice(Math.max(0,m.index-20),m.index)))add('s',amount(m[1]),null,`${m[0]} → número de servidores s = ${format(amount(m[1]))}.`,m[0]);});
  matches('(?:\\bs|numero de servidores|numero de canais)\\s*(?:=|:|igual a)\\s*('+numeric+')',m=>add('s',amount(m[1]),null,'Quantidade explícita de servidores.',m[0]));
  if(!model||!model.includes('s')&&model!=='PRIORITY'){
   if(candidates.has('s')&&candidates.get('s').some(c=>c.value!==1))warnings.push('O texto menciona vários servidores. Confira se escolheu um modelo com s.');
  }
  const finiteSource=Boolean(model&&model.endsWith('N'));
  // Explicit variables; indexed lambda belongs to an individual priority class.
  matches('(?:\\blambda|λ)\\s*([1-9]|[₁₂₃])?\\s*(?:=|:)\\s*('+numeric+')(?:\\s*(?:clientes?|pacientes?|chamadas?))?(?:\\s*(?:por|/|a cada)\\s*'+unitPattern+')?',m=>{
   const index=m[1]?({'₁':1,'₂':2,'₃':3}[m[1]]||Number(m[1])):null;
   const field=model==='PRIORITY'&&index?'pr-lambda-'+(index-1):'lambda';
   const u=m[3]?unit(m[3]):outputUnit;
   if(!m[3])warnings.push('Uma taxa explícita não informa unidade; a sugestão usa '+outputUnit+'. Confira a unidade do enunciado.');
   rate(field,amount(m[2]),u,m[0]);
  });
  matches('(?:\\bmu|μ|\\bmi|taxa de atendimento(?: por servidor)?)\\s*(?:=|:|igual a|de)\\s*('+numeric+')(?:\\s*(?:clientes?|pacientes?|chamadas?))?(?:\\s*(?:por|/)\\s*'+unitPattern+')?',m=>{
   if(!m[2])warnings.push('Uma taxa de atendimento não informa unidade; a sugestão usa '+outputUnit+'. Confira a unidade do enunciado.');
   rate('mu',amount(m[1]),m[2]?unit(m[2]):outputUnit,m[0]);
  });
  // A short noun + rate fragment can describe arrivals; make that assumption visible.
  const shortRate=shortText.match(new RegExp('^(?:no ritmo de |ritmo de |taxa de chegada (?:de |: )?)?('+numeric+')\\s+(?:caminhoes|clientes?|pacientes?|pessoas?|avioes|carros?|chamadas?|tarefas?)\\s*(?:por|/)\\s*'+unitPattern+'$'));
  if(shortRate&&!finiteSource){rate('lambda',amount(shortRate[1]),unit(shortRate[2]),shortRate[0],'Se este trecho descreve as chegadas, informe λ = '+format(amount(shortRate[1])*seconds[outputUnit]/seconds[unit(shortRate[2])])+' por '+outputUnit+'.');warnings.push('Confirme que essa taxa descreve chegadas. Se for capacidade de atendimento, ela pertence a μ por servidor.');}
  const shortService=shortText.match(new RegExp('^(?:(?:tempo (?:medio )?de )?atendimento|servico|reparo)\\s*(?:de|:|=|em)?\\s*('+numeric+')\\s*'+unitPattern+'$'));
  if(shortService)inverse('mu',amount(shortService[1]),unit(shortService[2]),shortService[0]);
  // Process one sentence/clause at a time to keep arrival, service and questions separate.
  const clauses=q.split(/(?<!\d)[.;!?]|[.;!?](?!\d)|\n/).filter(Boolean);
  for(const clause of clauses){
   if(/qual|calcule|determine|probabilidade|deseja saber|quanto tempo.*esper|aguard.*no maximo|esper.*no maximo/.test(clause))continue;
   const arrival=/chega|chegam|chegadas|interchegada|entre chegadas|quebr|falha|em funcionamento|antes de quebrar|opera.*antes/.test(clause);
   const service=/atend|servic|repar|consert|descarreg|processar|processamento|pousar|lavar|servir|barbeiro.*(?:gasta|leva)|(?:gasta|leva).*cliente/.test(clause)&&!/espera|aguard|permanencia|tempo.*no sistema/.test(clause);
   if(arrival&&!service){
    const sourceOK=!finiteSource||/cada maquina|por maquina|uma maquina|quebr|falha|operacao|funcionamento/.test(clause);
    if(!sourceOK)warnings.push('Em população finita N, λ deve ser por cliente/máquina em operação. Não use uma chegada total como taxa individual.');
    else {
     const previousCandidates=(candidates.get('lambda')||[]).length;
     matchesOn(clause,'('+numeric+')\\s*(?:clientes?|pacientes?|pessoas?|caminhoes|avioes|carros?|chamadas?|tarefas?|quebras?|chegadas?|por|/)*\\s*(?:por|/|a cada)\\s*(?:('+numeric+')\\s*)?'+unitPattern,m=>rate('lambda',amount(m[1])/(m[2]?amount(m[2]):1),unit(m[3]),m[0]));
     if((candidates.get('lambda')||[]).length===previousCandidates)matchesOn(clause,'(?:a cada|interchegadas? de|entre chegadas (?:de|e de)|entre chegadas de|media(?: de| igual a)?|medio de)\\s*('+numeric+')\\s*'+unitPattern,m=>inverse('lambda',amount(m[1]),unit(m[2]),m[0]));
    }
   }
   if(service&&!arrival){
    matchesOn(clause,'('+numeric+')\\s*(?:clientes?|pacientes?|pessoas?|caminhoes|carros?|chamadas?|tarefas?|atendimentos?)\\s*(?:por|/)\\s*'+unitPattern,m=>{
     if(/cada|por servidor|um (?:atendente|servidor|caixa)|uma (?:equipe|maquina)|unico/.test(clause)||['MM1','MM1K','MM1N','MG1'].includes(model))rate('mu',amount(m[1]),unit(m[2]),m[0]);
     else warnings.push('A capacidade de atendimento pode ser total ou por servidor. Informe μ por servidor; não vou dividir a taxa sem essa informação.');
    });
    matchesOn(clause,'(?:media(?: de| igual a)?|medio(?: de| igual a)?|dura|demora|leva|gasta|exatamente|constante(?: e igual a)?|igual a)\\s*('+numeric+')\\s*'+unitPattern,m=>inverse('mu',amount(m[1]),unit(m[2]),m[0]));
   }
  }
  function matchesOn(sentence,pattern,fn){for(const m of sentence.matchAll(new RegExp(pattern,'g')))fn(m);}
  if(model&&model.endsWith('K')){
   matches('(?:\\bk|capacidade(?: total| limitada)?(?: do sistema)?)\\s*(?:=|:|de|igual a)\\s*('+numeric+')',m=>add('cap',amount(m[1]),null,'K é o total de clientes no sistema, incluindo os que estão em atendimento.',m[0]));
   matches('(?:comporta|acomoda|comportar|acomodar)\\s*(?:um maximo de|no maximo|ate)?\\s*('+numeric+')\\s*(?:clientes?|pacientes?|pessoas?|carros?)(?!\\s*(?:na fila|em espera))',m=>{if(!/espera/.test(q.slice(m.index,m.index+m[0].length+20)))add('cap',amount(m[1]),null,'Capacidade total informada no enunciado.',m[0]);});
   const wait=q.match(new RegExp('(?:apenas|maximo de|acomoda|acomodar|comporta|comportar)\\s*('+numeric+')\\s*(?:clientes?|pacientes?|pessoas?|carros?|avioes|caminhoes|ligacoes)\\s*(?:podem (?:permanecer|ficar)\\s*)?(?:em espera|esperando|na fila)'));
   if(wait){const servers=candidates.get('s')||[],distinct=[...new Set(servers.map(x=>x.value))];const s=model==='MM1K'?1:distinct.length===1?distinct[0]:null;if(s)add('cap',amount(wait[1])+s,null,`K = ${format(amount(wait[1]))} posições de espera + ${s} em atendimento = ${format(amount(wait[1])+s)}.`,wait[0]);else warnings.push('O texto informa posições de espera. Para obter K total, some o número de servidores; ainda não identifiquei s com segurança.');}
  }
  if(finiteSource){
   matches('(?:\\bn|populacao(?: finita)?)\\s*(?:=|:|de|igual a)\\s*('+numeric+')',m=>add('cap',amount(m[1]),null,'N é a população total de fontes, incluindo as que estão em operação e em reparo.',m[0]));
   matches('(?:possui|utiliza|mantem|atende|existem|ha)\\s*('+numeric+')\\s*(?:maquinas?|robos?|trens|motores?)',m=>add('cap',amount(m[1]),null,'População total de máquinas/fontes.',m[0]));
  }
  if(model!=='PRIORITY'){
   matches('(?:ocupacao(?: do sistema| do servidor)?|ρ)\\s*(?:=|:|de|e de)?\\s*('+numeric+')\\s*%',m=>add('rho',amount(m[1]),null,'Ocupação informada em porcentagem; não é a taxa μ.',m[0]));
   matches('tempo medio (?:de espera|gasto|de permanencia)?\\s*(?:na fila|no sistema)\\s*(?:=|:|de|e de|igual a)?\\s*('+numeric+')\\s*'+unitPattern,m=>add(m[0].includes('na fila')?'Wq':'W',amount(m[1]),unit(m[2]),'Tempo médio conhecido, não é tempo de atendimento. Informe-o em “Informar medidas conhecidas da fila”.',m[0]));
  }
  if(model==='MG1'){
   const constant=q.match(/(?:atendimento|servico|servir|atender|reparo|processamento)[^.;!?]{0,100}(?:constante|exatamente)|(?:constante|exatamente)[^.;!?]{0,50}(?:por cliente|cada cliente|para atender)/);
   if(constant)add('mg-service','constant',null,'Atendimento constante: CV = 0.',constant[0]);
   const exponential=q.match(/(?:atendimento|servico|servir|atender)[^.;!?]{0,90}exponencial/);
   if(exponential)add('mg-service','exponential',null,'Tempo de atendimento exponencial: CV = 1. Chegadas Poisson, sozinhas, não definem isso.',exponential[0]);
   matches('desvio padrao(?: de| igual a)?\\s*('+numeric+')\\s*'+unitPattern,m=>add('sd',amount(m[1]),unit(m[2]),'Desvio padrão do tempo de atendimento.',m[0]));
   matches('variancia(?: de| igual a)?\\s*('+numeric+')\\s*'+unitPattern+'\\s*(?:²|\\^2|ao quadrado)',m=>add('variance',amount(m[1]),unit(m[2]),'Variância do atendimento, em unidade de tempo ao quadrado.',m[0]));
  }
  for(const [field,values] of candidates){
   const unique=[];
   for(const c of values)if(!unique.some(x=>x.unit===c.unit&&(x.value===c.value||typeof x.value==='number'&&Math.abs(x.value-c.value)<=1e-8*Math.max(1,Math.abs(c.value)))))unique.push(c);
   if(unique.length>1){warnings.push(`Encontrei valores diferentes para ${field==='mu'?'μ':field==='lambda'?'λ':field==='cap'?'K/N':field}. O texto pode comparar cenários; selecione um cenário por vez.`);continue;}
   let c=unique[0];
   if(model==='PRIORITY'&&field==='lambda'){warnings.push('Em prioridades, informe a taxa de cada classe separadamente (por exemplo, λ1 = 2/h e λ2 = 10/h). A chegada total não preenche uma classe.');continue;}
   if(model==='PRIORITY'&&field==='mu')c={...c,field:'pr-mu'};
   if(field==='s'&&!model?.includes('s')&&model!=='PRIORITY'){if(c.value!==1)continue;c={...c,infoOnly:true,explanation:c.explanation+' Neste modelo, um servidor já está definido; não é necessário preencher outro campo.'};}
   suggestions.push(c);
  }
  if(model==='PRIORITY'){
   const highest=Math.max(0,...suggestions.filter(c=>c.field.startsWith('pr-lambda-')).map(c=>Number(c.field.split('-').pop())+1));
   if(highest>=2)suggestions.unshift({field:'pr-count',value:highest,unit:null,explanation:'O texto identifica taxas até a classe '+highest+'. Mantenha pelo menos esse número de classes.',source:'taxas por classe'});
  }
  if(q&&!suggestions.some(x=>x.field==='lambda')&&model!=='PRIORITY')warnings.push('Não identifiquei λ com segurança. Procure a taxa de chegada ou o tempo médio entre chegadas no enunciado.');
  if(q&&!suggestions.some(x=>['mu','pr-mu'].includes(x.field)))warnings.push('Não identifiquei μ com segurança. Procure a taxa por servidor ou o tempo médio de atendimento.');
  if(model==='MG1'&&!suggestions.some(x=>['mg-service','sd','variance'].includes(x.field)))warnings.push('Em M/G/1, a média de atendimento sozinha não basta: informe a distribuição ou a variabilidade.');
  return {suggestions,warnings:[...new Set(warnings)]};
 }
 function recommend(text,currentModel){
  const q=norm(text),names={MM1:'M/M/1',MMs:'M/M/s',MM1K:'M/M/1/K',MMsK:'M/M/s/K',MM1N:'M/M/1/N',MMsN:'M/M/s/N',MG1:'M/G/1',PRIORITY:'Prioridades'};
  const reply=(models,reasons,check)=>({models:models.map(key=>({key,name:names[key]})),reasons,check,matches:models.length===1&&models[0]===currentModel});
  if(!q)return reply([],[],'Cole o enunciado completo para conferir as hipóteses.');
  const structural=extract(text,'MMs').suggestions.find(c=>c.field==='s');
  let servers=structural?.value;
  if(!servers&&/unico (?:servidor|atendente|canal|barbeiro|medico|tecnico)|uma unica (?:maquina|pista)|um so (?:servidor|atendente|canal)/.test(q))servers=1;
  const prior=/prioridade|prioridades|classes de prioridade|casos criticos|interromp.*(?:atendimento|tratamento)|primeira classe.*classe economica/.test(q)&&!/sem prioridades|nao ha prioridades|sem classes de prioridade/.test(q);
  const source=/(?:\bn|populacao(?: finita)?)\s*(?:=|:|de|igual a)\s*\d/.test(q)||/populacao finita/.test(q)||(/quebr|falha|manutencao|repar|consert/.test(q)&&new RegExp('(?:possui|utiliza|mantem|atende|existem|instalou)\\s*'+numeric+'\\s*(?:maquinas?|robos?|trens|motores?)').test(q));
  const capacity=/\bk\s*(?:=|:)|capacidade (?:total|limitada)|sistema (?:tem|possui|com) (?:uma )?capacidade|comporta (?:um maximo|no maximo|ate)|(?:apenas|maximo de)\s*(?:\d+|tres|quatro|cinco)[^.;!?]{0,45}(?:em espera|esperando|na fila)|acomodar[^.;!?]{0,40}(?:esperando|na fila)/.test(q)&&!/capacidade (?:ilimitada|infinita)|nao ha limite/.test(q);
  const poisson=/poisson|(?:tempo|intervalo)[^.;!?]{0,60}(?:entre chegadas|interchegada)[^.;!?]{0,60}exponencial/.test(q);
  const serviceExp=/(?:atendimento|servico|servir|atender|reparo|conserto|pousar)[^.;!?]{0,100}exponencial/.test(q);
  const serviceGeneral=/(?:atendimento|servico|servir|atender|reparo|processamento)[^.;!?]{0,100}(?:constante|exatamente|deterministic|distribuicao geral|variancia|desvio padrao)|(?:variancia|desvio padrao)[^.;!?]{0,60}(?:atendimento|servico)/.test(q)&&!serviceExp;
  const assumptions=poisson&&serviceExp?'':'Confira as hipóteses antes de trocar: chegadas Poisson (ou intervalos exponenciais) e atendimento exponencial. Só a média não identifica a distribuição.';
  if(prior){
   if(source||capacity)return reply([],['O texto combina prioridades com capacidade ou população finita.'],'Essa combinação não é oferecida pela calculadora. Não use Prioridades ilimitadas para substituir o modelo finito.');
   return reply(['PRIORITY'],['O atendimento distingue classes ou interrompe serviços para atender uma prioridade maior.'],'Confira a ordem das classes e se há interrupção. Serviço geral por classe só é oferecido com um servidor, sem interrupção.');
  }
  if(source&&capacity)return reply([],['O texto combina população finita N e capacidade limitada K.'],'A calculadora oferece K e N separadamente. A combinação com restrição de capacidade precisa de outro modelo.');
  if((source||capacity)&&serviceGeneral)return reply([],['Há restrição finita e atendimento não exponencial.'],'Os modelos finitos oferecidos são M/M/…; confira a distribuição de atendimento. Um modelo finito com serviço geral não está disponível.');
  if(source||capacity){
   const suffix=source?'N':'K',reasons=[source?'O enunciado descreve fontes finitas que voltam a operar após reparo; N é a população total.':'O enunciado limita a quantidade dentro do sistema ou em espera; K inclui quem está em atendimento.'];
   if(servers)reasons.push(servers===1?'Há um servidor.':`Há ${servers} servidores em paralelo.`);
   return reply(servers?[servers===1?'MM1'+suffix:'MMs'+suffix]:['MM1'+suffix,'MMs'+suffix],reasons,(servers?'':'Identifique se existe um ou vários servidores. ')+assumptions);
  }
  if(serviceGeneral){
   if(servers>1)return reply([],['Há vários servidores e atendimento não exponencial.'],'M/G/s não está disponível. M/G/1 atende apenas um servidor; não reduza o número de servidores para encaixar o enunciado.');
   return reply(['MG1'],['O texto descreve atendimento constante/geral ou fornece variância/desvio padrão.'],(servers===1?'':'Confirme que há apenas um servidor. ')+(poisson?'':'Confirme que as chegadas seguem um processo de Poisson. ')+'Informe a média e a variabilidade do atendimento.');
  }
  if(poisson&&serviceExp)return reply(servers?[servers===1?'MM1':'MMs']:['MM1','MMs'],['Há chegadas Poisson e atendimento exponencial.',...(servers?[servers===1?'Há um servidor.':`Há ${servers} servidores em paralelo.`]:[])],(servers?'':'Falta identificar se há um ou vários servidores. ')+'Confirme que capacidade e população são ilimitadas; se houver limites, use a família K ou N.');
  return reply([],servers?[`Identifiquei ${servers} servidor(es), mas as distribuições não estão claras.`]:[],'Ainda não dá para escolher com segurança. Procure no enunciado: chegadas Poisson, distribuição do atendimento, número de servidores, limite K, população N e prioridades. Não escolha M/M/… apenas por conhecer λ e μ.');
 }
 root.StatementData={extract,recommend};if(typeof module!=='undefined')module.exports={extract,recommend};
})(globalThis);
