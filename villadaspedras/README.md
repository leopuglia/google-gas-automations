# Villa das Pedras - Automações para Google Apps Script

Automações para planilhas da Villa das Pedras desenvolvidas em TypeScript e compiladas para Google Apps Script.

## Estrutura do Projeto

```bash
villadaspedras/
├── src/                        # Código-fonte em TypeScript
│   ├── commons/                # Código comum compartilhado entre todos os projetos
│   │   ├── date/               # Utilitários de data
│   │   ├── sheet/              # Utilitários de planilha
│   │   ├── utils/              # Utilitários diversos
│   │   ├── Main.ts             # Ponto de exportação central
│   │   └── constants.ts        # Constantes globais
│   ├── planilha-salario/       # Código específico para planilhas de salário
│   │   ├── modules/            # Módulos de salário
│   │   │   ├── viradaMes.ts    # Funções de virada de mês
│   │   │   ├── viradaAno.ts    # Funções de virada de ano
│   │   │   └── salarioUtils.ts # Funções utilitárias
│   │   └── Salario.ts          # Ponto de entrada do módulo
│   └── planilha-consumo/       # Código específico para planilhas de consumo
│       ├── modules/            # Módulos de consumo
│       │   ├── viradaMes.ts    # Funções de virada de mês
│       │   ├── viradaAno.ts    # Funções de virada de ano
│       │   └── consumoUtils.ts # Funções utilitárias
│       └── Consumo.ts          # Ponto de entrada do módulo
├── build/                      # Código compilado (gerado automaticamente)
│   ├── salario-2024/           # Build específico para planilha de salário 2024
│   ├── consumo-cafeteria-2024/ # Build específico para planilha de consumo Cafeteria 2024
│   ├── consumo-saara-2024/     # Build específico para planilha de consumo Saara 2024
│   ├── consumo-castelo-2024/   # Build específico para planilha de consumo Castelo 2024
│   └── consumo-stones-2024/    # Build específico para planilha de consumo Stones 2024
└── scripts/                    # Scripts auxiliares
    ├── debug.ts                # Script para envio de código ao ambiente de teste
    ├── execute-remote.ts       # Script para execução remota de funções
    ├── debug-help.ts           # Instruções de depuração
    ├── prepare-builds.ts       # Prepara builds para deploy
    ├── push-project.ts         # Envia código para o GAS
    └── push-all.ts             # Envia todos os projetos
```

## Fluxo de Trabalho

1. Desenvolva o código em TypeScript nos diretórios `src/`
2. Execute `pnpm run build` para compilar todo o código TypeScript
3. Execute `pnpm run prepare:PROJETO` para preparar o build específico para um projeto (ex: `pnpm run prepare:salario`)
4. Execute `pnpm run push:PROJETO` para enviar o código para o Google Apps Script (ex: `pnpm run push:salario`)
5. Execute `pnpm run push:all` para enviar o código para todos os projetos
6. Para debug, use `pnpm run debug:PROJETO` ou `pnpm run execute:PROJETO`

## Projetos Configurados

### Planilha de Salário

- **Salário 2024**
  - ID: 1piXZFH-QithkQm-Q5_S2HVsAZAlURV9iPKvgA_h4icEnNL9cJ0WgtMMJ
  - Comando: `pnpm run push:salario`

### Planilhas de Consumo

- **Cafeteria 2024**
  - ID: 11vi0dyEeT43B9Gzprc_FoyqZfKAt_SpmPERsF0MpMG-9tOMWT_YkDa1p
  - Comando: `pnpm run push:consumo:cafeteria`
- **Saara 2024**
  - ID: 1hXR1oaQdUJTNgYHS6cWrd1_F5Z-cV7U1I1tz4CHrfatkIFVmzW9N145W
  - Comando: `pnpm run push:consumo:saara`
- **Castelo 2024**
  - ID: 1JmMj09mr2XZCoL04I5w9Bqkwd9-Vy3YtwRALiy-w7ItHQeC2lxg7PyGP
  - Comando: `pnpm run push:consumo:castelo`
- **Stones 2024**
  - ID: 1nioOhx_pLkusxhjPrchT4S0ToBW93YygTppDWfSZkpbKuZDr22AjRcv9
  - Comando: `pnpm run push:consumo:stones`
## Comandos Disponíveis

```bash
# Instalar dependências
pnpm install

# Compilar todo o código TypeScript
pnpm run build

# Preparar build específico para um projeto
pnpm run prepare:salario
pnpm run prepare:consumo:cafeteria
pnpm run prepare:consumo:saara
pnpm run prepare:consumo:castelo
pnpm run prepare:consumo:stones

# Enviar código para o Google Apps Script
pnpm run push:salario
pnpm run push:consumo:cafeteria
pnpm run push:consumo:saara
pnpm run push:consumo:castelo
pnpm run push:consumo:stones

# Enviar código para todos os projetos
pnpm run push:all

# Debug e Execução Remota
pnpm run debug:salario
pnpm run debug:consumo:cafeteria
pnpm run execute:salario
pnpm run execute:consumo:cafeteria
pnpm run debug:help

# Compilar automaticamente quando houver alterações
pnpm run watch

# Verificar erros de linting
pnpm run lint

# Corrigir erros de linting automaticamente
pnpm run lint:fix

# Formatar o código com Prettier
pnpm run format
```

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
## Como Adicionar Novos Projetos

Para adicionar um novo projeto (por exemplo, para o ano 2025):

1. Adicione a configuração do projeto no arquivo `config.yml`
2. Atualize os scripts correspondentes no `package.json`
3. Execute o comando de preparação e push:

```bash
pnpm run prepare:salario
pnpm run push:salario
```

## Desenvolvimento Modular

- O código em TypeScript é organizado em módulos reutilizáveis
- As funções comuns estão separadas em diretórios específicos:
  - `commons/date/`: Funções para manipulação de datas
  - `commons/sheet/`: Funções para manipulação de planilhas
  - `commons/utils/`: Funções utilitárias diversas
- As implementações específicas estão divididas em módulos:
  - `planilha-salario/modules/viradaMes.ts`: Funções de virada de mês para salário
  - `planilha-salario/modules/viradaAno.ts`: Funções de virada de ano para salário
  - `planilha-consumo/modules/viradaMes.ts`: Funções de virada de mês para consumo
  - `planilha-consumo/modules/viradaAno.ts`: Funções de virada de ano para consumo
- Ao compilar, o código é transformado em arquivos .gs para compatibilidade com o Google Apps Script
- Cada projeto tem seu próprio diretório de build com configuração específica

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

## Notas

- Ao fazer alterações no código comum, é necessário recompilar e fazer push para todos os projetos
- As funções exportadas estarão disponíveis globalmente no ambiente do Google Apps Script
- Não é necessário criar uma biblioteca separada, pois o código comum é incluído diretamente em cada projeto

## Créditos

Desenvolvido por [Leonardo Puglia](mailto:leo@villadaspedras.com para o Villa das Pedras.

## Licença

Reservado. Uso interno apenas.
