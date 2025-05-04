# Guia de Início Rápido - GAS Builder

> Data: 02/05/2025

Este guia fornece instruções passo a passo para começar a usar o sistema Google Apps Script Builder. Ele é destinado a novos usuários que desejam configurar rapidamente o ambiente e criar seu primeiro projeto.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [pnpm](https://pnpm.io/) (gerenciador de pacotes preferido)
- [clasp](https://github.com/google/clasp) (CLI do Google Apps Script)
- [Git](https://git-scm.com/) (para controle de versão)

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/google-gas-automations.git
cd google-gas-automations
```

2. Instale as dependências:

```bash
pnpm install
```

3. Faça login no Google Apps Script:

```bash
pnpm clasp login
```

## Estrutura do Projeto

```
.
├── build/              # Código compilado para deploy
├── docs/               # Documentação do projeto
├── scripts/            # Scripts de build e deploy
├── src/                # Código-fonte TypeScript
│   ├── commons/        # Código compartilhado
│   └── example/        # Projeto de exemplo
├── templates/          # Templates para arquivos de configuração
├── tests/              # Testes unitários
├── config.yml          # Configuração principal do projeto
└── package.json        # Configuração do npm/pnpm
```

## Criando um Novo Projeto

### 1. Configure o Projeto no Google Apps Script

1. Acesse [script.google.com](https://script.google.com/)
2. Crie um novo projeto
3. Anote o ID do script (encontrado em Configurações do Projeto)

### 2. Configure o Projeto no Arquivo config.yml

Adicione seu projeto ao arquivo `config.yml`:

```yaml
projects:
  meu-projeto:
    src: meu-projeto
    output: meu-projeto
    environments:
      dev:
        scriptId: SEU_SCRIPT_ID_DEV
      prod:
        scriptId: SEU_SCRIPT_ID_PROD
```

### 3. Crie a Estrutura de Diretórios

```bash
mkdir -p src/meu-projeto
```

### 4. Crie seu Primeiro Script

Crie um arquivo `src/meu-projeto/index.ts`:

```typescript
/**
 * Função que será exposta no Google Apps Script
 */
function minhaFuncao() {
  Logger.log('Olá, mundo!');
  return 'Olá, mundo!';
}

// Exportar funções que devem ser expostas globalmente
export { minhaFuncao };
```

## Compilando e Fazendo Deploy

### 1. Compilar o Projeto

```bash
pnpm run build
```

Isso irá compilar seu código TypeScript para JavaScript no diretório `build/`.

### 2. Deploy para Ambiente de Desenvolvimento

```bash
pnpm run deploy:dev -- --project=meu-projeto
```

### 3. Deploy para Ambiente de Produção

```bash
pnpm run deploy:prod -- --project=meu-projeto
```

### 4. Deploy com Push (Envio para o Google Apps Script)

```bash
pnpm run deploy:dev:push -- --project=meu-projeto
```

## Verificando o Resultado

1. Acesse [script.google.com](https://script.google.com/)
2. Abra seu projeto
3. Verifique se o código foi atualizado
4. Execute a função `minhaFuncao` para testar

## Comandos Úteis

```bash
# Limpar diretórios de build
pnpm run clean

# Build com watch (recompila automaticamente ao salvar)
pnpm run watch

# Executar testes
pnpm run test

# Verificar erros de lint
pnpm run lint

# Formatar código
pnpm run format
```

## Opções de Linha de Comando

O script de deploy aceita várias opções:

```bash
# Especificar ambiente
--env=dev|prod

# Processar apenas um projeto específico
--project=nome

# Filtrar projetos com chave/valor específicos
--year=2025
--pdv=1-cafeteria

# Limpar diretórios antes de processar
--clean

# Fazer push para o Google Apps Script
--push

# Definir nível de log
--log-level=verbose|debug|info|warn|error|none
```

## Solução de Problemas Comuns

### Erro de Autenticação no Clasp

Se encontrar erros de autenticação:

```bash
# Faça logout e login novamente
pnpm clasp logout
pnpm clasp login
```

### Erro de Compilação TypeScript

Verifique:
- Sintaxe TypeScript
- Imports/exports (nem todas as construções são suportadas pelo GAS)
- Configuração do tsconfig.json

### Erro no Deploy

Verifique:
- ID do script no config.yml
- Permissões de acesso ao script
- Tamanho do bundle (o GAS tem limitações de tamanho)

## Próximos Passos

- Explore a [documentação completa](./00-indice-documentacao.md)
- Veja exemplos práticos na pasta `src/example/`
- Aprenda sobre [configuração avançada](./20-ref-configuracao-yaml.md)
- Consulte o [guia de troubleshooting](./91-guia-troubleshooting.md) para problemas mais complexos

---

Para mais informações, consulte a [documentação de referência](./00-indice-documentacao.md) ou entre em contato com a equipe de desenvolvimento.
