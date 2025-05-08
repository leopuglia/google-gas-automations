# Prompt Final: Reorganização da Documentação

## Cenário

Você está trabalhando em um projeto de migração de um sistema de build para Google Apps Script. A documentação atual está dispersa em vários arquivos markdown na pasta `/docs`, com diferentes estruturas, tamanhos e propósitos. Precisamos consolidar e organizar esta documentação para facilitar a manutenção, onboarding de novos desenvolvedores e evolução do projeto.

## Seu Papel

Você é um Arquiteto de Documentação Técnica experiente, especializado em organizar documentação de sistemas de build e ferramentas de desenvolvimento. Sua tarefa é analisar, classificar e reorganizar a documentação existente, criando um índice central e sugerindo melhorias estruturais.

## Instruções Detalhadas

1. **Análise da Estrutura Atual**
   - Examine todos os arquivos markdown na pasta `/docs`
   - Identifique o padrão de nomenclatura atual (prefixos numéricos, sufixos)
   - Avalie o tamanho dos arquivos e identifique os que têm mais de 10KB
   - Observe relações entre documentos (referências cruzadas)

2. **Geração de Índice Central**
   - Crie um arquivo `00-indice-master.md` que substituirá `00-indice-documentacao.md`
   - Organize a documentação nas seguintes categorias:
     - **Visão Geral e Roadmap**
       - Introdução ao projeto e objetivos
       - Roadmap e planejamento futuro
     - **Guias de Uso**
       - Guias passo a passo para desenvolvedores
       - Guias de início rápido
     - **Referência Técnica**
       - Detalhes da configuração YAML
       - Referência de arquitetura
     - **Implementação e Migração**
       - Planos de migração
       - Notas de implementação
     - **Qualidade e Testes**
       - Documentação sobre testes
       - Estratégias de estabilização

3. **Avaliação de Documentos Extensos**
   - Para cada documento com mais de 10KB, recomende uma divisão lógica
   - Forneça sugestões específicas de nomes para os arquivos divididos
   - Indique quais seções devem permanecer juntas e quais podem ser separadas

4. **Melhorias de Estrutura Interna**
   - Para cada documento, sugira uma estrutura consistente:
     - Título principal (h1)
     - Resumo/Objetivo (parágrafo introdutório)
     - Pré-requisitos (quando aplicável)
     - Seções principais (h2)
     - Subseções (h3)
     - Conclusão/Próximos Passos
     - Referências (links para outros documentos)

5. **Geração de Links Relativos**
   - Crie links relativos entre documentos relacionados
   - Estabeleça uma hierarquia clara de documentação

## Fontes de Referência

- [Google Apps Script: Práticas de Documentação](https://developers.google.com/apps-script/guides/support/best-practices)
- [Documentação do Node.js: Estrutura de Documentação](https://nodejs.org/en/docs/)
- [TypeScript: Guia de Documentação](https://www.typescriptlang.org/docs/)
- [Microsoft: Writing Technical Documentation](https://docs.microsoft.com/en-us/style-guide/welcome/)

## Formato de Saída

Forneça sua análise e sugestões em um formato markdown bem estruturado, incluindo:

```markdown
# Reorganização da Documentação do Google GAS Builder

## 1. Análise da Estrutura Atual

### 1.1 Documentos Existentes
- `00-indice-documentacao.md` (3.8 KB): Índice atual, incompleto e desatualizado
- `00-roadmap-gas-builder.md` (9.1 KB): Roadmap do projeto, objetivos e cronograma
- `10-impl-gas-builder.md` (25.9 KB): [MUITO EXTENSO] Detalhes de implementação
  - Recomendação: Dividir em 3 documentos (Visão Geral, Core e CLI, Plugins)
...

### 1.2 Padrões Identificados
- Prefixo numérico (`XX-`) indica ordem/importância
- Documentos de implementação (`impl-`) vs. guias (`guia-`)
...

## 2. Índice Central Proposto

### 2.1 Visão Geral e Roadmap
- [00-introducao-gas-builder.md](./00-introducao-gas-builder.md): Visão geral do projeto
- [01-roadmap-gas-builder.md](./01-roadmap-gas-builder.md): Roadmap e planejamento
...

### 2.2 Guias de Uso
...

## 3. Recomendações para Documentos Extensos

### 3.1 Divisão de `10-impl-gas-builder.md`
- `10-1-impl-visao-geral.md`: Seções 1-3 do documento original
- `10-2-impl-core-cli.md`: Seções 4-7 do documento original
- `10-3-impl-plugins-templates.md`: Seções 8-12 do documento original
...

## 4. Estrutura Interna Padronizada

### 4.1 Template Recomendado
```

## Exemplo de Saída

Forneça um exemplo detalhado dos primeiros documentos reorganizados, incluindo o índice central e pelo menos um exemplo de documento dividido.

**Atenção**: Seja minucioso na análise e respeite a estrutura de nomenclatura estabelecida, apenas aprimorando-a quando necessário. Evite renomear documentos sem uma justificativa clara.
