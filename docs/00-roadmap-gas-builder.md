# Roadmap: GAS Builder

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

### Objetivos

- Criar um template/starter que outros desenvolvedores possam usar
- Fornecer documentação abrangente
- Facilitar adaptação e personalização
- Estabelecer base para comunidade

### Tarefas

#### Fase 2.1: Criação de Repositório

- [ ] Criar repositório GitHub separado
- [ ] Estruturar como template/starter
- [ ] Configurar licença apropriada (MIT)
- [ ] Configurar GitHub Actions básicas

#### Fase 2.2: Migração do Código

- [ ] Migrar código refinado da Etapa 1
- [ ] Organizar em estrutura modular
- [ ] Remover dependências específicas do projeto original
- [ ] Adicionar configurações padrão genéricas

#### Fase 2.3: Documentação e Internacionalização

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

#### Fase 2.4: Exemplos e Testes

- [ ] Criar projetos de exemplo
- [ ] Implementar testes automatizados
- [ ] Validar em diferentes ambientes
- [ ] Coletar feedback inicial

### Versões Planejadas

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

### Cronograma Estimado

- **Versão 0.1.0**: 1-2 meses após conclusão da Etapa 1
- **Versão 0.2.0**: 2-3 meses após lançamento da 0.1.0
- **Versão 0.3.0**: 3-4 meses após lançamento da 0.2.0

## Etapa 3: Evolução para Biblioteca/CLI (Futuro)

### Objetivos

- Desenvolver uma biblioteca completa com CLI
- Publicar no npm para instalação global
- Criar API estável para uso programático
- Estabelecer ecossistema de plugins

### Tarefas

#### Fase 3.1: Desenvolvimento da CLI

- [ ] Implementar interface de linha de comando
- [ ] Desenvolver comandos essenciais
- [ ] Criar sistema de ajuda e documentação
- [ ] Implementar tratamento de erros robusto

#### Fase 3.2: Publicação no npm

- [ ] Configurar package.json para publicação
- [ ] Implementar testes automatizados
- [ ] Criar pipeline de CI/CD
- [ ] Publicar versão inicial

#### Fase 3.3: Expansão de Funcionalidades

- [ ] Adicionar mais comandos e opções
- [ ] Implementar sistema de plugins
- [ ] Melhorar integração com ferramentas existentes
- [ ] Otimizar performance

#### Fase 3.4: Ecossistema

- [ ] Desenvolver plugins oficiais
- [ ] Criar documentação para desenvolvimento de plugins
- [ ] Implementar sistema de templates personalizáveis
- [ ] Estabelecer comunidade de contribuidores

### Versões Planejadas

- **Versão 1.0.0 - CLI Básica**
  - Implementação da interface de linha de comando
  - Comandos essenciais (init, build, deploy)
  - Publicação inicial no npm

- **Versão 1.5.0 - CLI Aprimorada**
  - Mais comandos e opções
  - Melhor integração com ferramentas existentes
  - Suporte a plugins

- **Versão 2.0.0 - Sistema Completo**
  - API estável para uso programático
  - Ecossistema de plugins
  - Integração com ferramentas populares de CI/CD

### Cronograma Estimado

- **Versão 1.0.0**: 6-8 meses após conclusão da Etapa 2
- **Versão 1.5.0**: 8-12 meses após lançamento da 1.0.0
- **Versão 2.0.0**: 12+ meses após lançamento da 1.5.0

## Benefícios da Abordagem Gradual

1. **Feedback Contínuo**
   - Cada etapa permite coletar feedback e ajustar o rumo
   - Problemas são identificados e corrigidos mais cedo

2. **Valor Incremental**
   - Desenvolvedores podem começar a usar o sistema desde a Etapa 2
   - Não é necessário esperar pela versão final

3. **Flexibilidade**
   - O template/starter permite personalização imediata
   - Desenvolvedores podem adaptar às suas necessidades específicas

4. **Comunidade**
   - Construção gradual de comunidade
   - Oportunidades para contribuições em diferentes níveis

5. **Menor Risco**
   - Investimento gradual de tempo e recursos
   - Validação do conceito antes de compromissos maiores

## Próximos Passos Imediatos

1. Concluir as tarefas da Fase 1.2 (Refinamentos)
2. Iniciar trabalho na Fase 1.3 (Aprimoramentos)
3. Planejar em detalhes a estrutura do repositório template
4. Desenvolver exemplos iniciais para validação do conceito
