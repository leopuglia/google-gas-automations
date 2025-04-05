# Análise: Testes Unitários

## Contexto

Documentação do sistema de testes para as automações do Google Apps Script

## Estrutura

- `tests/unit/`: Testes de componentes individuais
- `tests/mocks/`: Implementações mockadas do GAS

## Fluxo de Trabalho

1. Desenvolver código em TypeScript
2. Criar testes unitários
3. Executar testes localmente com `pnpm test`
4. Enviar para GAS após aprovação

## Observações

- Todos os testes devem mockar chamadas ao GAS
- Manter cobertura de testes acima de 80%
- Padronizar nomenclatura de arquivos de teste
