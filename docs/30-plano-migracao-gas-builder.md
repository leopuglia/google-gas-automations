# Plano de Migração: Sistema de Build GAS Flexível

> Última atualização: 06/05/2025

## Resumo

Este documento apresenta um plano detalhado para migrar o sistema de build para a raiz do projeto, incorporando melhorias e tornando a solução mais genérica para uso público. O objetivo é criar uma base sólida para a evolução do sistema conforme definido no [roadmap](./01-roadmap-gas-builder.md).

## 1. Visão Geral do Projeto

### Objetivo

Criar um sistema de build flexível e genérico para projetos Google Apps Script, que possa ser usado como ponto de partida para qualquer desenvolvedor, com configuração baseada em YAML e suporte a múltiplos ambientes e estruturas de projeto.

### Nome do Projeto

**GAS Builder** (Google Apps Script Builder)

### Diferenciais em Relação a Soluções Existentes

- Configuração totalmente baseada em YAML
- Suporte a estruturas de projeto aninhadas
- Sistema de templates flexível
- Integração com Rollup para empacotamento moderno
- Suporte a TypeScript com configuração otimizada
- Sistema de logging avançado
- Documentação abrangente e exemplos práticos

## 2. Estrutura do Projeto

```bash
gas-builder/
├── .github/                      # Configurações do GitHub e CI/CD
├── .vscode/                      # Configurações do VS Code
├── docs/                         # Documentação detalhada
├── examples/                     # Exemplos de projetos
│   ├── basic/                    # Exemplo básico
│   ├── multi-environment/        # Exemplo com múltiplos ambientes
│   └── nested-structure/         # Exemplo com estrutura aninhada
├── src/                          # Código-fonte do sistema de build
│   ├── cli/                      # Interface de linha de comando
│   ├── config/                   # Gerenciamento de configuração
│   ├── deploy/                   # Sistema de deploy
│   ├── logger/                   # Sistema de logging
│   ├── rollup/                   # Configuração do Rollup
│   ├── templates/                # Processamento de templates
│   └── utils/                    # Utilitários diversos
├── templates/                    # Templates padrão
│   ├── .clasp-template.json     
│   ├── .claspignore-template
│   └── appsscript-template.json
├── tests/                        # Testes automatizados
├── .eslintrc.js                  # Configuração do ESLint
├── .prettierrc                   # Configuração do Prettier
├── config.schema.json            # Schema JSON para validação do YAML
├── config.example.yml            # Exemplo de configuração
├── jest.config.js                # Configuração do Jest
├── package.json                  # Dependências e scripts
├── README.md                     # Documentação principal
├── rollup.config.js              # Configuração do Rollup
└── tsconfig.json                 # Configuração do TypeScript
```

## 3. Etapas da Migração

### 3.1. Preparação do Repositório

1. **Criar novo repositório**
   - Inicializar repositório Git
   - Configurar .gitignore para excluir node_modules, build, dist, etc.
   - Configurar licença (MIT recomendada para projetos open source)

2. **Configurar estrutura de diretórios**
   - Criar a estrutura de pastas conforme definido acima
   - Mover arquivos relevantes dos projetos existentes

### 3.2. Migração do Código Base

1. **Migrar scripts de build e deploy**
   - Mover e refatorar scripts existentes para a nova estrutura
   - Organizar em módulos separados (config, deploy, templates, etc.)
   - Converter para ES Modules (se ainda não estiver)

2. **Implementar CLI aprimorada**
   - Criar interface de linha de comando usando yargs
   - Suportar comandos para build, deploy, push, etc.
   - Implementar opções para configuração, ambiente, projeto, etc.

3. **Aprimorar sistema de configuração**
   - Migrar sistema de carregamento de configuração
   - Implementar validação de schema JSON
   - Adicionar suporte para configuração em cascata (default → project → environment)

4. **Melhorar sistema de templates**
   - Migrar sistema de processamento de templates
   - Implementar cache para templates processados
   - Adicionar suporte para templates personalizados

### 3.3. Implementação de Melhorias

1. **Sistema de logging avançado**
   - Migrar sistema de logging existente
   - Adicionar suporte para níveis de log configuráveis
   - Implementar formatação colorida para console

2. **Integração com Rollup**
   - Migrar configuração do Rollup para novo formato
   - Implementar carregamento dinâmico de plugins
   - Adicionar suporte para bibliotecas compartilhadas

3. **Ferramentas de qualidade de código**
   - Configurar ESLint com regras otimizadas para TypeScript
   - Configurar Prettier para formatação consistente
   - Adicionar husky para hooks de pre-commit

4. **Testes automatizados**
   - Implementar testes unitários com Jest
   - Adicionar testes de integração
   - Configurar cobertura de código

### 3.4. Documentação e Exemplos

1. **Documentação principal**
   - Criar README.md detalhado com instruções de instalação e uso
   - Documentar estrutura de configuração YAML
   - Adicionar exemplos de comandos comuns

2. **Documentação técnica**
   - Criar documentação detalhada para cada módulo
   - Documentar API para extensão do sistema
   - Adicionar diagramas de arquitetura

3. **Exemplos práticos**
   - Criar exemplos para diferentes cenários de uso
   - Documentar cada exemplo com README específico
   - Incluir exemplos para casos de uso comuns

### 3.5. Configuração de CI/CD e Publicação

1. **Configurar GitHub Actions**
   - Implementar workflow para testes automatizados
   - Configurar build e publicação automática
   - Adicionar verificação de qualidade de código

2. **Preparar para publicação no npm**
   - Configurar package.json para publicação
   - Adicionar scripts de build e prepublish
   - Definir arquivos a serem incluídos no pacote

3. **Documentação de contribuição**
   - Criar guia de contribuição (CONTRIBUTING.md)
   - Definir processo de pull request
   - Documentar convenções de código

## 4. Marcos de Implementação

### 4.1. Marco 1: Estrutura Base (1-2 semanas)

**Objetivos:**

- Criar repositório e estrutura de diretórios
- Configurar ferramentas de desenvolvimento (ESLint, Prettier, etc.)
- Migrar código base essencial

**Entregáveis:**

- Repositório Git inicializado
- Estrutura de diretórios completa
- Configurações de desenvolvimento (tsconfig.json, eslintrc, etc.)
- Documentação inicial (README.md)

### 4.2. Marco 2: Core do Sistema (2-3 semanas)

**Objetivos:**

- Implementar sistema de configuração
- Desenvolver CLI básica
- Migrar sistema de templates
- Implementar integração com Rollup

**Entregáveis:**

- Sistema de configuração YAML funcional
- CLI com comandos básicos (build, deploy)
- Sistema de templates funcionando
- Build com Rollup configurado

### 4.3. Marco 3: Testes e Refinamentos (1-2 semanas)

**Objetivos:**

- Implementar testes automatizados
- Refinar sistema de logging
- Otimizar performance
- Adicionar validação de configuração

**Entregáveis:**

- Suite de testes com Jest
- Sistema de logging avançado
- Validação de configuração via schema JSON
- Documentação de desenvolvimento atualizada

### 4.4. Marco 4: Documentação e Exemplos (1-2 semanas)

**Objetivos:**

- Criar documentação detalhada
- Desenvolver exemplos práticos
- Preparar guia de contribuição
- Finalizar README principal

**Entregáveis:**

- Documentação completa na pasta `docs/`
- Exemplos funcionais na pasta `examples/`
- Guia de contribuição (CONTRIBUTING.md)
- README.md detalhado e abrangente

### 4.5. Marco 5: Publicação e Divulgação (1 semana)

**Objetivos:**

- Configurar CI/CD
- Preparar para publicação no npm
- Planejar divulgação
- Coletar feedback inicial

**Entregáveis:**

- Configuração do GitHub Actions
- Package.json preparado para publicação
- Plano de divulgação
- Sistema de coleta de feedback

## 5. Plano de Execução

### 5.1. Priorização de Tarefas

1. **Alta Prioridade**
   - Migração do sistema de configuração
   - Implementação do CLI
   - Sistema de processamento de templates
   - Integração com Rollup

2. **Média Prioridade**
   - Sistema de logging avançado
   - Testes automatizados
   - Validação de configuração
   - Exemplos básicos

3. **Baixa Prioridade**
   - Documentação avançada
   - Exemplos complexos
   - Integração com CI/CD
   - Otimizações de performance

### 5.2. Estratégia de Migração

1. **Fase Inicial: Analítica**
   - Analisar código existente
   - Identificar componentes reutilizáveis
   - Mapear dependências
   - Planejar arquitetura

2. **Fase Intermediária: Migração Gradual**
   - Migrar componentes um por um
   - Implementar testes para cada componente
   - Validar funcionalidade após cada migração
   - Documentar durante o processo

3. **Fase Final: Integração e Validação**
   - Integrar todos os componentes
   - Testar sistema completo
   - Validar com casos de uso reais
   - Finalizar documentação

### 5.3. Mitigação de Riscos

1. **Risco: Compatibilidade com Clasp**
   - **Mitigação**: Testar exaustivamente a integração com diferentes versões do Clasp
   - **Plano B**: Implementar camada de compatibilidade para diferentes versões

2. **Risco: Complexidade da Configuração**
   - **Mitigação**: Criar validação robusta e mensagens de erro detalhadas
   - **Plano B**: Simplificar esquema de configuração, priorizando usabilidade

3. **Risco: Curva de Aprendizado**
   - **Mitigação**: Criar documentação detalhada e exemplos práticos
   - **Plano B**: Implementar assistentes de linha de comando para tarefas comuns

## 6. Conclusão e Próximos Passos

A migração do sistema de build para um formato mais genérico e flexível é um passo importante para a evolução do projeto. Seguindo este plano, será possível criar uma base sólida para futuros desenvolvimentos, conforme detalhado no [roadmap](./01-roadmap-gas-builder.md).

Após a conclusão da migração, os próximos passos incluem:

1. Coletar feedback de usuários iniciais
2. Implementar melhorias baseadas no feedback
3. Expandir documentação e exemplos
4. Planejar a evolução para uma CLI independente

## Referências

- [00-introducao-gas-builder.md](./00-introducao-gas-builder.md): Visão geral do projeto
- [01-roadmap-gas-builder.md](./01-roadmap-gas-builder.md): Plano de evolução do projeto
- [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md): Arquitetura do sistema
- [10-guia-inicio-rapido.md](./10-guia-inicio-rapido.md): Guia para começar a usar o sistema
