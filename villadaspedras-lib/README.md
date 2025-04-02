# VilladasPedrasLib

Biblioteca com funções auxiliares para as macros de virada de mês e ano das planilhas de consumo e salário da Villa das Pedras.

## Versão

0.1.4 (05/09/2024)

## Autor

Leonardo Puglia

## Descrição

Este projeto contém scripts do Google Apps Script (GAS) para automação de tarefas relacionadas às planilhas de consumo e salário da Villa das Pedras. O código foi migrado para TypeScript para melhor manutenção e desenvolvimento.

## Estrutura do Projeto

```bash
villadaspedras-lib/
├── .clasp.json        # Configuração do clasp
├── .eslintrc.json     # Configuração do ESLint
├── .prettierrc        # Configuração do Prettier
├── package.json       # Dependências e scripts
├── tsconfig.json      # Configuração do TypeScript
├── src/               # Código fonte em TypeScript
│   └── Main.ts        # Arquivo principal com as funções
└── build/             # Código compilado (gerado automaticamente)
```

## Fluxo de Trabalho

1. Desenvolvimento em TypeScript na pasta `src/`
2. Compilação para JavaScript na pasta `build/`
3. Upload para o Google Apps Script usando o clasp

## Comandos Disponíveis

```bash
# Instalar dependências
pnpm install

# Compilar o código TypeScript
pnpm build

# Compilar e enviar para o Google Apps Script
pnpm push

# Baixar o código do Google Apps Script
pnpm pull

# Compilar e fazer deploy de uma nova versão
pnpm deploy

# Compilar automaticamente quando houver alterações
pnpm watch

# Verificar erros de linting
pnpm lint

# Corrigir erros de linting automaticamente
pnpm lint:fix

# Formatar o código com Prettier
pnpm format
```

## Extensões Recomendadas para VS Code/Windsurf

- **ESLint**: Integração do ESLint com o VS Code
- **Prettier - Code formatter**: Formatação automática do código
- **Google Apps Script**: Suporte para desenvolvimento de GAS
- **TypeScript**: Suporte para desenvolvimento em TypeScript

## Desenvolvimento

1. Faça alterações nos arquivos TypeScript na pasta `src/`
2. Execute `pnpm build` para compilar o código
3. Execute `pnpm push` para enviar o código para o Google Apps Script
4. Teste as alterações no ambiente do Google Apps Script

## Notas

- O código é compilado de TypeScript para JavaScript antes de ser enviado para o Google Apps Script
- As funções exportadas no arquivo `Main.ts` estarão disponíveis globalmente no ambiente do Google Apps Script
- Utilize o comando `pnpm watch` durante o desenvolvimento para compilação automática
