# Google Apps Scripts Automações - Villa das Pedras

Repositório centralizado de automações e macros para as planilhas do Villa das Pedras.

## Estrutura do Projeto

O projeto está organizado como um monorepo TypeScript, contendo todos os scripts de automação utilizados nas planilhas de salários e consumo do Villa das Pedras.

```bash
.
├── scripts/             # Scripts de automação para o projeto
├── templates/           # Templates para novos projetos
└── villadaspedras/      # Módulo principal com todas as implementações
    ├── build/           # Código compilado
    ├── scripts/         # Scripts específicos do módulo
    │   ├── debug.ts             # Script para envio de código ao ambiente de teste
    │   ├── execute-remote.ts    # Script para execução remota de funções
    │   ├── debug-help.ts        # Instruções de depuração
    │   ├── prepare-builds.ts    # Prepara builds para deploy
    │   ├── push-project.ts      # Envia código para o GAS
    │   └── push-all.ts          # Envia todos os projetos
    ├── config.yml       # Configuração dos projetos
    ├── config.test.yml  # Configuração para ambiente de teste
    └── src/             # Código fonte TypeScript
        ├── commons/     # Código compartilhado entre os projetos
        │   ├── date/    # Utilitários de data
        │   ├── sheet/   # Utilitários de planilha
        │   ├── utils/   # Utilitários diversos
        │   ├── Main.ts  # Ponto de exportação central
        │   └── constants.ts # Constantes globais
        ├── planilha-salario/  # Implementação para planilha de salário
        │   ├── modules/ # Módulos de salário
        │   │   ├── viradaMes.ts    # Funções de virada de mês
        │   │   ├── viradaAno.ts    # Funções de virada de ano
        │   │   └── salarioUtils.ts # Funções utilitárias
        │   └── Salario.ts # Ponto de entrada do módulo
        └── planilha-consumo/  # Implementação para planilha de consumo
            ├── modules/ # Módulos de consumo
            │   ├── viradaMes.ts    # Funções de virada de mês
            │   ├── viradaAno.ts    # Funções de virada de ano
            │   └── consumoUtils.ts # Funções utilitárias
            └── Consumo.ts # Ponto de entrada do módulo
```

## Projetos Atuais

### Planilhas de Salário

- **salario-2024**: Planilha de salários do ano 2024

### Planilhas de Consumo

- **consumo-cafeteria-2024**: Planilha de consumo da Cafeteria para 2024
- **consumo-saara-2024**: Planilha de consumo do Saara para 2024
- **consumo-castelo-2024**: Planilha de consumo do Castelo para 2024
- **consumo-stones-2024**: Planilha de consumo do Stones para 2024

## Como Usar

### Requisitos

- [Node.js](https://nodejs.org/en/) (v16+)
- [pnpm](https://pnpm.io/) (v8+)
- [clasp](https://github.com/google/clasp) (instalado globalmente)

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
cd villadaspedras
pnpm install
```

### Desenvolvimento

O desenvolvimento é realizado no diretório `src/` em TypeScript. O código é compilado para JavaScript e depois convertido para o formato .gs do Google Apps Script.

#### Compilar o código

```bash
cd villadaspedras
pnpm run build
```

#### Preparar o build para um projeto específico

```bash
cd villadaspedras
pnpm run prepare:salario
# ou
pnpm run prepare:consumo:cafeteria
```

#### Enviar o código para o Google Apps Script

```bash
cd villadaspedras
pnpm run push:salario
# ou
pnpm run push:consumo:cafeteria
```

#### Debug e Execução Remota

O projeto conta com um sistema robusto de debug e execução remota:

```bash
# Enviar código para ambiente de teste
pnpm run debug:salario
pnpm run debug:consumo:cafeteria

# Executar funções remotamente e ver logs
pnpm run execute:salario
pnpm run execute:consumo:cafeteria

# Ver instruções de depuração
pnpm run debug:help
```

### Criando um Novo Projeto

Para adicionar um novo projeto (por exemplo, para o ano 2025):

1. Adicione a configuração do projeto no arquivo `config.yml`
2. Atualize os scripts correspondentes no `package.json`
3. Execute o comando de preparação e push:

```bash
pnpm run prepare:salario
pnpm run push:salario
```

## Principais Funcionalidades

### Planilha de Salário
- Virada de mês
- Virada de ano
- Reordenação de nomes
- Proteção de abas
- Limpeza de dados

### Planilha de Consumo
- Virada de mês
- Virada de ano
- Proteção de abas
- Limpeza de dados

## Convenções de Código

- Indentação: 2 espaços
- Aspas simples para strings
- Ponto e vírgula ao final das instruções
- Documentação JSDoc para todas as funções
- Tipagem explícita para parâmetros e retornos de funções
- Nomes de funções em camelCase
- Constantes globais em UPPER_SNAKE_CASE
- Exportação explícita das funções a serem expostas globalmente
- Uso de interfaces e tipos para melhorar a legibilidade e manutenção
- Evitar o uso de `any` sempre que possível
- Preferir funções com propósito único e bem definido
- Comentários em português do Brasil


## Sistema de Debug

O projeto inclui um sistema completo para facilitar o desenvolvimento e depuração:

### Opções de Depuração

1. **Depuração Local com Logs**
   - Adicione declarações `console.log()` em pontos estratégicos do código TypeScript
   - Execute o script de execução remota para ver os logs no terminal

2. **Depuração no Editor do Google Apps Script**
   - Use os scripts de debug para enviar o código para o Google Apps Script
   - Acesse o editor do Google Apps Script no navegador
   - Adicione breakpoints clicando na margem esquerda do editor

3. **Execução Remota com Logs**
   - Use os scripts de execução remota para executar funções e ver logs
   - Selecione a função que deseja executar
   - Escolha se deseja ver os logs após a execução

### Fluxo de Trabalho Recomendado

1. Desenvolva o código em TypeScript com logs adequados
2. Compile o código com `pnpm run build`
3. Envie o código para o Google Apps Script com `pnpm run debug:salario`
4. Execute as funções remotamente com `pnpm run execute:salario`
5. Analise os logs para identificar problemas
6. Faça as correções necessárias e repita o processo

## Créditos

Desenvolvido por [Leonardo Puglia](mailto:leo@villadaspedras.com) para o Villa das Pedras.

## Licença

Reservado. Uso interno apenas.
