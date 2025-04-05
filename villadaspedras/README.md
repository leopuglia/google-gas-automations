# Template para Automações em Google Apps Script

Template genérico para automações de planilhas do Google desenvolvidas em TypeScript e compiladas para Google Apps Script. Este projeto foi criado para facilitar o desenvolvimento e manutenção de scripts para o Google Apps Script, permitindo o uso de TypeScript com uma estrutura modular e flexível.

## Estrutura do Projeto

```bash
template-gas/
├── src/                        # Código-fonte em TypeScript
│   ├── commons/                # Código comum compartilhado entre todos os projetos
│   │   ├── date/               # Utilitários de data
│   │   ├── sheet/              # Utilitários de planilha
│   │   ├── utils/              # Utilitários diversos
│   │   ├── Main.ts             # Ponto de exportação central
│   │   └── constants.ts        # Constantes globais
│   ├── projeto-tipo-a/         # Código específico para projetos do tipo A
│   │   ├── modules/            # Módulos do projeto A
│   │   │   ├── moduleA.ts      # Funções específicas do módulo A
│   │   │   └── utilsA.ts       # Funções utilitárias
│   │   └── ProjetoA.ts         # Ponto de entrada do módulo
│   └── projeto-tipo-b/         # Código específico para projetos do tipo B
│       ├── modules/            # Módulos do projeto B
│       │   ├── moduleB.ts      # Funções específicas do módulo B
│       │   └── utilsB.ts       # Funções utilitárias
│       └── ProjetoB.ts         # Ponto de entrada do módulo
├── build/                      # Código compilado (gerado automaticamente)
│   ├── projeto-a-2024/         # Build específico para projeto A 2024
│   └── projeto-b-subchave1-2024/ # Build específico para projeto B subchave1 2024
├── scripts/                    # Scripts auxiliares
│   ├── build-deploy.js         # Script principal para build e deploy
│   ├── build-rollup.js         # Script para build usando rollup
│   └── process-templates.js    # Script para processamento de templates
├── config.yml                  # Configuração principal dos projetos
└── config.example.yml          # Exemplo de configuração para referência
```

## Fluxo de Trabalho

1. Desenvolva o código em TypeScript nos diretórios `src/`
2. Execute `pnpm run build` para compilar todo o código TypeScript
3. Execute `pnpm run push:project` para enviar o código para o Google Apps Script
4. Para projetos com subchaves, use `pnpm run push:project:key` substituindo PROJECT e KEY pelos valores adequados
5. Para debug, use `pnpm run debug:project` ou `pnpm run execute:project`
6. Para ambiente de produção, adicione `:prod` aos comandos (ex: `pnpm run push:project:prod`)

## Configuração de Projetos

O template suporta configuração dinâmica de projetos através do arquivo `config.yml`. Existem duas maneiras de configurar projetos:

### 1. Projetos Padrão (defaultProjects)

Defina projetos padrão que serão usados quando não houver configurações específicas:

```yaml
defaultProjects:
  projeto-tipo-a:
    src: caminho-fonte-a
    output: saida-a
    outputTemplate: '{{year}}-saida-a'
    dependencies:
      - userSymbol: Drive
        version: v3
    sheetsMacros:
      - menuName: 1. AÇÃO PRINCIPAL
        functionName: acaoPrincipal
```

### 2. Projetos Específicos (projects)

Defina projetos específicos com suas próprias configurações:

```yaml
projects:
  meu-projeto:
    src: pasta-fonte
    output: saida
    outputTemplate: "{{key-1}}-saida"
    nameTemplate: "Projeto {{key-1}} {{ambiente}}"
    dev:
      2024:
        scriptId: 1abc123456789
        linkedFileId: 1abc123456789
```

### 3. Projetos com Subchaves

Para projetos com subchaves (como diferentes instâncias do mesmo tipo):

```yaml
projects:
  meu-projeto-b:
    nested:
      subchave-1:
        propriedade: Valor 1
      subchave-2:
        propriedade: Valor 2
    dev:
      2024:
        subchave-1:
          scriptId: 1abc123456789
          linkedFileId: 1abc123456789
```
## Comandos Disponíveis

```bash
# Instalar dependências
pnpm install

# Compilar todo o código TypeScript
pnpm run build

# Compilar em modo de desenvolvimento (watch)
pnpm run watch

# Comandos de build
pnpm run build:dev    # Build para ambiente de desenvolvimento
pnpm run build:prod   # Build para ambiente de produção

# Comandos genéricos de push (envio para o Google Apps Script)
pnpm run push:dev     # Enviar todos os projetos para ambiente de desenvolvimento
pnpm run push:prod    # Enviar todos os projetos para ambiente de produção

# Comandos para projetos específicos
pnpm run push:project           # Enviar projeto para ambiente de desenvolvimento
pnpm run push:project:prod      # Enviar projeto para ambiente de produção
pnpm run push:project:key       # Enviar projeto com subchave para desenvolvimento
pnpm run push:project:key:prod  # Enviar projeto com subchave para produção

# Comandos de execução remota
pnpm run execute:project        # Executar funções remotamente (desenvolvimento)
pnpm run execute:project:prod   # Executar funções remotamente (produção)
pnpm run execute:project:key    # Executar funções remotamente com subchave

# Comandos de debug
pnpm run debug:project          # Debug de projeto (desenvolvimento)
pnpm run debug:project:prod     # Debug de projeto (produção)
pnpm run debug:project:key      # Debug de projeto com subchave

# Comandos de linting e formatação
pnpm run lint                   # Verificar erros de linting
pnpm run lint:fix               # Corrigir erros de linting automaticamente
pnpm run format:source          # Formatar código fonte com Prettier
pnpm run format:build           # Formatar código compilado
```

> **Nota:** Para usar os comandos com projetos e subchaves específicos, substitua `project` e `key` pelos valores correspondentes na sua configuração.

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

Para adicionar um novo projeto:

1. Adicione a configuração do projeto no arquivo `config.yml` na seção `projects` ou `defaultProjects`
2. Use os comandos genéricos para build e deploy:

```bash
# Para um novo projeto chamado 'meu-projeto'
pnpm run push:meu-projeto

# Para um projeto com subchave
pnpm run push:meu-projeto:subchave-1
```

Não é necessário modificar o `package.json`, pois os comandos são genéricos e funcionam com qualquer nome de projeto definido no `config.yml`.

## Recursos do Template

### 1. Processamento Dinâmico de Templates

O template suporta substituição de variáveis dinâmicas em configurações:

- Use `{{variavel}}` em templates para substituição automática
- Variáveis disponíveis incluem chaves dinâmicas, ambiente, e propriedades específicas
- Exemplo: `outputTemplate: "{{year}}-{{key}}-output"` gera diretórios como `2024-subchave1-output`

### 2. Estrutura Modular

- Código organizado em módulos reutilizáveis
- Funções comuns separadas em diretórios específicos
- Implementações específicas divididas por tipo de projeto
- Compilação para arquivos .gs compatíveis com o Google Apps Script
- Cada projeto tem seu próprio diretório de build com configuração específica

### 3. Configuração Flexível

- Suporte para projetos padrão (defaultProjects)
- Projetos específicos com configurações personalizadas
- Projetos aninhados com subchaves
- Ambientes de desenvolvimento e produção separados
- Configuração de dependências do Google Apps Script
- Definição de macros para planilhas

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

## Dicas e Boas Práticas

- Ao fazer alterações no código comum, recompile e faça push para todos os projetos
- As funções exportadas estarão disponíveis globalmente no ambiente do Google Apps Script
- Use templates para nomes de arquivos e diretórios para manter consistência
- Aproveite a estrutura modular para reutilizar código entre projetos
- Utilize as chaves dinâmicas para criar configurações flexíveis

## Depuração

O template inclui ferramentas para facilitar a depuração:

- Logs locais com `console.log()`
- Execução remota de funções com visualização de logs
- Integração com o editor do Google Apps Script para breakpoints
- Comandos específicos para debug (`debug:project`)

## Licença

MIT

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

Reservado. Uso interno apenas.
