---
name: Filas Lab
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

# Design System: Filas Lab

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

Georgia nos títulos editoriais e no número principal; a pilha sans-serif do sistema nos controles, tabelas e explicações. Números usam variantes tabulares. Títulos de seção são compactos; unidades e textos auxiliares permanecem menores. No mobile, o resultado principal usa 32px.

## Layout

Contêiner com largura máxima de 1360px e margem interna horizontal de 4,5%. A área de trabalho usa uma coluna de configuração de 370px e outra flexível. Até 900px, a configuração passa a 320px. Até 700px, os painéis se empilham, com preenchimento de 23px. Navegação quebra em linhas. A explicação final usa três colunas, empilhadas no mobile.

## Elevation & Depth

Sem sombras. Bordas finas e fundos tonais criam separação; o painel de resultado recebe uma superfície verde clara.

## Shapes

Cantos suavemente arredondados em controles, resultado e área de trabalho, conforme tokens. Divisórias horizontais estruturam tabelas e detalhes expansíveis.

## Components

Botão principal verde, de largura total e rótulo semibold. Botões secundários transparentes com borda. Navegação de modelos usa preenchimento verde profundo no item ativo. Campos trazem unidades visíveis; foco de teclado usa contorno de 3px e afastamento de 3px. A tabela mantém descrição à esquerda e valores à direita. Detalhes expansíveis guardam fórmulas, referências e distribuições. Sem animações de entrada.

## Do's and Don'ts

- Do manter unidades explícitas junto aos campos e resultados.
- Do usar números tabulares nas medidas.
- Do empilhar configuração e resultados em telas pequenas.
- Don't adicionar sombras às superfícies planas existentes.
- Don't depender de fontes ou imagens externas para a identidade.
