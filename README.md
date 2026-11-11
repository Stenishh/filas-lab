# Filas Lab

Calculadora em português para sete modelos de filas. Abra `dist/index.html` no navegador, sem instalar dependências, ou execute `python3 -m http.server 8765 --directory dist` nesta pasta.

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
