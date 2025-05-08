# Introdução ao GAS Builder

> Última atualização: 06/05/2025

## Resumo

O GAS Builder é um sistema flexível de build e deploy para projetos Google Apps Script, desenvolvido para simplificar o processo de desenvolvimento, compilação e publicação de scripts Google Apps Script (GAS) usando TypeScript e ferramentas modernas de desenvolvimento.

Este documento fornece uma visão geral do projeto, seus objetivos e principais funcionalidades.

## Visão Geral do Projeto

### O que é o GAS Builder?

O GAS Builder é um sistema que permite desenvolvedores criarem aplicativos Google Apps Script usando TypeScript, com suporte a módulos, práticas modernas de desenvolvimento e um fluxo de trabalho baseado em tipos. O sistema facilita:

- Desenvolvimento em TypeScript com checagem de tipos
- Organização do código em módulos e arquivos separados
- Compilação eficiente usando Rollup
- Deploy automatizado para Google Apps Script
- Suporte a múltiplos ambientes (desenvolvimento, produção)
- Configuração flexível baseada em YAML

### Por que usar o GAS Builder?

O desenvolvimento tradicional de Google Apps Script apresenta várias limitações:

- Editor online com recursos limitados
- Dificuldades para organizar código em múltiplos arquivos
- Ausência de tipagem estática
- Complexidade para gerenciar projetos grandes

O GAS Builder resolve esses problemas, permitindo usar um ambiente de desenvolvimento moderno enquanto mantém a compatibilidade com a plataforma Google Apps Script.

### Diferenciais

- **Configuração via YAML**: Toda a configuração é centralizada em arquivos YAML
- **Suporte a projetos aninhados**: Organize seus scripts em estruturas modulares
- **Sistema de templates**: Templates flexíveis para arquivos de configuração
- **Integração com Rollup**: Empacotamento moderno com suporte a plugins
- **TypeScript otimizado**: Configuração específica para Google Apps Script
- **Logging avançado**: Sistema de logging com múltiplos níveis
- **Documentação abrangente**: Guias detalhados e exemplos práticos

## Principais Funcionalidades

### 1. Build Automatizado

- Compilação de TypeScript para JavaScript
- Empacotamento de módulos com Rollup
- Minificação e otimização de código
- Transformação de imports para compatibilidade com GAS

### 2. Sistema de Deploy

- Deploy automatizado via clasp
- Suporte a múltiplos ambientes (dev, prod)
- Push seletivo de arquivos
- Validação pré-deploy

### 3. Configuração Flexível

- Configuração centralizada em YAML
- Herança de configurações (defaults → project → environment)
- Validação de schema para prevenir erros
- Suporte a variáveis de ambiente

### 4. Ferramentas Auxiliares

- CLI para comandos comuns
- Scripts de utilidade para desenvolvimento
- Integração com VS Code
- Suporte a testes automatizados

## Próximos Passos

- Consulte o [01-roadmap-gas-builder.md](./01-roadmap-gas-builder.md) para entender o plano de evolução do projeto
- Siga o [10-guia-inicio-rapido.md](./10-guia-inicio-rapido.md) para começar a usar o GAS Builder
- Explore a [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md) para entender os componentes técnicos

## Referências

- [Google Apps Script](https://developers.google.com/apps-script)
- [TypeScript](https://www.typescriptlang.org/)
- [Rollup](https://rollupjs.org/)
- [Clasp](https://github.com/google/clasp)
