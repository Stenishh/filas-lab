# Teoria das Filas

Calculadora em português para sete modelos de filas e disciplinas de prioridade. Abra `dist/index.html` no navegador, sem instalar dependências, ou execute `python3 -m http.server 8765 --directory dist` nesta pasta.

## Fluxo

A página inicial permite escolher M/M/1, M/M/s, M/M/1/K, M/M/s/K, M/M/1/N, M/M/s/N ou M/G/1. O link `#/modelo/MM1` (ou outro código) abre a página de dados do modelo. Os campos começam vazios; basta preencher o que se conhece. Não existe uma seleção de combinações de informações. A inferência acontece após uma breve pausa na digitação, ou pelo botão de calcular. Dados inferidos são mostrados nos resultados, sem preencher ou sobrescrever as entradas do usuário.

Informe s, K e N quando aplicáveis. Taxas, tempos e contagens têm unidades independentes. Também podem ser informados L, Lq, W, Wq, ocupação, P0, λ/μ, U, taxa efetiva, clientes em atendimento e probabilidades de espera/bloqueio. M/G/1 aceita CV, desvio padrão, variância e segundo momento, inclusive zero quando válido.

O motor usa a lei de Little, relações entre tempos, equilíbrio de nascimento e morte e Pollaczek–Khinchine. Para modelos exponenciais, a razão λ/μ determina as medidas sem dimensão temporal; uma taxa ou um tempo determina a escala. O motor resolve essa razão numericamente quando necessário. Medidas redundantes não contam como informações independentes. Resultados parciais mostram apenas o que os dados permitem determinar. Entradas ausentes não recebem valores padrão. Dados incompatíveis são rejeitados, inclusive em cálculos parciais, com tolerância relativa de 0,5% para arredondamentos.

## Convenções e referências

K inclui quem aguarda e quem está em atendimento; N é a população finita e λ é a taxa individual por cliente fora do sistema. Disciplina FCFS, servidores idênticos, independência entre chegadas e serviços. Modelos ilimitados exigem λ < sμ. Capacidades/populações até 10.000, servidores até 1.000.

Material consultado em `../Material de referencia/`: `Teoria das filas Modelo MMs.pdf`, Prof. Dr. Paulo Roberto Maia (páginas 20–50), e `Formulário M008 Capítulo 7.pdf` (páginas 1–3).

Equivalências com o formulário: E(q)=L, E(w)=Lq, E(tq)=W, E(tw)=Wq e E(S)=clientes em atendimento. O ρ do formulário significa λ/μ; a interface distingue essa razão, a ocupação média por servidor λef/(sμ) e U=1−P0 (probabilidade de o sistema estar ocupado).

Consultas adicionais: P(n), distribuição em gráfico/tabela e, para M/M/1 e M/M/s, P(n>r), P(W>t) e P(Wq>t). M/G/1 não determina toda P(n) apenas com média e variância. A tabela de probabilidades ilimitadas mostra um trecho; a consulta aceita n até 100.000. Resultados usam cinco casas decimais, com duas nas porcentagens. Cargas muito próximas dos limites, grandezas extremas e inferências mal condicionadas podem ultrapassar a precisão numérica. O cálculo inverso busca λ/μ no intervalo aproximado exp(−18) a exp(18), limitado pela estabilidade nos modelos ilimitados; se não encontra uma solução válida, avisa sem inventar valores.

## Verificação

`node test-engine.cjs` verifica as fórmulas e exemplos da apostila. `node test-solver.cjs` verifica as inferências nos sete modelos, resultados parciais, variabilidade e rejeição de inconsistências.

Validação específica dos exercícios: `node test-exemplos-pdf.cjs`. Resultados, hipóteses de unidades e a divergência do gabarito do slide 50 estão em `VALIDACAO-PDFS.md`. A unidade Mês adota explicitamente 30 dias.


## Ampliação pelos materiais de referência

Além dos sete modelos originais, **Prioridades** calcula L, Lq, W e Wq por classe, da maior para a menor prioridade. Informe o número de servidores e as taxas de todas as classes; a classe 1 tem preferência. O atendimento exponencial com taxa comum aceita um ou vários servidores, com ou sem interrupção e retomada. Atendimento geral com taxa e variância por classe exige **um servidor, sem interrupção**. Nesse modo, todas as entradas usam a unidade dos resultados; variâncias usam a unidade ao quadrado. O formulário não infere taxas ausentes por classe.

As consultas de quantidade distinguem clientes **no sistema** de clientes **aguardando** e aceitam exatamente, menos de, no máximo, pelo menos e mais de, inclusive nos modelos finitos. Para M/M/1 e M/M/s, há também contagens de Poisson: chegadas ou atendimentos potenciais de um servidor continuamente ocupado. Estes últimos não representam as saídas reais de um servidor que pode ficar ocioso.

Nos modelos N, os resultados mostram clientes em operação, disponibilidade por cliente e ociosidade média por servidor, separada da probabilidade de todos estarem ociosos. Nos modelos K, mostram a taxa de chegadas recusadas e distinguem sistema ocupado de sistema cheio.

Execute `node test-materiais.cjs` para conferir 56 cenários adicionais das listas e apostilas, inferências, prioridades, probabilidades, metas e custos. Os valores de referência em `fixtures/exercicios.json` foram calculados separadamente com aritmética racional exata; podem ser regenerados com `python3 scripts/generate-reference-fixtures.py`, sem dependências externas. Os testes não exigem os PDFs locais. Inconsistências, hipóteses e questões sem dados suficientes estão em `VALIDACAO-PDFS.md`.

## Publicação

Site: https://stenishh.github.io/filas-lab/

O workflow `.github/workflows/pages.yml` executa as cinco suítes de testes antes de publicar apenas `dist/`. Atualizações na branch `main` são publicadas automaticamente quando os testes passam.

Em M/G/1, o seletor **Tipo de atendimento** permite escolher Exponencial (CV=1 automático), Constante (CV=0 automático) ou Geral/não informado (variabilidade manual). As chegadas já são de Poisson; isso não determina a variabilidade do atendimento. Dados adicionais de variabilidade continuam sendo conferidos para detectar inconsistências.

Verificação específica das disciplinas de prioridade: `node test-prioridades.cjs` (1.768 verificações, 79 cenários válidos e 15 entradas inválidas). Essa suíte também é executada antes da publicação no Pages.

## Localizar uma pergunta do enunciado
Depois de escolher o modelo de fila, abra **Onde resolvo esta pergunta?**, digite uma pergunta por vez e clique em **Indicar seção e campo**. A resposta informa o nome exato da seção da calculadora e qual campo usar, e mantém o botão **Ir até essa parte**, que abre a seção e leva o foco ao campo, sem preencher dados. A ajuda não aparece na página inicial. Por exemplo, “exatamente 3 clientes no sistema” indica **Consultar probabilidade P(n) → Número de clientes no sistema · n**; “esperar mais de 12 minutos” indica **Probabilidades de exceder um limite → Tempo**; “no máximo 3 clientes” indica **Comparar quantidade de clientes**. A interpretação é local, baseada em expressões comuns em `dist/question-guide.js`; consultas não reconhecidas ou indisponíveis são sinalizadas. Execute `node test-question-guide.cjs` para conferir os encaminhamentos.
