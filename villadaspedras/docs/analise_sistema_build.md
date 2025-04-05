# Análise do Sistema de Build Existente

## Arquivos Principais

### 1. rollup.config.js

- Configuração atual do Rollup
- Precisa ser mantida compatível com os scripts existentes

### 2. Diretório scripts/

#### build-deploy.js

- Responsável por preparar o build para deploy
- Integra com o sistema de templates

#### build-rollup.js

- Configuração adicional para o Rollup
- Define pontos de entrada específicos

#### clasp-operations.js

- Interface com o CLI do Google Apps Script (clasp)
- Gerencia push, deploy e outras operações

#### process-templates.js

- Sistema complexo de templates
- Gera arquivos de configuração para diferentes ambientes

### 3. Diretório schema/

#### config.schema.json

- Schema JSON para validação de configurações
- Define a estrutura esperada do config.yml

## Proposta de Integração

1. **Manter compatibilidade** com os scripts existentes
2. **Adicionar suporte** para:
   - Tipos do TypeScript
   - Novos módulos da biblioteca
3. **Atualizar gradualmente** os templates conforme necessário

## Próximos Passos Sugeridos

1. Analisar cada script em detalhe
2. Identificar pontos de integração
3. Propor alterações incrementais
