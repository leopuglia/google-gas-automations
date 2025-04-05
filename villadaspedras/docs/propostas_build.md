# Propostas para Atualização do Sistema de Build

## 1. Compatibilidade com TypeScript

### Problemas Identificados

- Configuração atual não suporta totalmente TypeScript
- Tipos não são preservados no build final

### Soluções Propostas

- Adicionar `@rollup/plugin-typescript`
- Configurar `tsconfig.json` específico para build
- Manter compatibilidade com JavaScript existente

## 2. Integração com Módulos

### Problemas Identificados

- Estrutura modular não é reconhecida
- Dependências entre módulos não são resolvidas

### Soluções Propostas

- Atualizar `build-rollup.js` para:
  - Reconhecer imports entre módulos
  - Gerar builds separados por módulo

## 3. Templates

### Melhorias Sugeridas

- Adicionar suporte a templates TypeScript
- Manter templates JavaScript existentes

## Próximos Passos

1. Implementar mudanças incrementais
2. Testar cada componente isoladamente
3. Validar com builds existentes
