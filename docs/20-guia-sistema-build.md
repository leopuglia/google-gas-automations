# Instruções para o Sistema de Build

Este documento contém instruções para utilizar o sistema de build que foi migrado para a raiz do projeto.

## Estrutura de Diretórios

```bash
/mnt/wsl/linux-dev/linux-projects/google-gas-automations/
├── scripts/
│   ├── build/                    # Scripts do sistema de build
│       ├── clasp-helper.js
│       ├── config-helper.js
│       ├── deploy.js             # Script principal
│       ├── filesystem-helper.js
│       ├── logger.js
│       ├── template-helper.js
│       └── tests/                # Testes para os scripts
├── templates/                    # Templates para arquivos de configuração
│   ├── .clasp-template.json      # Template para o arquivo .clasp.json
│   ├── .claspignore-template     # Template para o arquivo .claspignore
│   ├── appsscript-template.json  # Template para o arquivo appsscript.json
│   └── manifest-template.json    # Template para o arquivo manifest.json
├── config.yml                    # Arquivo de configuração principal
├── package.json                  # Scripts npm para build e deploy
├── rollup.config.js              # Configuração do Rollup
└── tsconfig.json                 # Configuração do TypeScript
```

## Comandos Disponíveis

O sistema de build oferece os seguintes comandos:

```bash
# Build básico
pnpm run build

# Limpar diretórios de build e dist
pnpm run clean

# Deploy para ambiente de desenvolvimento
pnpm run deploy:dev

# Deploy para ambiente de produção
pnpm run deploy:prod

# Deploy e push para ambiente de desenvolvimento
pnpm run deploy:dev:push

# Deploy e push para ambiente de produção
pnpm run deploy:prod:push

# Deploy com limpeza prévia
pnpm run deploy:clean

# Deploy com limpeza prévia e push
pnpm run deploy:clean:push
```

## Opções de Linha de Comando

O script de deploy aceita as seguintes opções:

```bash
# Especificar ambiente (dev ou prod)
--env=dev|prod

# Usar arquivo de configuração alternativo
--config=arquivo.yml

# Processar apenas um projeto específico
--project=nome

# Filtrar projetos com chave/valor específicos
--<key-1>=<value-1>
--<key-2>=<value-2>

Exemplo:
--year=2025
--pdv=1-cafeteria

# Limpar diretórios antes de processar
--clean

# Fazer push para o Google Apps Script após o processamento
--push

# Definir nível de log
--log-level=verbose|debug|info|warn|error|none
```

Exemplos:

```bash
# Deploy de um projeto específico
pnpm run deploy -- --project=salario

# Deploy de um projeto específico com filtro de ano
pnpm run deploy -- --project=salario --year=2024

# Deploy de um projeto de consumo para um PDV específico
pnpm run deploy -- --project=consumo --year=2024 --pdv=1-cafeteria

# Deploy com nível de log detalhado
pnpm run deploy -- --log-level=verbose
```

## Configuração

O sistema de build utiliza o arquivo `config.yml` na raiz do projeto para definir a estrutura dos projetos, ambientes e configurações de build.

Para adicionar um novo projeto:

1. Adicione uma nova seção no arquivo `config.yml` sob a chave `projects`
2. Defina as propriedades básicas do projeto (src, output, etc.)
3. Configure os ambientes (dev, prod) e suas respectivas configurações

Exemplo:

```yaml
projects:
  meu-projeto:
    src: meu-projeto
    output: meu-projeto
    outputTemplate: '{{year}}-{{output}}'
    nameTemplate: 'Meu Projeto {{year}} {{env}}'
    nested:
      - key: year
    environments:
      dev:
        2024:
          templates:
            .clasp-template.json:
              destination-file: .clasp.json
              scriptId: SEU_SCRIPT_ID_DEV
      prod:
        2024:
          templates:
            .clasp-template.json:
              destination-file: .clasp.json
              scriptId: SEU_SCRIPT_ID_PROD
```

## Próximos Passos

Este é apenas o primeiro passo na migração para um sistema de build mais genérico e flexível. Os próximos passos incluem:

1. Refatorar o código para melhorar a organização e modularidade
2. Adicionar testes automatizados mais abrangentes
3. Implementar validação de schema para o arquivo de configuração
4. Melhorar a documentação e adicionar exemplos
5. Preparar para publicação como uma biblioteca pública

Para mais detalhes sobre o plano completo de migração, consulte o documento [10-plano-migracao-gas-builder.md](./10-plano-migracao-gas-builder.md).
