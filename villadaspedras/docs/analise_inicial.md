# Análise Inicial para Migração para TypeScript

## Estrutura Atual do Projeto

### Arquivos Principais
1. **config.yml** - Configurações dos projetos (salário, consumo)
2. **rollup.config.js** - Configuração do Rollup para compilação TS → JS
3. **tsconfig.json** - Configuração do TypeScript

### Arquivos Originais (src-originals)
- **commons/**: Funções compartilhadas
- **salario-2024/**:
  - `VirarSalario.gs`: Lógica de transição mensal/anual de salários
  - `Código.gs`: Funções principais de manipulação da planilha
- **consumo-cafeteria-2024/**:
  - `VirarConsumo.gs`: Lógica similar adaptada para consumo

## Primeiros Passos para Migração

1. **Criar estrutura TypeScript modular**
   - Definir interfaces para:
     - Planilhas (`Spreadsheet`, `Sheet`, `Range`)
     - Dados de funcionários
     - Configurações de projeto

2. **Converter VilladasPedrasLib**
   - Criar classes para:
     - `SpreadsheetService` (manipulação de planilhas)
     - `MonthTransition` (lógica de virada de mês)
     - `YearTransition` (lógica de virada de ano)

3. **Configurar módulos**
   - `salario/`: Conterá a lógica específica de salários
   - `consumo/`: Lógica específica de consumo
   - `core/`: Funções compartilhadas

4. **Manter compatibilidade**
   - Garantir que a saída JS mantenha a estrutura esperada pelo GAS
   - Usar decorators para funções globais do GAS

5. **Plano Iterativo**
   - Migrar uma função por vez
   - Manter testes manuais após cada migração
   - Documentar cada etapa

## Próximas Ações
1. Analisar `VilladasPedrasLib.Main.gs` em detalhes
2. Criar interfaces base
3. Começar pela migração das funções utilitárias
