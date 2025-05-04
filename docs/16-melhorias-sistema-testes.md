# Melhorias no Sistema de Testes

> Data: 02/05/2025

## Introdução

Este documento descreve as melhorias implementadas no sistema de testes do projeto Google Apps Script Automations para resolver problemas de estabilidade, especialmente relacionados ao travamento do WSL e do servidor da IDE durante a execução de todos os testes simultaneamente.

## Problemas Identificados

Durante a execução dos testes automatizados, foram identificados os seguintes problemas:

1. **Travamento do WSL e do servidor da IDE**: Ao executar todos os testes simultaneamente com o comando `pnpm test`, o sistema travava e emitia a seguinte mensagem de erro:

   ```bash
   A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
   ```

2. **Inconsistência nos mocks**: O mock do logger estava implementado de forma diferente em diferentes arquivos de teste, causando erros quando os módulos tentavam acessar funções como `logger.error()`.

3. **Falta de liberação de recursos**: Os testes não estavam liberando corretamente recursos como timers, processos e listeners de eventos.

## Soluções Implementadas

### 1. Padronização dos Mocks

- Criamos um mock centralizado para o logger em `tests/mocks/logger.mock.js` com suporte a módulos ES e todas as funções necessárias.
- Atualizamos os testes para usar o mock centralizado em vez de implementações inline.
- Adicionamos a flag `__esModule: true` para garantir compatibilidade com importações de módulos ES.

### 2. Configurações do Jest

Atualizamos o arquivo `jest.config.js` com as seguintes configurações:

- `testTimeout: 10000`: Aumentamos o timeout para 10 segundos para evitar falsos negativos em testes mais lentos.
- `forceExit: true`: Forçamos a saída do processo após a conclusão dos testes.
- `detectOpenHandles: true`: Habilitamos a detecção de handles abertos para identificar vazamentos de recursos.
- `teardown: true`: Garantimos que o teardown seja executado após os testes.
- `maxWorkers: '50%'`: Limitamos o número de workers para evitar sobrecarga do sistema.
- `timers: 'fake'`: Usamos timers falsos para evitar problemas com timers reais.
- `globalTeardown: '<rootDir>/tests/teardown.js'`: Adicionamos um arquivo de teardown global para limpar recursos após os testes.

### 3. Teardown Global

Criamos um arquivo de teardown global em `tests/teardown.js` para garantir a liberação de recursos após a execução dos testes:

```javascript
afterAll(() => {
  // Limpar todos os mocks
  jest.clearAllMocks();
  
  // Restaurar todos os mocks
  jest.restoreAllMocks();
  
  // Limpar todos os timers
  jest.clearAllTimers();
  
  // Garantir que não há listeners de eventos pendentes
  process.removeAllListeners();
  
  // Fechar qualquer conexão pendente
  if (global.gc) {
    global.gc();
  }
});
```

### 4. Scripts de Execução Controlada

Implementamos dois scripts personalizados para executar os testes de forma controlada:

#### 4.1. Execução Sequencial Segura (`scripts/run-tests.js`)

- Executa cada teste individualmente em um processo separado
- Implementa timeout para evitar que testes fiquem travados
- Adiciona pausas entre os testes para garantir a liberação de recursos
- Usa o módulo `spawn` em vez de `execSync` para melhor controle dos processos
- Captura e exibe a saída dos testes em tempo real
- Fornece um resumo detalhado dos resultados dos testes

Adicionamos um novo comando no `package.json`:

```json
"test:safe": "node scripts/run-tests.js"
```

#### 4.2. Execução com Paralelismo Controlado (`scripts/run-tests-parallel.js`)

- Executa os testes em pequenos lotes paralelos para melhor desempenho
- Detecta automaticamente o número de CPUs disponíveis e limita o paralelismo
- Adiciona pausas entre lotes para garantir a liberação de recursos
- Implementa timeout para evitar que testes fiquem travados
- Captura e exibe a saída dos testes em tempo real
- Fornece um resumo detalhado dos resultados dos testes

Adicionamos um novo comando no `package.json`:

```json
"test:parallel": "node scripts/run-tests-parallel.js"
```

## Como Usar

O sistema de testes agora oferece três modos de execução, cada um com diferentes características de desempenho e estabilidade:

### 1. Execução Padrão

```bash
pnpm test
```

- Usa a configuração padrão do Jest
- Executa todos os testes em paralelo (máximo paralelismo)
- Mais rápido, mas pode causar problemas de estabilidade em sistemas com recursos limitados

### 2. Execução Segura

```bash
pnpm test:safe
```

- Executa os testes um por um, sequencialmente
- Mais lento, mas muito estável
- Ideal para ambientes com recursos limitados ou quando ocorrem travamentos
- Inclui pausas entre os testes e tratamento de erros robusto

### 3. Execução com Paralelismo Controlado

```bash
pnpm test:parallel
```

- Executa os testes em pequenos lotes paralelos
- Equilibra velocidade e estabilidade
- Adapta-se automaticamente ao número de CPUs disponíveis
- Inclui pausas entre lotes para liberação de recursos

Esta opção é recomendada para a maioria dos casos, pois oferece um bom equilíbrio entre desempenho e estabilidade.

## Benefícios

- **Estabilidade**: Redução significativa de travamentos durante a execução dos testes.
- **Flexibilidade**: Três modos de execução para diferentes necessidades (padrão, seguro, paralelo controlado).
- **Desempenho Otimizado**: Paralelismo controlado que equilibra velocidade e estabilidade.
- **Diagnóstico**: Melhor identificação de problemas em testes específicos.
- **Isolamento**: Cada teste é executado em um ambiente isolado, evitando interferências.
- **Robustez**: Melhor tratamento de erros e timeouts.
- **Manutenibilidade**: Padronização dos mocks e configurações.
- **Adaptação Automática**: Ajuste automático ao número de CPUs disponíveis no sistema.

## Próximos Passos

1. **Monitoramento de Desempenho**: Implementar métricas para monitorar o desempenho dos testes.
2. **Otimização do Paralelismo**: Refinar os algoritmos de paralelismo para melhor desempenho.
3. **Integração com CI/CD**: Configurar a pipeline de CI/CD para usar o modo de execução com paralelismo controlado.
4. **Expansão da Cobertura**: Aumentar a cobertura de testes para módulos com menor cobertura.
5. **Documentação**: Expandir a documentação sobre como criar novos testes seguindo os padrões estabelecidos.
6. **Configuração Personalizável**: Adicionar opções de linha de comando para personalizar o nível de paralelismo e outras configurações.
7. **Relatórios de Testes**: Implementar relatórios detalhados de execução dos testes, incluindo tempos de execução e uso de recursos.

## Conclusão

As melhorias implementadas no sistema de testes resolveram os problemas de estabilidade e travamento, permitindo a execução confiável dos testes automatizados. A padronização dos mocks e a implementação de múltiplos modos de execução de testes contribuem para um sistema mais robusto, flexível e manutenível.

O novo modo de execução com paralelismo controlado oferece um excelente equilíbrio entre desempenho e estabilidade, adaptando-se automaticamente aos recursos disponíveis no sistema. Isso permite que os desenvolvedores escolham a abordagem mais adequada para suas necessidades específicas, seja priorizando a velocidade, a estabilidade ou um equilíbrio entre ambos.

Com estas melhorias, o sistema de testes está agora mais preparado para suportar o crescimento contínuo do projeto, garantindo que novos recursos possam ser desenvolvidos e testados de forma eficiente e confiável.
