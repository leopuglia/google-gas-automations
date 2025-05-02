# Villa das Pedras - Sistema de Build Flexível para Google Apps Script

Sistema de build e deploy totalmente flexível e genérico para projetos Google Apps Script em TypeScript, utilizando templates Handlebars e configuração YAML.

## Visão Geral

Este projeto implementa um sistema de build e deploy que permite:

- Build, deploy e push automatizados para múltiplos projetos
- Suporte a múltiplos ambientes (dev/prod)
- Suporte a estruturas aninhadas (ano, pdv, etc.)
- Configuração centralizada via YAML
- Templates dinâmicos com Handlebars
- Comandos simplificados no package.json

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
│── docs/                   # Documentação do projeto
│── config.yml              # Configuração do sistema de build
│── rollup.config.js        # Configuração do Rollup
│── package.json            # Scripts e dependências
│── tsconfig.json           # Configuração TypeScript
└── README.md               # Documentação principal
```

## Configuração Inicial

Para configurar o projeto, execute:

```bash
# Instalar dependências
pnpm install

# Login no Google (necessário apenas uma vez)
pnpm dlx @google/clasp login
```

## Comandos Disponíveis

### Build e Deploy

```bash
# Compilar o projeto
pnpm run build

# Limpar diretórios
pnpm run clean

# Deploy para ambiente de desenvolvimento
pnpm run deploy:dev

# Deploy para ambiente de produção
pnpm run deploy:prod

# Deploy e push para o Google Apps Script (desenvolvimento)
pnpm run deploy:dev:push

# Deploy e push para o Google Apps Script (produção)
pnpm run deploy:prod:push

# Deploy com limpeza de diretórios
pnpm run deploy:clean
```

### Filtragem por Parâmetros

```bash
# Deploy de um projeto específico
pnpm run deploy:dev -- --project=salario

# Deploy para um ano específico
pnpm run deploy:dev -- --year=2024

# Deploy para um PDV específico
pnpm run deploy:dev -- --project=consumo --pdv=1-cafeteria

# Combinações de parâmetros
pnpm run deploy:prod -- --project=consumo --year=2024 --pdv=1-cafeteria
```

## Documentação

Para mais informações, consulte os documentos na pasta `docs/`:

- [Guia de Início Rápido](./docs/guia_inicio_rapido.md)
- [Sistema de Build Flexível](./docs/sistema_build_flexivel.md)
- [Ordem de Envio e Build Automático](./docs/ordem_envio_e_build_automatico.md)
- [Modularização do Código](./docs/modularizacao_do_codigo.md)
- [Referência de Configuração YAML](./docs/configuracao_yaml_referencia.md)
- [Análise do Sistema de Build](./docs/analise_sistema_build_flexivel.md)

## Testes

Os testes utilizam Jest com mocks para simular o ambiente do Google Apps Script.
Execute os testes com `pnpm test`.

## Implantação

Para implantar no Google Apps Script:

1. Configure o arquivo `.clasp.json` com seu scriptId
2. Execute `pnpm push` para enviar o código
