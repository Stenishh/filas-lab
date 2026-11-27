# Validação com o material da disciplina

Última revisão integral: **24/11/2026**. A seção “Auditoria integral” ao final distingue o cálculo matemático da convenção de apresentação solicitada para prioridades com interrupção.

Fontes locais: `Material de referencia/Teoria das filas Modelo MMs.pdf` e `Material de referencia/Formulário M008 Capítulo 7.pdf`. As páginas abaixo contam a partir da primeira página do PDF. Teste reproduzível: `node test-exemplos-pdf.cjs`.

## Exercícios numéricos

| Exemplo | Entradas do enunciado | Resultado validado |
|---|---|---|
| Posto, p. 29 | 6 clientes em 5 minutos; atendimento de 40 segundos | λ = 1,2/min; μ = 1,5/min; ocupação = 80% |
| Motores, p. 41–42 | 30 observações mensais; ocupação de 88% | Soma = 330; λ = 11/mês; μ = 12,5/mês; L = 7,33333; Lq = 6,45333; W = 0,66667 mês; Wq = 0,58667 mês; P₀ = 12% |
| Barbearia, p. 43 | Interchegadas de 20 minutos; atendimento de 15 minutos | P₀ = 25%; L = 3; Lq = 2,25; W = 1 hora; Wq = 45 minutos |
| Barbearia, p. 43, item g | μ = 4/h e W = 1,25 hora | λ inferida = 3,2/h, como o gabarito |
| Dois canais, p. 49 | λ = 30/h; μ = 20/h; s = 2 | Lq = 1,92857; Wq = 3,85714 min; L = 3,42857; W = 6,85714 min; P(n=3) = 0,12054 |
| Agência bancária, p. 50 | λ = 0,6/min; atendimento de 2 minutos; 3 caixas | Ocupação = 40%; L = 1,29412; Lq = 0,09412; P₀ = 0,29412; Wq = 0,15686 min; W = 2,15686 min |

Os valores publicados entre parênteses para a barbearia e para a agência coincidem com o cálculo, dentro do arredondamento, com a exceção explicitada abaixo. O posto, os motores e o exemplo de dois canais não trazem gabaritos numéricos; os testes confrontam o cálculo com as fórmulas fechadas da apostila, calculadas independentemente do motor.

## Probabilidades pedidas

| Exemplo | Consulta | Resultado da fórmula |
|---|---|---|
| Barbearia | P(W > 1 hora) | 0,36787944 |
| Barbearia | P(Wq > 1 hora) | 0,27590958 |
| Dois canais | P(W > 12 min) | 0,16876947 |
| Dois canais | P(Wq > 6 min) | 0,23649393 |
| Agência | P(W > 3 min) | 0,25064627 (PDF: 0,2506) |
| Agência | P(Wq > 2 min) | 0,02333631 (PDF: 0,0233) |
| Agência | P(n > 5) | **0,00903529 (PDF: 0,0091)** |

Há uma pequena divergência no último gabarito: P(n > 5) = P(espera) × 0,4³ = (12/85) × 0,4³ = 0,0090352941. Arredondando diretamente a quatro casas, o resultado é 0,0090, enquanto o PDF apresenta 0,0091. A calculadora mantém o valor da fórmula; a diferença não foi escondida aumentando a tolerância do teste.

## Observações do exercício de motores

Frequências relativas: 8 defeitos em 2/30 meses; 9 em 3/30; 10 em 6/30; 11 em 7/30; 12 em 6/30; 13 em 6/30. A média é 11 defeitos/mês. A calculadora recebe essa taxa média, não a série bruta.

A conversão para dias depende da duração adotada para o mês. Com **30 dias/mês**, W = 20 dias e Wq = 17,6 dias. A interface oferece “Mês (30 dias)” e mostra essa convenção quando usada. Os itens h/i não especificam a unidade do limite “1”: para um mês, P(W>1)=0,22313016 e P(Wq>1)=0,19635454; para um dia, com a convenção acima, são 0,95122942 e 0,83708189. O item e pede um “número médio” acompanhado de “em dias”; interpretamos o número médio de motores fora de serviço como L, cuja unidade é motores.

## Formulário de fórmulas

A página 2 do formulário não tem exercícios numéricos adicionais. Foram testados os casos particulares de M/G/1: atendimento exponencial, E[ts²]=2/μ², reproduz M/M/1; atendimento constante, σ²=0, produz Lq=ρ²/[2(1−ρ)]. As identidades de Little e as equações de equilíbrio para os modelos finitos continuam verificadas nos testes do motor. Esses testes são verificações das fórmulas, e não gabaritos numéricos fornecidos pelo PDF.

## Ampliação de 17/11/2026

Foram lidos os **oito PDFs locais**, incluindo as quatro listas novas e as apostilas de MMsK/MMsN e MG1/prioridades. A suíte original continua em `test-exemplos-pdf.cjs`. A nova suíte é `node test-materiais.cjs`; ela e as três anteriores são obrigatórias no workflow de publicação.

`fixtures/exercicios.json` contém **56 cenários adicionais**, com entradas identificadas por fonte/exercício e resultados de referência calculados independentemente com frações exatas em Python (`scripts/generate-reference-fixtures.py`). O teste JavaScript compara esses valores fixos com o motor e com a inferência por ocupação e atendimento. As probabilidades, prioridades, metas e custos têm verificações adicionais explícitas no teste. Tolerância numérica: 1e−9 × max(1, |referência|), sem ampliar a tolerância para acomodar gabaritos incorretos.

### Cobertura e hipóteses

| Fonte | Cobertura |
|---|---|
| Lista MMs, 5 páginas | Exercícios 2–15, incluindo variantes de número de servidores, inferências, probabilidades, contagens de Poisson e metas de atendimento. Exercício 1 tem dados conflitantes, descritos abaixo. |
| Lista MMsK, 2 páginas | Exercícios 1–6, inclusive duas pistas/terminais. K inclui atendimento: duas pistas mais três posições de espera dão K=5. |
| Lista MMsN, 2 páginas | Exercícios 1–6, com variantes de técnicos e divisão das máquinas em dois grupos. λ é a taxa individual de cada máquina/trem fora do sistema. |
| Lista MG1 e prioridades, 2 páginas | Exercício 1: cinco desvios padrão, além da inferência de μ no item d; exercícios 4–7: prioridades, comparações e hospital com um/dois servidores. Exercícios 2/3 não determinam um M/G/1 completo, conforme nota abaixo. |
| Apostila MG1/prioridades | Lava-rápido e café (p. 6–7); conservação de medidas por classe no hospital (p. 12–17); tempos gerais por produto (p. 18–19); viaturas (p. 20). |
| Apostila MMsK/MMsN | Exemplos das p. 7–8, 13–14, 18–19 e 23–24. Na p. 13, adota-se K=5 total para comparar um/dois atendentes e P5; o texto alterna quatro/cinco ligações em espera. |
| Formulário e apostila MMs | Verificações anteriores preservadas, inclusive a divergência da p. 50. |

Os cenários usam a unidade de cada enunciado (hora, minuto ou dia). Comparações de tempo convertem explicitamente os limites. Os PDFs não foram copiados para o repositório nem publicados; os testes incluem apenas entradas numéricas e referências.

### Divergências e ambiguidades encontradas

| Fonte / questão | Conferência e tratamento |
|---|---|
| Lista MMs, 1 | Frequências somam 1,001 por arredondamento; a média normalizada é 12 equipamentos/mês. O texto informa Wq=0,75, mas o gabarito usa Wq=0,1875 e W=0,25. Não há um conjunto que satisfaça simultaneamente essas informações. Não foi criado um caso artificial para reproduzir esse gabarito. |
| Lista MMs, 2a | Com ocupação 0,8 e Wq=15 min, W=18,75 min = 0,3125 h. O valor 9,375 e a unidade “dias” não seguem esses dados. λ=12,8/h e μ=16/h; P(W>30 min)=0,2018965 e P(Wq>15 min)=0,3594632. |
| Lista MMs, 4 | W=0,5 min; somando o trajeto de 1,5 min, o instante **médio** de chegada ao assento é exatamente o começo do jogo. Uma média não garante que a pessoa se sente antes. |
| Lista MMs, 8 | λ=40/h, μ=30/h por caixa e s=2 dão Wq=1,6 min, W=3,6 min, Lq=1,0666667 e L=2,4. O minuto observado produz outro conjunto por Little, mas é incompatível com esse M/M/2 exato. O teste também confirma que o solver rejeita todas essas entradas simultâneas. |
| Lista MMs, 10c | Com λ=0,9/min e μ=1,4/min, P(n<4)=82,921439%; 17,078561% é o complemento P(n≥4). |
| Lista MMs, 12 | “Ninguém esperando” inclui zero **ou um** cliente no sistema: P(Q=0)=P(n≤1)=5/9, não P0=1/3. |
| Lista MMs, 14c | Com λ=25/h, μ=20/h e s=2, P(Q≤4)=95,415027%, não 92,7%. O cenário satisfaz os três critérios: Lq=0,801282 e P(Wq≤30min)=99,973409%. |
| Lista MMsK, 2b | O 0,1037 publicado corresponde a sistema **cheio** (bloqueio), não meramente ocupado. P(ocupado)=1−P0=0,672215. |
| Lista MMsK, 4 | Com duas pistas e três posições de espera, K=5: Lq=0,1045433, Wq=0,4210231 min e P(Q>2)=0,00676899. Os valores publicados 0,0848/0,3455/0,0182 não correspondem a essa capacidade. |
| Lista MMsK, 5 | K=5: L=0,8494666, Wq=0,1052558 h e bloqueio=0,00676899. Os números publicados não coincidem com o enunciado; ocupado=0,5436085. |
| Lista MMsK, 6e | Dois terminais mais três vagas de espera dão K=5 e Wq=0,0350853 h. O 0,0288 publicado é próximo do resultado com **K=4 total**, outra interpretação do espaço. A calculadora exige K explícito. |
| Lista MMsN, 1 | O texto menciona três máquinas, mas determina explicitamente N=10; usado N=10, como o gabarito. Custo exato = 8(30L+10E(S)) = R$219,186156/dia; R$219,192 decorre de medidas arredondadas. A mão de obra é cobrada só durante reparos, pois pode ser realocada. |
| Lista MMsN, 2 | Medidas trocadas no gabarito: W=17,2906301 h, Wq=10,6239634 h, L=2,1937492 e Lq=1,3479156. Lq não pode ser 10,6239 em uma população de seis trens. P4=0,1353 é compatível. W médio não determina sozinho a probabilidade de ultrapassar a multa de 24h. |
| Lista MMsN, 4c | Ocupação do técnico = 1−P0=0,5070994, não 0,667. |
| Lista MMsN, 5 | Um mecânico: máquinas em operação=3,0082855; custo de máquinas paradas=R$158,674315/dia; incluindo o mecânico=R$208,674315/dia. Dois mecânicos exclusivos, cada qual para duas máquinas: R$221,081081/dia. Pelos custos declarados, um é mais barato; os totais 478,672 e 270,336 não seguem esses dados. |
| Lista MMsN, 6 | P(algum técnico ocupado)=1−P0=0,3180113; ocupação média por técnico=0,1816136. A disponibilidade individual de máquina é (N−L)/N=0,9080679, não 0,8184. |
| Apostila MMsN, p. 24 | Com N=5 e dois técnicos, ociosidade média por técnico=0,7732397; P(todos ociosos)=0,6185918. O valor 0,9279 não representa nenhuma dessas medidas. |
| Lista MG1, 1d | μ≈0,3017767, aumento≈0,0517767. O “0,05” é apenas aproximação por tentativa e erro. |
| Lista MG1, 2 | Falta a variância/distribuição de serviço. Os resultados publicados correspondem a serviço **constante**, σ²=0. A calculadora continua pedindo a variabilidade; não presume esse caso. |
| Lista MG1, 3 | Faltam atendimento e variabilidade. Os números publicados são compatíveis com uma hipótese M/M/1, mas não identificam um M/G/1 geral. Resultado permanece parcial. |
| Lista prioridades, 4b | Classe econômica: Wq=1/12 h e λ=10/h dão **Lq=5/6=0,833333**, não 0,083. As outras medidas e a razão entre esperas 0,4 são compatíveis. |
| Lista prioridades, 5 | Um servidor rápido: classe 1 tem Wq=5/24 h, W=3/8 h, **Lq=5/12 e L=3/4**; os 0,75/0,167 foram associados às medidas erradas no gabarito. Dois lentos: W1=23/44 e Wq1=25/132. Um rápido vence em W1; dois lentos vencem em Wq1, como a conclusão da lista. |
| Lista prioridades, 7 | Calcula-se novamente com λ=[0,1; 0,4; 1,5]/h e μ=3/h. Com dois servidores e interrupção: Wq=[0,0000926183; 0,0028905983; 0,0547785548] h. Sem interrupção: [0,0282485876; 0,0308166410; 0,0454545455] h. Alguns valores da tabela têm arredondamento impreciso. |
| Apostila prioridades, p. 15–17 | Lk e Lqk devem usar **λk**, não a taxa acumulada. Com interrupção e servidores exponenciais idênticos, calcula-se o L de cada prefixo M/M/s e subtrai-se o prefixo anterior. Isso preserva a soma das classes igual ao sistema agregado. |
| Apostila prioridades, p. 18–19 | Produtos: Wq1=1/18 h, W1=19/180 h, Lq1=5/9 e L1=19/18. Produto 2: Wq2=1/3 h, W2=2/5 h, Lq2=5/3 e L2=2. Há erros de transcrição nos passos intermediários do slide. |

### Recursos acrescentados a partir dos exercícios

- **Prioridades:** L, Lq, W e Wq por classe; sem interrupção e com interrupção/retomada. Taxas exponenciais iguais admitem um ou vários servidores; tempos gerais por classe admitem um servidor sem interrupção. Não se presume uma variância ausente.
- **Probabilidades de quantidade:** Q (somente fila) ou n (sistema), com `<`, `≤`, `=`, `≥` e `>`. Inclui a massa de probabilidade Q=0 e os limites de K/N.
- **Poisson:** chegadas e capacidade potencial de atendimento por servidor em um intervalo. O segundo caso supõe serviço contínuo e não equivale ao número real de saídas quando há ociosidade.
- **Indicadores finitos:** disponibilidade individual, clientes em operação, ociosidade por servidor, probabilidade de todos estarem ociosos e taxa de chegadas bloqueadas.

Os cálculos originais dos sete modelos passaram nas novas referências. Os acréscimos atendem perguntas que antes exigiam operações fora da interface. Custos, decisão de dimensionamento e interpretação das ambiguidades são conferidos nos testes e neste relatório; não foi acrescentado um otimizador de custos nem probabilidades temporais para modelos K/N ou M/G/1.

## Verificação específica de prioridades

Suíte independente: `node test-prioridades.cjs`. São **1.768 verificações**, cobrindo **79 cenários válidos e 15 conjuntos de entradas inválidas**. As verificações incluem:

- L, Lq, W e Wq por classe para os exercícios de companhia aérea, servidor rápido/dois lentos, ferramentaria, hospital, produtos com atendimento geral e viaturas.
- Prioridade sem interrupção e com interrupção/retomada; um, dois e cinco servidores; uma, duas, três, dez e vinte classes no motor (a interface permite de duas a dez).
- Conservação de L/Lq/W/Wq agregados quando os tempos de serviço têm a mesma distribuição exponencial; lei de Little por classe e conversão entre horas/minutos.
- Atendimento geral com médias distintas: conservação da espera ponderada pela carga, ΣρkWqk = ρWqFCFS. Com médias diferentes, o número total de clientes não precisa coincidir com o sistema FCFS; a disciplina pode mudar esse número. Com médias iguais, a soma também é comparada ao M/G/1 agregado.
- Carga próxima da estabilidade (ρ=0,999999), taxas inválidas, classe sem chegadas, número de servidores inválido, sistema sem equilíbrio e combinações de atendimento geral não suportadas.

Os casos já cobertos em `test-materiais.cjs` continuam ativos; a suíte específica passa a ser obrigatória antes da publicação.

Na interface, 16 cenários foram conferidos com Playwright: os exemplos acima, conferência dos valores exibidos por classe, atendimento geral, sobrecarga, entradas negativas/incompletas, limpeza, exemplo, adição/remoção de classes e unidade em dias. Verificação de largura em 320, 390 e 1366px, sem transbordamento ou erros JavaScript. Nenhum ajuste nas fórmulas foi necessário nos casos testados.

## Convenção de apresentação com interrupção — 24/11/2026
Por solicitação do usuário, a interface segue os slides 15–17 nos quadros de prioridades com interrupção: L = λ acumulado × W e Lq = λ acumulado × Wq. A taxa acumulada aparece junto de cada classe. W/Wq e os totais do sistema continuam calculados pelo motor; as contagens exibidas segundo os slides não são somadas para formar os totais. Sem interrupção, a apresentação continua usando λ da classe.

Referência solicitada: s=2, μ=5/h, λ=[0,6;1,4;2]/h. Quadros (W; Wq; L; Lq): classe 1 (0,20072;0,00072;0,12043;0,00043), classe 2 (0,21160;0,01160;0,42319;0,02319), classe 3 (0,26786;0,06786;1,07143;0,27143).

## Auditoria integral — 24/11/2026

### Inventário e cobertura

Foram relidos os nove PDFs disponíveis: quatro arquivos de slides, quatro listas e um formulário. Os dois arquivos `Teoria das filas Modelo MMs.pdf` e `Teoria das filas Modelo MMs (1).pdf` possuem o mesmo texto extraído página a página (53 páginas cada). São 156 páginas de slides contando essa cópia, ou 103 páginas de conteúdo de slides sem duplicação. Com formulário e listas, são 170 páginas, ou 117 sem a cópia. Páginas de capa, agenda, conceitos, referências e encerramento foram distinguidas de exercícios numéricos.

| Material | Páginas de regras/exemplos conferidas | Tratamento |
|---|---|---|
| MMs, 53 páginas (duas cópias) | 3–32: conceitos, Kendall, chegadas, serviços e unidades; 33–40: M/M/1; 41–43: motores e barbearia; 44–48: M/M/s; 49–50: dois canais e agência | Fórmulas, exemplos, probabilidades e inferência |
| MMsK/MMsN, 27 páginas | 3–6 e 9–12: capacidade; 7–8 e 13–14: exemplos; 15–17 e 20–22: população; 18–19 e 23–24: exemplos | Distribuição nascimento–morte e Little com taxa efetiva |
| MG1/prioridades, 23 páginas | 3–5: M/G/1; 6–7: lava-rápido/café; 8–11: prioridades; 12–17: hospital; 18–19: produtos; 20: viaturas | Variância, segundo momento, disciplina e taxa acumulada na apresentação solicitada |
| Formulário, 3 páginas | M/M/1, M/M/s, capacidade, população, M/G/1 e prioridades | Símbolos distintos mapeados para os campos da calculadora; redes de Jackson e sistemas multidimensionais não são funcionalidades implementadas |
| Listas, 11 páginas no total | MMs 1–15; MMsK 1–6; MMsN 1–6; MG1/prioridades 1–7 | As divergências e dados insuficientes constam da tabela anterior; não se cria uma hipótese oculta para forçar o gabarito |

### Regras de entrada e cálculo

| Modelo/regra | Conferência |
|---|---|
| Taxas e tempos | λ = 1/TMC; μ = 1/TMS. μ é por servidor. Conversões de taxa são inversas às de tempo; variância converte com o quadrado do fator. Mês = 30 dias, explicitamente. |
| M/M/1 | λ < μ; Pn=(1−ρ)ρⁿ; P(N>r)=ρ^(r+1); L=λ/(μ−λ); W=1/(μ−λ); Wq=W−1/μ; Lq=λWq. |
| M/M/s | λ < sμ; normalização de P0 e Erlang C equivalentes aos slides; Lq=Cρ/(1−ρ); Wq=Lq/λ; L=Lq+λ/μ. As probabilidades temporais usam fila e atendimento separados. |
| M/M/1/K e M/M/s/K | K é capacidade total, incluindo atendimento. Taxa efetiva λef=λ(1−PK). W=L/λef e Wq=Lq/λef. λ≥sμ é permitido porque a capacidade é finita. O caso λ=sμ também é resolvido, sem dividir por zero. |
| M/M/1/N e M/M/s/N | N é a população. λ é por fonte em operação; λn=(N−n)λ e μn=min(n,s)μ. λef=λ(N−L)=μE(S). W e Wq usam λef. Não confundir Nλ/(sμ), uma carga potencial, com a ocupação real E(S)/s. |
| M/G/1 | λ<μ; Lq=[λ²σ²+(λ/μ)²]/[2(1−λ/μ)]. Serviço exponencial tem σ²=1/μ²; constante tem σ²=0; segundo momento E[S²]=σ²+1/μ². Média sozinha não determina a variabilidade. |
| Prioridade sem interrupção | Maior prioridade primeiro, sem suspender o serviço iniciado. Para taxas iguais exponenciais, usa-se a fórmula de carga acumulada do slide 11. Para atendimento geral por classe, a fórmula de segundo momento exige um servidor e ausência de interrupção. L/Lq usam λ da classe, como nos slides 13–14 e no exemplo de produtos. |
| Prioridade com interrupção | O motor calcula tempos por classes acumuladas M/M/s e diferenças de L, como nos slides 16–17. A expressão simples do slide 10 coincide com o caso de um servidor; não deve ser estendida para s>1 apenas substituindo s. A interface mantém a apresentação pedida pelo usuário: L e Lq multiplicados por λ acumulado, como nos slides 15–17. |
| Totais de prioridades | O sistema completo é a média física agregada. Os L/Lq exibidos com λ acumulado são a convenção do material e não podem ser somados como contagens de classes disjuntas. Tempos agregados são ponderados pelas taxas, não somas simples dos tempos de cada classe. |
| Probabilidades | “No máximo” é ≤; “mais de” é >; “exatamente” é =. Para a fila Q=max(N−s,0). P(Q=0) inclui pessoas em atendimento e não se reduz a P0. Limites de tempo são convertidos da unidade escolhida para a unidade do cálculo. |
| Contagens de atendimento | Poisson com média μt descreve atendimentos potenciais de um servidor continuamente ocupado; não deve ser apresentado como as saídas reais de um servidor sujeito a ociosidade. |

### Referências numéricas dos exemplos básicos

Os valores abaixo foram recalculados por uma referência independente em Python com frações exatas, confrontados com `dist/engine.js` e congelados em `fixtures/slides.json`. Há 18 cenários e 175 medidas verificadas, incluindo P0, ocupação e taxa efetiva, além das quatro medidas abaixo. Tempos usam a unidade do enunciado: minutos para posto, bancos de capacidade finita e inspeção; mês para motores; horas nos demais casos.

| Slides / página / variante | L | Lq | W | Wq |
|---|---:|---:|---:|---:|
| MMs p. 29 — Posto | 4,00000 | 3,20000 | 3,33333 | 2,66667 |
| MMs p. 42 — Motores | 7,33333 | 6,45333 | 0,66667 | 0,58667 |
| MMs p. 43 — Barbearia | 3,00000 | 2,25000 | 1,00000 | 0,75000 |
| MMs p. 49 — Dois canais | 3,42857 | 1,92857 | 0,11429 | 0,06429 |
| MMs p. 50 — Agencia | 1,29412 | 0,09412 | 2,15686 | 0,15686 |
| MMsK/MMsN p. 7 — Banco K=2 | 0,67347 | 0,18367 | 2,75000 | 0,75000 |
| MMsK/MMsN p. 8 — Banco K=5 | 1,70092 | 1,00505 | 0,61108 | 0,36108 |
| MMsK/MMsN p. 13 — SAC um | 1,58110 | 0,91057 | 0,33686 | 0,19400 |
| MMsK/MMsN p. 13 — SAC dois | 0,80112 | 0,09077 | 0,16111 | 0,01826 |
| MMsK/MMsN p. 14 — Inspecao | 6,06310 | 3,09202 | 12,24425 | 6,24425 |
| MMsK/MMsN p. 18 — Maquinas um | 1,52439 | 0,84634 | 17,98565 | 9,98565 |
| MMsK/MMsN p. 19 — Robos um | 0,63952 | 0,20347 | 4,39990 | 1,39990 |
| MMsK/MMsN p. 23 — Maquinas dois | 0,81120 | 0,07610 | 8,82816 | 0,82816 |
| MMsK/MMsN p. 24 — Robos dois | 0,46479 | 0,01127 | 3,07458 | 0,07458 |
| MG1 p. 6 — Lava-rapido exponencial | 2,00000 | 1,33333 | 0,50000 | 0,33333 |
| MG1 p. 6 — Lava-rapido constante | 1,33333 | 0,66667 | 0,33333 | 0,16667 |
| MG1 p. 7 — Cafe exponencial | 1,66667 | 1,04167 | 0,06667 | 0,04167 |
| MG1 p. 7 — Cafe constante | 1,14583 | 0,52083 | 0,04583 | 0,02083 |

A inferência da barbearia (p. 43g) também foi conferida: μ=4/h e W=1,25 h implicam λ=3,2/h. No café (MG1 p. 7d), o tempo exponencial necessário é aproximadamente 72,98190 segundos, compatível com 73 segundos no slide. As razões entre filas constante/exponencial dos exemplos de MG1 são 0,5.

### Pontos que impedem dizer que todos os números impressos coincidem

- **MMs p. 42:** a unidade do limite “1” em P(W>1)/P(Wq>1) não foi especificada. Converter meses em dias exige uma duração de mês. A expressão “número médio ... em dias” mistura quantidade e tempo.
- **MMs p. 50e:** P(N>5)=0,0090352941; o slide informa 0,0091, que não é o arredondamento direto a quatro casas.
- **MMsK/MMsN p. 13:** o SAC alterna quatro e cinco ligações “em espera”. Os cenários congelados usam K=5 total, como o pedido de P5 sugere. Se o espaço de espera continuar em quatro posições ao adicionar o segundo atendente, K passa a 6; trata-se de outro cenário, que pode ser informado explicitamente.
- **MMsK/MMsN p. 14e:** Wq=6,24424779 min; o slide imprime 6,2439. W=12,24424779 min e as demais medidas principais conferem. Recusas=30,28921998 carros/h, compatível com 30,29.
- **MMsK/MMsN p. 24c:** ociosidade média por técnico=0,77323972 (77,32397%); todos os técnicos ociosos=P0=0,61859178. O 0,9279 impresso não corresponde a essas medidas.
- **MG1/prioridades p. 15–17:** os quadros com interrupção usam taxa acumulada em L/Lq. Essa convenção foi mantida na interface por solicitação expressa; não é a contagem física de uma classe isolada. Pequenas diferenças adicionais nos últimos dígitos decorrem de arredondamentos intermediários do material.
- **MG1/prioridades p. 19:** para o produto 1, Wq=0,05555556 h, W=0,10555556 h, Lq=0,55555556 e L=1,05555556. O slide aproxima Wq/W para 0,06/0,11 e chega a imprimir Lq1≈1,10, que não segue a subtração mostrada. A carga acumulada correta é 0,83333333, não 0,88. Para o produto 2: Wq=1/3 h, W=0,4 h, Lq=5/3 e L=2.
- **Conceitos:** a frase de MMs p. 5 sobre filas se formarem porque a demanda excede a capacidade precisa de qualificação: a variabilidade pode formar filas mesmo com λ<sμ. Em MG1 p. 4, a referência a intervalos de “atendimentos” exponenciais implicando chegadas Poisson troca o processo de serviço pelo de chegadas. Os modelos da calculadora assumem chegadas Poisson explicitamente.

Os conceitos gerais de redes/múltiplos estágios e as distribuições D/Erlang/G de chegada citados na introdução não são outros modelos implementados pela calculadora. Não se deve usar M/M/s automaticamente só porque um exemplo tem vários servidores: as hipóteses de chegada e serviço ainda precisam ser satisfeitas.

### Verificação executada nesta revisão

As cinco suítes existentes passaram: 97 + 196 + 58 + 3.396 + 1.768 = **5.515 verificações**. A nova `node test-slides.cjs` passou em **365 verificações**: 175 medidas básicas e 190 verificações de apresentação de prioridades, cobrindo os quatro casos do hospital dos slides e o cenário da foto, em horas e minutos, inclusive os totais físicos e a indicação da convenção acumulada. Total desta revisão: **5.880 verificações automatizadas**.

A apresentação foi exercitada chamando o formulário real em um DOM simulado e inspecionando o HTML produzido; esta revisão não fez uma nova inspeção visual em navegador. Os resultados de referência dos slides foram conferidos adicionalmente por fórmulas independentes com frações exatas. Não foi encontrado desvio do motor nos cenários auditados. Isso não significa que os gabaritos do material sejam internamente consistentes, nem que funcionalidades não implementadas tenham sido validadas.
