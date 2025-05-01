# Análise e Plano de Implementação do Sistema de Build Flexível

## Objetivo

Criar um sistema de build e deploy totalmente flexível e genérico para projetos Google Apps Script em TypeScript, permitindo:

- Build, deploy e push automatizados para múltiplos projetos, ambientes (dev/prod), anos e subprojetos (ex: PDVs)
- Uso de templates Handlebars e arquivos de configuração YAML para gerar bundles e arquivos de deploy de forma genérica
- Fácil manutenção e expansão futura, sem hardcoding de nomes de projetos, anos ou PDVs

## Análise da Situação Atual

### Problemas Identificados

1. **Hardcoding de valores**: Nomes de projetos, anos e PDVs estão hardcoded em scripts
2. **Falta de flexibilidade**: Adicionar novos projetos ou anos requer modificar o código JavaScript
3. **Duplicação de código**: Lógica similar repetida para diferentes projetos
4. **Comandos específicos**: Muitos scripts no package.json para cada combinação de projeto/ambiente
5. **Estrutura de diretórios inconsistente**: Diferentes padrões de nomenclatura entre src e build

### Oportunidades de Melhoria

1. **Configuração centralizada**: Mover toda a lógica de estrutura para um arquivo YAML
2. **Parametrização**: Usar parâmetros genéricos em vez de valores hardcoded
3. **Templates dinâmicos**: Usar Handlebars para substituição de variáveis em templates
4. **Comandos genéricos**: Simplificar scripts no package.json com parâmetros
5. **Estrutura padronizada**: Alinhar nomenclatura entre diretórios src e build

## Plano de Implementação

### 1. Refatoração do Sistema de Build

- Criar um script único e genérico para processamento de projetos
- Implementar lógica para processar estruturas aninhadas (ano, pdv, etc.)
- Usar templates Handlebars para substituição de variáveis

### 2. Configuração via YAML

- Definir estrutura de projetos no arquivo de configuração
- Incluir configurações para múltiplos ambientes (dev/prod)
- Permitir definição de estruturas aninhadas (ano, pdv, etc.)
- Configurar caminhos de diretórios (src, build, dist, etc.)

### 3. Parametrização de Comandos

- Simplificar scripts no package.json
- Implementar parâmetros genéricos (--project, --env, --year, --pdv, etc.)
- Permitir processamento de todos os projetos ou filtrado por parâmetros

### 4. Limpeza e Organização

- Implementar limpeza automática de diretórios antes do deploy
- Padronizar nomenclatura de diretórios e arquivos
- Remover código duplicado e inconsistências

## Resultado Esperado

Um sistema de build e deploy que:

1. Processa todos os projetos definidos no YAML ou filtrados por parâmetros
2. Gera automaticamente diretórios de saída com base em templates
3. Suporta múltiplos ambientes, anos e PDVs sem modificar o código
4. Permite fácil expansão para novos projetos e estruturas
5. Mantém comandos simples e genéricos no package.json
