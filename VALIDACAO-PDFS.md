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
