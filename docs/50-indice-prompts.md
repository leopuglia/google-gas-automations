# Índice de Prompts do GAS Builder

> Última atualização: 06/05/2025

## Resumo

Este documento serve como um catálogo centralizado de todos os prompts disponíveis no projeto GAS Builder, organizados por categoria e caso de uso. Os prompts são instruções estruturadas para modelos de linguagem grandes (LLMs) que ajudam a automatizar tarefas de desenvolvimento, configuração e documentação.

## Pré-requisitos

- Conhecimento básico de [engenharia de prompts](https://en.wikipedia.org/wiki/Prompt_engineering)
- Familiaridade com o [plano de engenharia de prompts](./35-prompt-engineering-plan.md)
- Acesso a uma API de LLM (ChatGPT, Claude, etc.)

## 1. Como Usar Este Índice

Este índice organiza os prompts disponíveis no projeto GAS Builder. Para cada prompt, são fornecidas as seguintes informações:

- **ID**: Identificador único do prompt
- **Nome**: Nome descritivo
- **Descrição**: Breve descrição do propósito e funcionamento
- **Caso de Uso**: Situações em que o prompt é útil
- **Localização**: Caminho para o arquivo do prompt
- **Versão**: Versão atual do prompt

Para usar um prompt específico:

1. Localize o prompt desejado neste índice
2. Navegue até o arquivo correspondente
3. Siga as instruções contidas no arquivo do prompt
4. Adapte o prompt conforme necessário para seu caso específico

## 2. Categorias de Prompts

### 2.1. Prompts de Configuração

Prompts para ajudar na configuração do sistema GAS Builder e projetos relacionados.

| ID | Nome | Descrição | Caso de Uso | Localização | Versão |
|----|------|-----------|-------------|------------|--------|
| CFG-001 | Geração de Config Básica | Gera arquivo config.yml básico com base em descrição do projeto | Iniciar novo projeto | `/prompts/configuracao/01-config-basica.md` | 1.0.0 |
| CFG-002 | Adição de Novo Projeto | Gera seção YAML para adicionar novo projeto à configuração existente | Expandir configuração | `/prompts/configuracao/02-novo-projeto.md` | 1.0.0 |
| CFG-003 | Otimização de Configuração | Analisa e sugere melhorias para configuração existente | Refinamento | `/prompts/configuracao/03-otimizacao-config.md` | 1.0.0 |
| CFG-004 | Configuração Multi-ambiente | Configura ambientes dev, stage e prod com variáveis específicas | Configuração avançada | `/prompts/configuracao/04-multi-ambiente.md` | 1.0.0 |
| CFG-005 | Validação de Configuração | Verifica problemas e inconsistências em arquivo de configuração | Verificação de qualidade | `/prompts/configuracao/05-validacao-config.md` | 1.0.0 |

### 2.2. Prompts de Migração

Prompts para auxiliar na migração de projetos existentes para o GAS Builder.

| ID | Nome | Descrição | Caso de Uso | Localização | Versão |
|----|------|-----------|-------------|------------|--------|
| MIG-001 | Análise de Projeto Existente | Analisa código fonte e estrutura de projeto legacy | Planejamento de migração | `/prompts/migracao/01-analise-projeto.md` | 1.0.0 |
| MIG-002 | Plano de Migração | Gera plano passo a passo para migração com estimativas | Planejamento | `/prompts/migracao/02-plano-migracao.md` | 1.0.0 |
| MIG-003 | Conversão de Estrutura | Gera comandos para reorganizar arquivos na estrutura GAS Builder | Implementação de migração | `/prompts/migracao/03-conversao-estrutura.md` | 1.0.0 |
| MIG-004 | Adaptação de Código JavaScript | Converte código GAS tradicional para TypeScript modular | Implementação | `/prompts/migracao/04-adaptacao-codigo.md` | 1.0.0 |
| MIG-005 | Migração de Funcionalidades | Guia para migração de funcionalidades específicas | Implementação específica | `/prompts/migracao/05-migracao-funcionalidades.md` | 1.0.0 |

### 2.3. Prompts de Desenvolvimento

Prompts para auxiliar no desenvolvimento de novos recursos e módulos.

| ID | Nome | Descrição | Caso de Uso | Localização | Versão |
|----|------|-----------|-------------|------------|--------|
| DEV-001 | Esqueleto de Módulo TypeScript | Gera estrutura básica para novo módulo | Início de desenvolvimento | `/prompts/desenvolvimento/01-esqueleto-modulo.md` | 1.0.0 |
| DEV-002 | Implementação de Função | Gera implementação completa com base em descrição | Desenvolvimento | `/prompts/desenvolvimento/02-implementacao-funcao.md` | 1.0.0 |
| DEV-003 | Integração com Google APIs | Código para interagir com APIs específicas do Google | Desenvolvimento | `/prompts/desenvolvimento/03-integracao-google-api.md` | 1.0.0 |
| DEV-004 | Tratamento de Erros | Implementação de padrões robustos de erro | Desenvolvimento | `/prompts/desenvolvimento/04-tratamento-erros.md` | 1.0.0 |
| DEV-005 | Otimização de Performance | Identifica e resolve problemas de performance | Refinamento | `/prompts/desenvolvimento/05-otimizacao-performance.md` | 1.0.0 |

### 2.4. Prompts de Testes

Prompts para criar e manter testes automatizados.

| ID | Nome | Descrição | Caso de Uso | Localização | Versão |
|----|------|-----------|-------------|------------|--------|
| TST-001 | Geração de Testes Unitários | Cria testes unitários para função ou classe | Implementação de testes | `/prompts/testes/01-testes-unitarios.md` | 1.0.0 |
| TST-002 | Geração de Mocks | Cria mocks para APIs do Google e serviços externos | Implementação de testes | `/prompts/testes/02-geracao-mocks.md` | 1.0.0 |
| TST-003 | Testes de Integração | Cria testes para interação entre componentes | Testes avançados | `/prompts/testes/03-testes-integracao.md` | 1.0.0 |
| TST-004 | Testes End-to-End | Define cenários de teste E2E e implementação | Testes avançados | `/prompts/testes/04-testes-e2e.md` | 1.0.0 |
| TST-005 | Análise de Cobertura | Analisa cobertura atual e sugere melhorias | Qualidade de testes | `/prompts/testes/05-analise-cobertura.md` | 1.0.0 |

### 2.5. Prompts de Documentação

Prompts para gerar e manter documentação do projeto.

| ID | Nome | Descrição | Caso de Uso | Localização | Versão |
|----|------|-----------|-------------|------------|--------|
| DOC-001 | Geração de README | Cria arquivo README.md para projeto ou módulo | Documentação básica | `/prompts/documentacao/01-geracao-readme.md` | 1.0.0 |
| DOC-002 | Documentação de API | Gera docs técnicos para API ou módulo | Documentação técnica | `/prompts/documentacao/02-documentacao-api.md` | 1.0.0 |
| DOC-003 | Guia de Uso | Cria guia passo a passo para funcionalidade | Documentação para usuários | `/prompts/documentacao/03-guia-uso.md` | 1.0.0 |
| DOC-004 | Documentação de Código | Gera comentários JSDoc para funções e classes | Documentação de código | `/prompts/documentacao/04-documentacao-codigo.md` | 1.0.0 |
| DOC-005 | Release Notes | Gera notas de lançamento a partir de commits | Documentação de versão | `/prompts/documentacao/05-release-notes.md` | 1.0.0 |

### 2.6. Prompts de Depuração

Prompts para auxiliar na identificação e resolução de problemas.

| ID | Nome | Descrição | Caso de Uso | Localização | Versão |
|----|------|-----------|-------------|------------|--------|
| DBG-001 | Diagnóstico de Erros | Analisa logs e mensagens de erro para diagnóstico | Depuração | `/prompts/depuracao/01-diagnostico-erros.md` | 1.0.0 |
| DBG-002 | Solução de Problemas Comuns | Guia para resolver problemas frequentes | Suporte | `/prompts/depuracao/02-solucao-problemas.md` | 1.0.0 |
| DBG-003 | Verificação de Segurança | Identifica possíveis vulnerabilidades no código | Segurança | `/prompts/depuracao/03-verificacao-seguranca.md` | 1.0.0 |
| DBG-004 | Troubleshooting de Build | Identifica e resolve problemas no processo de build | Depuração de build | `/prompts/depuracao/04-troubleshooting-build.md` | 1.0.0 |
| DBG-005 | Troubleshooting de Deploy | Identifica e resolve problemas no processo de deploy | Depuração de deploy | `/prompts/depuracao/05-troubleshooting-deploy.md` | 1.0.0 |

## 3. Prompts por Caso de Uso

Esta seção organiza os prompts por cenários comuns de uso, para facilitar a localização do prompt mais adequado para cada situação.

### 3.1. Iniciar Novo Projeto

Sequência recomendada de prompts para iniciar um novo projeto:

1. **CFG-001**: Geração de Config Básica
2. **DEV-001**: Esqueleto de Módulo TypeScript
3. **DOC-001**: Geração de README
4. **TST-001**: Geração de Testes Unitários

### 3.2. Migrar Projeto Existente

Sequência recomendada para migração:

1. **MIG-001**: Análise de Projeto Existente
2. **MIG-002**: Plano de Migração
3. **MIG-003**: Conversão de Estrutura
4. **MIG-004**: Adaptação de Código JavaScript
5. **CFG-001**: Geração de Config Básica

### 3.3. Expandir Funcionalidades

Prompts úteis para adicionar novas funcionalidades:

1. **DEV-001**: Esqueleto de Módulo TypeScript
2. **DEV-002**: Implementação de Função
3. **TST-001**: Geração de Testes Unitários
4. **DOC-003**: Guia de Uso

### 3.4. Manutenção e Qualidade

Prompts para melhorar e manter a qualidade do código:

1. **TST-005**: Análise de Cobertura
2. **DEV-005**: Otimização de Performance
3. **DBG-003**: Verificação de Segurança
4. **CFG-003**: Otimização de Configuração

## 4. Como Contribuir com Novos Prompts

### 4.1. Processo de Criação

Para contribuir com novos prompts:

1. Identifique uma necessidade não atendida pelos prompts existentes
2. Siga o template padrão para criação de prompts
3. Teste o prompt com diferentes entradas
4. Documente casos de uso e exemplos
5. Submeta como pull request

### 4.2. Template de Prompt

Utilize o seguinte formato para criar novos prompts:

```markdown
# [TÍTULO DO PROMPT]

> Versão: x.y.z | Última atualização: DD/MM/AAAA

## Cenário
[Descrição do contexto e situação em que o prompt deve ser usado]

## Seu Papel
[Definição do papel/persona que o LLM deve assumir]

## Instruções Detalhadas
[Instruções passo a passo do que deve ser feito]

## Fontes de Referência
[Links e referências relevantes]

## Formato de Saída
[Especificação do formato esperado da resposta]

## Exemplo de Saída
[Exemplo concreto do tipo de resposta esperada]
```

### 4.3. Versionamento

Os prompts seguem o versionamento semântico:

- **Major (X.0.0)**: Mudanças que alteram fundamentalmente o output
- **Minor (0.X.0)**: Adições que mantêm compatibilidade com versões anteriores
- **Patch (0.0.X)**: Correções e refinamentos pequenos

## 5. Ferramenta de Prompt CLI

O GAS Builder inclui uma ferramenta de linha de comando para executar prompts:

```bash
# Uso básico
pnpm gas-prompt [id-do-prompt] [opções]

# Exemplos
pnpm gas-prompt CFG-001 --nome="Meu Projeto" --ambientes="dev,prod"
pnpm gas-prompt MIG-001 --caminho="./projeto-legado"
```

Para mais detalhes sobre a ferramenta, consulte o [51-guia-uso-prompts.md](./51-guia-uso-prompts.md).

## Próximos Passos

- Explorar o [51-guia-uso-prompts.md](./51-guia-uso-prompts.md) para instruções detalhadas de uso
- Consultar o [35-prompt-engineering-plan.md](./35-prompt-engineering-plan.md) para entender a estratégia de prompts
- Contribuir com melhorias e novos prompts seguindo o processo definido

## Referências

- [35-prompt-engineering-plan.md](./35-prompt-engineering-plan.md): Plano de engenharia de prompts
- [51-guia-uso-prompts.md](./51-guia-uso-prompts.md): Guia detalhado para uso de prompts
- [Documentação do OpenAI](https://platform.openai.com/docs/guides/prompt-engineering): Práticas de engenharia de prompts
- [Anthropic Claude Documentation](https://docs.anthropic.com/claude/): Guia para uso do Claude
