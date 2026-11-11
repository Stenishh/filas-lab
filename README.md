# Filas Lab

Calculadora em português dos sete modelos de filas pedidos. Abra `dist/index.html` no navegador, sem instalar dependências, ou execute `python3 -m http.server 8765 --directory dist` nesta pasta.

Execute `node test-engine.cjs` para verificar o motor matemático.

Entradas por taxa, tempo médio ou contagem/intervalo, com unidades independentes. M/M/1 também aceita nove combinações de medidas conhecidas. M/G/1 aceita CV, desvio padrão, variância ou segundo momento do atendimento. Resultados: L, Lq, W, Wq, ocupação, P0, taxa efetiva, probabilidades de espera/bloqueio quando aplicáveis e P(n). M/M/1 e M/M/s calculam P(n>r), P(W>t) e P(Wq>t).

Convenções confirmadas: K inclui quem aguarda e quem está em atendimento; N é população finita e λ é a taxa individual de um cliente fora do sistema. Disciplina FCFS, servidores idênticos e independência entre chegadas e serviços. Para modelos ilimitados é preciso λ < sμ. Populações/capacidades até 10.000, servidores até 1.000.

Material local consultado: `../Material de referencia/Teoria das filas Modelo MMs.pdf`, Prof. Dr. Paulo Roberto Maia, páginas 20–50. O material detalha M/M/1 e M/M/s; os demais usam equilíbrio de nascimento e morte e Pollaczek–Khinchine. Exemplos iniciais são ilustrativos.

Nos resultados infinitos, a tabela de P(n) mostra um trecho, e a consulta aceita n até 100.000. Em M/G/1 não se infere P(n) da média e variância. Valores são arredondados para cinco casas decimais; dados extremamente pequenos/grandes podem ultrapassar a precisão de ponto flutuante.
