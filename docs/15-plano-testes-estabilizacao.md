# Plano de Testes e Estabilização do Sistema de Build

Este documento detalha o plano para expandir a cobertura de testes, refatorar partes críticas do código e melhorar o tratamento de exceções no sistema de build, preparando-o para a migração dos scripts do projeto villadaspedras.

## Objetivos

1. Garantir a robustez do sistema de build através de testes automatizados
2. Refatorar partes críticas do código para melhorar a manutenção
3. Implementar tratamento de exceções mais abrangente em pontos críticos
4. Validar o sistema com diferentes configurações de projeto

## 1. Expansão da Cobertura de Testes

### 1.1. Testes para o Módulo de Configuração

[tests/config-helper.test.js](./tests/config-helper.test.js)

### 1.2. Testes para o Módulo de Templates

[tests/template-helper.test.js](./tests/template-helper.test.js)

### 1.3. Testes para o Módulo de Filesystem

[tests/filesystem-helper.test.js](./tests/filesystem-helper.test.js)

### 1.4. Testes para o Módulo de Versionamento

[tests/version-manager.test.js](./tests/version-manager.test.js)

### 1.5. Testes para o Módulo de Deploy

[tests/deploy-helper.test.js](./tests/deploy-helper.test.js)

### 1.6. Testes para o Módulo de Rollup

[tests/rollup-helper.test.js](./tests/rollup-helper.test.js)

## 2. Refatoração de Partes Críticas

### 2.1. Refatoração do Módulo de Deploy

Principais pontos a serem refatorados:

1. **Separação de responsabilidades**:
   - Dividir a função `main` em funções menores com responsabilidades específicas
   - Criar módulos separados para cada etapa do processo de deploy

2. **Melhoria na estrutura de comandos**:
   - Refatorar o processamento de argumentos de linha de comando
   - Implementar padrão Command para as diferentes operações

3. **Otimização do fluxo de deploy**:
   - Implementar verificações mais eficientes para evitar operações desnecessárias
   - Melhorar o feedback durante o processo de deploy

### 2.2. Refatoração do Módulo de Templates

Principais pontos a serem refatorados:

1. **Separação do carregamento e processamento**:
   - Separar a leitura de templates do processamento
   - Implementar cache para templates compilados

2. **Melhoria na gestão de contexto**:
   - Criar função específica para preparar o contexto com informações de versão
   - Implementar validação de contexto para evitar erros de processamento

## 3. Melhoria no Tratamento de Exceções

### 3.1. Pontos Críticos para Tratamento de Exceções

1. **Carregamento de Configuração**:
   - Validar a existência de todos os campos obrigatórios
   - Fornecer mensagens de erro detalhadas para cada tipo de problema
   - Implementar fallbacks para valores ausentes quando possível

2. **Operações de Filesystem**:
   - Tratar erros de permissão
   - Implementar retry para operações que podem falhar temporariamente
   - Garantir limpeza adequada em caso de falha

3. **Processamento de Templates**:
   - Validar templates antes do processamento
   - Tratar erros de sintaxe em templates
   - Fornecer mensagens de erro com contexto sobre o problema

4. **Operações do Clasp**:
   - Tratar erros de autenticação
   - Implementar retry para falhas de rede
   - Fornecer instruções detalhadas em caso de falha

### 3.2. Implementação de Sistema de Logging Melhorado

1. **Níveis de Log Detalhados**:
   - ERROR: Erros que impedem a execução
   - WARN: Problemas que não impedem a execução, mas podem causar comportamento inesperado
   - INFO: Informações gerais sobre o processo
   - DEBUG: Informações detalhadas para depuração
   - VERBOSE: Informações extremamente detalhadas

2. **Formatação de Mensagens**:
   - Incluir timestamp em todas as mensagens
   - Formatar mensagens de erro com stack trace quando disponível
   - Usar cores para diferenciar níveis de log

## 4. Validação com Diferentes Configurações

### 4.1. Casos de Teste para Validação

1. **Projeto Simples**:
   - Um único projeto sem chaves de substituição
   - Ambiente único (dev ou prod)

2. **Projeto com Múltiplos Ambientes**:
   - Um projeto com ambientes dev e prod
   - Diferentes IDs de script para cada ambiente

3. **Projeto com Chaves de Substituição**:
   - Projeto com chaves year e pdv
   - Múltiplas combinações de chaves

4. **Múltiplos Projetos**:
   - Vários projetos na mesma configuração
   - Projetos com diferentes estruturas

### 4.2. Processo de Validação

1. **Preparação**:
   - Criar configurações de teste para cada caso
   - Preparar diretórios e arquivos necessários

2. **Execução**:
   - Executar o processo de build para cada configuração
   - Executar o processo de deploy (sem push) para cada configuração

3. **Verificação**:
   - Validar a estrutura dos arquivos gerados
   - Verificar a substituição correta de variáveis
   - Confirmar a presença de informações de versão

## Cronograma de Implementação

| Tarefa | Tempo Estimado | Prioridade |
|--------|----------------|------------|
| Testes para Módulo de Configuração | 2-3 dias | Alta |
| Testes para Módulo de Templates | 2-3 dias | Alta |
| Testes para Módulo de Filesystem | 1-2 dias | Média |
| Testes para Módulo de Versionamento | 1-2 dias | Média |
| Refatoração do Módulo de Deploy | 3-4 dias | Alta |
| Refatoração do Módulo de Templates | 2-3 dias | Média |
| Melhoria no Tratamento de Exceções | 3-4 dias | Alta |
| Validação com Diferentes Configurações | 2-3 dias | Alta |

## Próximos Passos após Estabilização

Após a conclusão das tarefas de teste e estabilização, o próximo passo será a migração dos scripts do projeto villadaspedras para o novo sistema de build. Este processo incluirá:

1. **Análise dos scripts existentes**:
   - Identificar funcionalidades específicas
   - Mapear dependências e integrações

2. **Configuração do novo sistema**:
   - Criar arquivo de configuração YAML
   - Definir estrutura de projetos e ambientes

3. **Migração gradual**:
   - Começar com projetos mais simples
   - Validar cada migração antes de prosseguir

4. **Testes em ambiente real**:
   - Testar funcionalidades de virada de mês/ano
   - Validar integrações com outras planilhas

Este plano de testes e estabilização garantirá que o sistema de build esteja robusto e confiável antes da migração dos scripts do projeto villadaspedras, minimizando riscos e facilitando a transição.
