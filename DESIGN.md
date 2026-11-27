---
name: Teoria das Filas
description: Calculadora acadêmica de teoria das filas
colors:
  paper: "#f6f5f0"
  ink: "#153d34"
  accent: "#22654c"
  muted: "#53665c"
  line: "#d7ddd5"
  surface: "#ffffff"
  result: "#eef2e9"
  status: "#edf2e8"
  input-border: "#bbc7bd"
  focus: "#b27a2a"
typography:
  display:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(36px, 4.5vw, 60px)"
    fontWeight: 400
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontSize: "18px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  label:
    fontSize: "13px"
    fontWeight: 600
rounded:
  control: "6px"
  result: "8px"
  workspace: "12px"
spacing:
  compact: "8px"
  field: "16px"
  section: "24px"
  panel: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "14px 17px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  status:
    backgroundColor: "{colors.status}"
    textColor: "{colors.ink}"
    padding: "5px 9px"
---

# Design System: Teoria das Filas

## Overview

**Creative North Star: "Folha de estudo"**

Uma folha de estudo serena: verde escuro sobre papel quente, controles claros e resultados em tabela aberta. A tipografia editorial dá identidade sem competir com a leitura matemática.

**Key Characteristics:**
- Papel quente e verde profundo.
- Hierarquia editorial discreta.
- Resultados abertos, sem excesso de caixas.

## Colors

O verde profundo identifica texto e navegação ativa; o verde de destaque orienta a ação principal. Papel, branco e tons suaves separam página, painéis e resultado. A cor muted identifica apoio e unidades; line organiza divisórias. O foco usa um contorno ocre visível.

## Typography

Georgia nos títulos editoriais e no número principal; a pilha sans-serif do sistema nos controles, tabelas e explicações. Números usam variantes tabulares. Títulos de seção são compactos; unidades e textos auxiliares permanecem menores. O título do modelo usa 40px, reduzido para 34px até 480px. Símbolos dos resultados usam Georgia em 15px; valores da tabela usam 12px.

## Layout

Duas telas: escolha do modelo em linhas editoriais clicáveis, seguida do formulário e dos resultados. Contêiner com largura máxima de 1360px e margem horizontal de 4,5%. A seleção usa duas colunas, com notação, descrição e seta; até 850px vira uma coluna. A área de cálculo divide configuração e resultados na proporção 1,1:1; até 850px os painéis se empilham. Os grupos de campos usam duas colunas, reduzidas a uma até 480px. Resultados ficam fixos durante a rolagem em telas amplas. A explicação final usa três colunas, empilhadas até 700px.

## Elevation & Depth

Sem sombras. Bordas finas e fundos tonais criam separação; o painel de resultado recebe uma superfície verde clara.

## Shapes

Cantos suavemente arredondados em controles, resultado e área de trabalho, conforme tokens. Divisórias horizontais estruturam tabelas e detalhes expansíveis.

## Components

A seleção de modelo usa links largos com notação serifada, descrição discreta e seta. O formulário apresenta campos livres inicialmente vazios; dados adicionais ficam em detalhes expansíveis. Cada controle combina valor e unidade em uma borda comum; taxas, tempos e variâncias possuem seletor próprio. Rótulos mostram nome e símbolo, sem obrigar a escolher uma combinação de entradas.

Botão principal verde, de largura total e rótulo semibold. Botões secundários transparentes com borda. Foco de teclado usa contorno ocre de 3px, com destaque verde no grupo de valor e unidade. A tabela mantém descrição à esquerda e valores à direita, distinguindo dados informados de calculados. O status comunica cálculo parcial, completo ou inconsistência. Os resultados se atualizam após uma pausa de 400ms na digitação, e o botão permite calcular imediatamente. Detalhes guardam inferências, fórmulas, referências e probabilidades. Sem animações de entrada.

## Do's and Don'ts

- Do manter unidades explícitas junto aos campos e resultados.
- Do usar números tabulares nas medidas.
- Do empilhar configuração e resultados em telas pequenas.
- Don't adicionar sombras às superfícies planas existentes.
- Don't depender de fontes ou imagens externas para a identidade.


## Organização da calculadora — novembro de 2026

Modo Operate: dados do enunciado → atendimento/variabilidade quando aplicável → ação de calcular → informações adicionais opcionais. Formulário e resultados usam dois painéis separados por espaço, mantendo o papel quente e o verde. Taxas e tempos ficam visíveis; medidas conhecidas, probabilidades e variabilidade alternativa ficam em detalhes expansíveis. As dicas de interpretação de M/G/1 permanecem junto ao seletor, em uma seção expansível.

L, Lq, W e Wq aparecem primeiro em uma grade aberta de duas colunas com unidade explícita e divisórias finas; dados ausentes mostram um travessão e “Aguardando dados”. Taxas, ocupação e demais medidas ficam em uma tabela expansível. Resultados parciais continuam mostrando somente valores disponíveis. Abaixo de 850px, os painéis se empilham; abaixo de 600px, campos usam uma coluna, mantendo os quatro resultados em duas colunas. Espaçamento segue base de 4px, com 8/12/16/24/32/40px; sem sombras ou animações de entrada.


### Uniformidade dos resultados
Todas as medidas numéricas usam a mesma grade aberta de duas colunas: símbolo e descrição, valor em destaque, unidade e contexto. Taxas, ocupação, variabilidade, tempos, indicadores finitos e classes de prioridade seguem o mesmo padrão de L/Lq/W/Wq. Consultas de probabilidade e a distribuição também usam essa apresentação. Os grupos do resultado são visíveis; a distribuição completa permanece expansível. O painel de resultados acompanha a rolagem normal para acomodar todos os grupos.

### Ajuda para localizar perguntas
Um painel expansível dentro da página do modelo, abaixo do título e antes do formulário, recebe a pergunta do enunciado; ele não aparece na página inicial. A orientação usa uma lista aberta com o nome exato da seção e instruções do campo a preencher, com a mesma paleta do projeto. A resposta mostra seção e campo pelo nome da tela e mantém o botão de navegação, que abre os detalhes necessários e move o foco ao destino sem alterar entradas. A ajuda fica oculta na impressão.

### Dados sugeridos a partir do enunciado
A ajuda aceita o enunciado completo e separa dados de entrada da orientação sobre o resultado. As sugestões usam linhas abertas com nome do campo, valor/unidade, conversão e trecho identificado, seguidos de “Usar este valor”. O preenchimento é explícito por campo e preserva valores existentes. Ambiguidades são descritas junto das sugestões; perguntas de limite de espera não são tratadas como tempo de serviço.

### Conferência do modelo pelo enunciado
Antes dos dados identificados, a ajuda apresenta o modelo compatível com os indícios, a justificativa e hipóteses a confirmar. Links “Abrir [modelo]” mantêm o enunciado e refazem a análise no destino. Quando faltam dados ou a combinação não é oferecida, a interface explica a limitação sem trocar de modelo automaticamente.

### Trechos curtos do enunciado
A ajuda aceita trechos individuais e usa o exercício dos caminhões como exemplo na interface. Para um tempo isolado, mostra três escolhas de significado antes de sugerir um campo. Dados fixos pelo modelo, como um servidor em M/M/1, aparecem como informação sem botão para um campo indisponível.
