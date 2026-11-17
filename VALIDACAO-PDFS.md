# Validação com o material da disciplina

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
