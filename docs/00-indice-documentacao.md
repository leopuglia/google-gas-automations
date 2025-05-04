# Índice de Documentação do GAS Builder

Este documento serve como ponto central de navegação para toda a documentação do projeto Google Apps Script Builder. A documentação está organizada de acordo com as etapas e fases definidas no [roadmap](./00-roadmap-gas-builder.md).

## Estrutura da Documentação

A nomenclatura dos arquivos segue o padrão:
- `00-*`: Documentos principais e de navegação
- `1x-*`: Documentos relacionados à Etapa 1 (Migração para a Raiz e Refinamento)
- `2x-*`: Documentos relacionados à Etapa 2 (Migração para Repositório Separado)
- `3x-*`: Documentos relacionados à Etapa 3 (Evolução para Biblioteca/CLI)

O segundo dígito indica a fase específica dentro da etapa, e o sufixo descreve o tipo de documento:
- `-plano-*`: Documentos de planejamento
- `-guia-*`: Guias e tutoriais
- `-ref-*`: Documentação de referência
- `-impl-*`: Detalhes de implementação

## Documentos Principais

- [00-roadmap-gas-builder.md](./00-roadmap-gas-builder.md) - Visão geral do plano de evolução do sistema
- [00-indice-documentacao.md](./00-indice-documentacao.md) - Este documento de índice

## Etapa 1: Migração para a Raiz e Refinamento

### Fase 1.1-1.4: Migração Básica, Refinamentos e Aprimoramentos (Concluído)

- [10-plano-migracao-gas-builder.md](./10-plano-migracao-gas-builder.md) - Plano de migração do sistema para a raiz
- [10-impl-gas-builder.md](./10-impl-gas-builder.md) - Detalhes da implementação do sistema de build

### Fase 1.5: Testes e Estabilização

- [15-plano-testes-estabilizacao.md](./15-plano-testes-estabilizacao.md) - Plano para estabilização de testes
- [15-impl-estabilizacao-testes.md](./15-impl-estabilizacao-testes.md) - Relatório de implementação da estabilização

### Fase 1.6: Migração do Projeto VilladasPedras

- [16-guia-migracao-projetos.md](./16-guia-migracao-projetos.md) - Guia para migração de projetos existentes

### Fase 1.7: Documentação Avançada

- [17-plano-melhorias-documentacao.md](./17-plano-melhorias-documentacao.md) - Plano detalhado para melhorias na documentação
- [17-guia-documentacao-codigo.md](./17-guia-documentacao-codigo.md) - Guia para documentação de código (JSDoc/TSDoc)
- [17-ref-arquitetura.md](./17-ref-arquitetura.md) - Documentação da arquitetura do sistema

## Etapa 2: Migração para Repositório Separado

### Referência e Configuração

- [20-ref-configuracao-yaml.md](./20-ref-configuracao-yaml.md) - Referência completa do arquivo de configuração YAML
- [20-guia-sistema-build.md](./20-guia-sistema-build.md) - Guia de uso do sistema de build

## Guias de Uso

- [90-guia-inicio-rapido.md](./90-guia-inicio-rapido.md) - Guia de início rápido para novos usuários
- [91-guia-troubleshooting.md](./91-guia-troubleshooting.md) - Guia de solução de problemas comuns

## Conexão com o Roadmap

Cada documento de documentação está diretamente vinculado a uma fase específica do roadmap. Consulte o [roadmap](./00-roadmap-gas-builder.md) para entender o contexto e o cronograma de cada componente da documentação.

## Próximos Documentos Planejados

De acordo com o [plano de melhorias da documentação](./17-plano-melhorias-documentacao.md), os seguintes documentos serão criados nas próximas fases:

- `17-ref-api.md` - Documentação da API do sistema de build
- `17-guia-diagramas.md` - Diagramas de arquitetura e fluxo de trabalho
- `20-guia-criacao-projeto.md` - Tutorial para criação de um novo projeto
- `20-guia-deploy.md` - Guia para deploy em diferentes ambientes
- `20-exemplos-praticos.md` - Exemplos práticos de uso do sistema

## Versões em Inglês (Planejado)

Como parte da internacionalização do projeto, versões em inglês da documentação serão criadas com o prefixo `en-` antes do nome do arquivo (por exemplo, `en-00-roadmap-gas-builder.md`).
