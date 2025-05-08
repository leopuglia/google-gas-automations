# Roadmap: GAS Builder

> Última atualização: 06/05/2025

## Resumo

Este documento descreve o plano de evolução do sistema de build para projetos Google Apps Script, dividido em etapas graduais que vão desde um sistema interno até uma biblioteca completa com CLI.

## Visão Geral da Abordagem

A evolução do GAS Builder seguirá três etapas principais:

1. **Etapa 1**: Migração para a raiz e refinamento (atual)
2. **Etapa 2**: Migração para repositório separado como template/starter
3. **Etapa 3**: Evolução para biblioteca/CLI independente

Esta abordagem gradual permite:

- Refinar o sistema antes de torná-lo público
- Coletar feedback em cada etapa
- Garantir que o sistema seja útil e utilizável antes de investir em uma CLI completa
- Permitir que desenvolvedores adaptem o sistema às suas necessidades específicas

## Etapa 1: Migração para a Raiz e Refinamento (Atual)

### Objetivos

- Criar uma base sólida para o sistema de build
- Refinar o código e a estrutura
- Testar com projetos reais
- Desenvolver documentação inicial

### Tarefas

#### Fase 1.1: Migração Básica (Concluído)

- [x] Mover scripts para a raiz do projeto
- [x] Ajustar caminhos e dependências
- [x] Criar documentação inicial

#### Fase 1.2: Refinamentos e Qualidade de Código (Concluído)

- [x] Melhorar organização do código
- [x] Configurar ESLint e Prettier para TypeScript e scripts JS
- [x] Configurar TypeScript com modo strict
- [x] Configurar Jest para testes unitários
- [x] Integrar com VS Code Test Explorer

#### Fase 1.3: Aprimoramentos (Concluído)

- [x] Implementar validação de configuração via schema JSON
- [x] Melhorar tratamento de erros com try/catch e mensagens detalhadas
- [x] Otimizar verificação de build para evitar rebuilds desnecessários
- [x] Implementar sistema de versionamento com changelog automático
- [x] Configurar GitHub Actions para CI/CD

#### Fase 1.4: Documentação (Concluído)

- [x] Expandir README com documentação detalhada do sistema
- [x] Documentar sistema de build e versionamento
- [x] Adicionar exemplos de uso e configuração
- [x] Criar CHANGELOG inicial

#### Fase 1.5: Testes e Estabilização (Próximos Passos)

- [ ] Expandir cobertura de testes para módulos de build e deploy
- [ ] Refatorar partes críticas do código para melhor manutenção
- [ ] Melhorar tratamento de exceções em pontos críticos
- [ ] Validar com diferentes configurações de projeto

#### Fase 1.6: Migração do Projeto VilladasPedras

- [ ] Migrar scripts do projeto villadaspedras para o novo sistema
- [ ] Testar em ambiente real
- [ ] Ajustar configurações específicas do projeto
- [ ] Validar funcionalidades de virada de mês/ano

#### Fase 1.7: Documentação Avançada

- [ ] Implementar JSDoc/TSDoc consistente em todos os módulos
  - [ ] Documentar funções, parâmetros, retornos e exemplos
  - [ ] Padronizar formato de comentários
  - [ ] Adicionar descrições para interfaces e tipos
- [ ] Criar documentação de arquitetura
  - [ ] Desenvolver diagramas de fluxo do processo de build/deploy
  - [ ] Criar diagramas de componentes mostrando relações entre módulos
  - [ ] Documentar processo de extensão e personalização
- [ ] Desenvolver guias práticos
  - [ ] Guia de início rápido detalhado
  - [ ] Tutorial de criação de projeto do zero
  - [ ] Guia de troubleshooting para problemas comuns
- [ ] Melhorar documentação de API
  - [ ] Documentar todos os módulos exportados
  - [ ] Listar funções públicas com parâmetros e retornos
  - [ ] Incluir exemplos de uso para cada função principal
- [ ] Reestruturar documentação existente
  - [ ] Organizar em categorias lógicas (guias, referência, API, etc.)
  - [ ] Atualizar README com informações mais concisas
  - [ ] Adicionar índice e navegação entre documentos

### Cronograma Estimado

- **Fase 1.1**: Concluída
- **Fase 1.2**: Concluída
- **Fase 1.3**: Concluída
- **Fase 1.4**: Concluída
- **Fase 1.5**: 2-3 semanas (Prioridade Atual)
- **Fase 1.6**: 3-4 semanas (Após estabilização)
- **Fase 1.7**: 4-6 semanas (Paralelo com Fase 1.6)

## Etapa 2: Migração para Repositório Separado (Template/Starter)

### 2.1 Objetivos

- Criar um template/starter que outros desenvolvedores possam usar
- Fornecer documentação abrangente
- Facilitar adaptação e personalização
- Estabelecer base para comunidade

### 2.2 Tarefas

#### Fase 2.2.1: Criação de Repositório

- [ ] Criar repositório GitHub separado
- [ ] Estruturar como template/starter
- [ ] Configurar licença apropriada (MIT)
- [ ] Configurar GitHub Actions básicas

#### Fase 2.2.2: Migração do Código

- [ ] Migrar código refinado da Etapa 1
- [ ] Organizar em estrutura modular
- [ ] Remover dependências específicas do projeto original
- [ ] Adicionar configurações padrão genéricas

#### Fase 2.2.3: Documentação e Internacionalização

- [ ] Criar README detalhado
- [ ] Desenvolver guias de uso
- [ ] Criar exemplos de projetos
- [ ] Documentar processo de personalização
- [ ] Traduzir toda a documentação para inglês
  - [ ] README e documentação principal
  - [ ] Guias e tutoriais
  - [ ] Comentários no código
  - [ ] Mensagens de erro e logs
- [ ] Implementar estrutura para suporte a múltiplos idiomas
  - [ ] Separar conteúdo em arquivos por idioma
  - [ ] Criar sistema de navegação entre versões de idiomas
  - [ ] Garantir consistência entre versões

#### Fase 2.2.4: Exemplos e Testes

- [ ] Criar projetos de exemplo
- [ ] Implementar testes automatizados
- [ ] Validar em diferentes ambientes
- [ ] Coletar feedback inicial

### 2.3 Versões Planejadas

- **Versão 0.1.0 - Template Básico**
  - Migração do código refinado
  - Documentação essencial
  - Exemplos básicos

- **Versão 0.2.0 - Template Aprimorado**
  - Mais exemplos e casos de uso
  - Suporte a configurações avançadas
  - Melhorias de performance
  - Documentação em inglês (primeira versão)

- **Versão 0.3.0 - Template Completo**
  - Documentação abrangente em português e inglês
  - Suporte a múltiplos tipos de projetos
  - Integração com CI/CD
  - Site de documentação com TypeDoc

### 2.4 Cronograma Estimado

- **Versão 0.1.0**: 1-2 meses após conclusão da Etapa 1
- **Versão 0.2.0**: 2-3 meses após lançamento da 0.1.0
- **Versão 0.3.0**: 3-4 meses após lançamento da 0.2.0

## Etapa 3: Evolução para Biblioteca/CLI (Futuro)

### 3.1 Objetivos

- Desenvolver uma biblioteca completa com CLI
- Publicar no npm para instalação global
- Criar API estável para uso programático
- Estabelecer ecossistema de plugins

### 3.2 Tarefas

#### Fase 3.2.1: Desenvolvimento da CLI

- [ ] Implementar interface de linha de comando
- [ ] Desenvolver comandos essenciais
- [ ] Criar sistema de ajuda e documentação
- [ ] Implementar tratamento de erros robusto

#### Fase 3.2.2: Publicação no npm

- [ ] Configurar package.json para publicação
- [ ] Implementar testes automatizados
- [ ] Criar pipeline de publicação
- [ ] Publicar versão inicial no npm

#### Fase 3.2.3: API Estável

- [ ] Definir API pública
- [ ] Implementar versionamento semântico
- [ ] Documentar API completa
- [ ] Desenvolver exemplos de uso programático

#### Fase 3.2.4: Ecossistema de Plugins

- [ ] Projetar sistema de plugins
- [ ] Implementar carregamento dinâmico de plugins
- [ ] Criar plugins essenciais
- [ ] Documentar criação de plugins

### 3.3 Versões Planejadas

- **Versão 1.0.0 - CLI Básica**
  - Comandos essenciais
  - Documentação de uso
  - Suporte básico a plugins

- **Versão 1.1.0 - API Estável**
  - API pública documentada
  - Suporte a uso programático
  - Melhorias de performance

- **Versão 1.2.0 - Ecossistema**
  - Sistema de plugins avançado
  - Marketplace de plugins
  - Integração com ferramentas populares

### 3.4 Cronograma Estimado

- **Versão 1.0.0**: 3-4 meses após conclusão da Etapa 2
- **Versão 1.1.0**: 2-3 meses após lançamento da 1.0.0
- **Versão 1.2.0**: 3-4 meses após lançamento da 1.1.0

## Próximos Passos

- Avançar com a Fase 1.5 (Testes e Estabilização)
- Preparar o terreno para a Fase 1.6 (Migração do Projeto VilladasPedras)
- Começar a trabalhar na Fase 1.7 (Documentação Avançada)

## Referências

- [00-introducao-gas-builder.md](./00-introducao-gas-builder.md): Visão geral do projeto
- [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md): Arquitetura do sistema
- [30-plano-migracao-gas-builder.md](./30-plano-migracao-gas-builder.md): Plano detalhado de migração
