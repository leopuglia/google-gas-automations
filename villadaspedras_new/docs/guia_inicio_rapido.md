# Guia de Início Rápido - Sistema de Build Flexível

Este guia fornece instruções rápidas para começar a usar o sistema de build flexível para projetos Google Apps Script.

## Pré-requisitos

- Node.js (versão 16+)
- pnpm (preferido em vez de npm ou yarn)
- Conta Google com acesso ao Google Apps Script
- Clasp instalado e autenticado (`pnpm install -g @google/clasp` e `clasp login`)

## Instalação

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   cd villadaspedras_new
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

## Comandos Básicos

### Build

Compila o código TypeScript para JavaScript:

```bash
pnpm run build
```

### Deploy

Deploy para o ambiente de desenvolvimento:

```bash
pnpm run deploy:dev
```

Deploy para o ambiente de produção:

```bash
pnpm run deploy:prod
```

### Push

Deploy e push para o Google Apps Script (desenvolvimento):

```bash
pnpm run deploy:dev:push
```

Deploy e push para o Google Apps Script (produção):

```bash
pnpm run deploy:prod:push
```

### Limpeza

Limpar diretórios antes do deploy:

```bash
pnpm run deploy:clean
```

## Filtragem por Parâmetros

O sistema permite filtrar projetos, anos e PDVs usando parâmetros:

### Por Projeto

```bash
pnpm run deploy:dev -- --project=salario
pnpm run deploy:dev -- --project=consumo
```

### Por Ano

```bash
pnpm run deploy:dev -- --year=2024
```

### Por PDV (para projeto consumo)

```bash
pnpm run deploy:dev -- --project=consumo --pdv=1-cafeteria
pnpm run deploy:dev -- --project=consumo --pdv=2-saara
```

### Combinações

```bash
pnpm run deploy:prod -- --project=consumo --year=2024 --pdv=1-cafeteria
```

## Estrutura do Projeto

```text
villadaspedras_new/
│── src/                    # Código fonte TypeScript
│   │── commons/            # Código compartilhado
│   │── planilha-salario/   # Código do projeto salário
│   │── planilha-consumo/   # Código do projeto consumo
│   └── example/            # Projeto de exemplo
│── build/                  # Código compilado (output do Rollup)
│── dist/                   # Arquivos de deploy (output para Clasp)
│   │── dev/                # Ambiente de desenvolvimento
│   └── prod/               # Ambiente de produção
│── templates/              # Templates para arquivos de deploy
│── scripts/                # Scripts de build e deploy
│── config.yml              # Configuração do sistema de build
│── rollup.config.js        # Configuração do Rollup
│── package.json            # Scripts e dependências
```

## Fluxo de Trabalho Típico

1. **Desenvolvimento**:
   - Edite o código TypeScript em `src/`
   - Execute `pnpm run build` para compilar

2. **Teste Local**:
   - Execute `pnpm run deploy:dev` para gerar arquivos de deploy
   - Execute `pnpm run deploy:dev:push` para enviar ao Google Apps Script
   - Teste no ambiente de desenvolvimento

3. **Produção**:
   - Quando estiver pronto, execute `pnpm run deploy:prod:push`
   - Verifique no ambiente de produção

## Adicionando Novos Projetos

1. Crie o diretório do projeto em `src/`
2. Adicione o código TypeScript necessário
3. Atualize o `rollup.config.js` para incluir o novo projeto
4. Adicione a configuração do projeto em `config.yml`
5. Execute o build e deploy

## Solução de Problemas

### Erro no Build

Verifique:
- Erros de sintaxe no TypeScript
- Configuração correta no `rollup.config.js`
- Dependências instaladas

### Erro no Deploy

Verifique:
- Configuração correta no `config.yml`
- Diretórios de build existem e contêm os arquivos necessários
- Permissões corretas no Google Apps Script

### Erro no Push

Verifique:
- Autenticação do Clasp (`clasp login`)
- Script IDs corretos no `config.yml`
- Permissões de acesso aos scripts do Google Apps Script

## Próximos Passos

Para informações mais detalhadas, consulte:


- [Sistema de Build Flexível](./sistema_build_flexivel.md)
- [Referência de Configuração YAML](./configuracao_yaml_referencia.md)
- [Análise do Sistema de Build](./analise_sistema_build_flexivel.md)
