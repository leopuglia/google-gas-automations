# Google Apps Script Builder

Sistema flexível de build e deploy para projetos Google Apps Script, desenvolvido em TypeScript e otimizado para manutenção e escalabilidade. Este projeto permite o desenvolvimento de automações para o Google Apps Script com uma estrutura modular, suporte a múltiplos ambientes e validação robusta.

## Funcionalidades Principais

- **Desenvolvimento em TypeScript**: Utilize TypeScript para desenvolver seus scripts Google Apps Script com tipagem estática e recursos modernos de ES6+.
- **Sistema de Build Flexível**: Compile seus projetos TypeScript para JavaScript otimizado para o Google Apps Script usando Rollup.
- **Suporte a Múltiplos Ambientes**: Configure e faça deploy para ambientes de desenvolvimento e produção com diferentes IDs de script.
- **Validação de Configuração**: Validação automática do arquivo de configuração YAML usando schema JSON.
- **Processamento de Templates**: Sistema de templates para geração de arquivos de configuração do Google Apps Script.
- **Sistema de Versionamento**: Gerenciamento automático de versões com geração de changelog e tags Git.
- **Qualidade de Código**: Integração com ESLint e Prettier para garantir a qualidade e consistência do código.
- **Testes Unitários**: Suporte a testes unitários com Jest e integração com o VS Code Test Explorer.
- **CI/CD**: Integração contínua com GitHub Actions para validação e deploy automático.

## Estrutura do Projeto

```bash
.
├── build/              # Código compilado para deploy
├── docs/               # Documentação do projeto
├── schema/             # Schema JSON para validação da configuração
├── scripts/            # Scripts de build e deploy
│   ├── build/           # Scripts principais do sistema de build
│       ├── clasp-helper.js    # Helper para integração com o clasp
│       ├── config-helper.js   # Helper para carregamento e validação de configuração
│       ├── deploy.js          # Script principal de deploy
│       ├── filesystem-helper.js # Helper para operações de filesystem
│       ├── logger.js          # Sistema de logging com níveis
│       └── template-helper.js  # Helper para processamento de templates
├── src/                # Código-fonte TypeScript
│   ├── commons/          # Código compartilhado entre projetos
│   │   └── utils.ts        # Funções utilitárias comuns
│   ├── example/          # Projeto de exemplo
│   ├── planilha-consumo/  # Implementação para planilha de consumo
│   └── planilha-salario/  # Implementação para planilha de salário
├── templates/          # Templates para arquivos de configuração
├── tests/              # Testes unitários
├── .eslintrc.json      # Configuração do ESLint
├── .prettierrc         # Configuração do Prettier
├── config.yml          # Configuração principal do projeto
├── jest.config.js      # Configuração do Jest para testes
├── rollup.config.js    # Configuração do Rollup para build
└── tsconfig.json       # Configuração do TypeScript
```

## Configuração

A configuração do projeto é feita através do arquivo `config.yml`. Este arquivo define os projetos, ambientes, variáveis de substituição e configurações de build.

### Exemplo de Configuração

```yaml
# Configurações globais
defaults:
  # Caminhos relativos
  paths:
    src: src
    build: build
    templates: templates
  
  # Configurações de template
  templates:
    clasp: clasp.json.template
    appsscript: appsscript.json.template

# Definição dos projetos
projects:
  # Projeto de exemplo
  example:
    # Configurações específicas do projeto
    src: example
    output: example
    environments:
      dev:
        scriptId: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
      prod:
        scriptId: 9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a

  # Projeto de planilha de salário
  salario:
    src: planilha-salario
    output: salario
    # Variáveis para substituição em templates
    keys:
      year: [2024]
    environments:
      dev:
        scriptId: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
      prod:
        scriptId: 9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a

  # Projeto de planilha de consumo
  consumo:
    src: planilha-consumo
    output: consumo
    # Variáveis para substituição em templates
    keys:
      year: [2024]
      pdv: [1-cafeteria, 2-saara, 3-castelo, 4-stones]
    environments:
      dev:
        scriptId: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
      prod:
        scriptId: 9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a
```

## Testes

O projeto utiliza Jest para testes unitários. Os testes estão localizados no diretório `tests/` e podem ser executados com o comando `pnpm run test`.

### Escrevendo Testes

```typescript
// tests/minha-funcao.test.ts
import { describe, expect, it } from '@jest/globals';
import { minhaFuncao } from '../src/meu-projeto/utils';

describe('Minha Função', () => {
  it('deve retornar o resultado esperado', () => {
    expect(minhaFuncao('input')).toBe('resultado esperado');
  });
});
```

### Executando Testes

```bash
# Executar todos os testes
pnpm run test

# Executar testes com cobertura
pnpm run test -- --coverage

# Executar testes em modo watch
pnpm run test -- --watch
```

## CI/CD

O projeto está configurado para integração contínua usando GitHub Actions. Os workflows estão definidos no diretório `.github/workflows/` e incluem:

- **Validação de Código**: Executa lint, formatação e testes unitários.
- **Deploy Automático**: Faz o deploy automático para o ambiente de desenvolvimento quando há push para a branch `develop`.
- **Release**: Faz o deploy para o ambiente de produção quando há uma nova tag de versão.

## Sistema de Build

O sistema de build é responsável por compilar o código TypeScript, processar templates e fazer o deploy para o Google Apps Script. Ele é composto por vários módulos que trabalham em conjunto:

### Componentes do Sistema de Build

#### 1. Gerenciador de Configuração (`config-helper.js`)

- **Carregamento de Configuração**: Carrega o arquivo `config.yml` que define projetos, ambientes e variáveis.
- **Validação de Schema**: Valida a configuração usando o schema JSON definido em `schema/config.schema.json`.
- **Resolução de Caminhos**: Resolve caminhos relativos para diretórios de código-fonte, build e templates.

```javascript
// Exemplo de uso do gerenciador de configuração
const config = loadConfig('config.yml');
const projectConfig = config.projects['example'];
```

#### 2. Processador de Templates (`template-helper.js`)

- **Substituição de Variáveis**: Processa templates Handlebars com variáveis de contexto.
- **Integração com Versionamento**: Inclui automaticamente informações de versão nos arquivos gerados.
- **Suporte a Helpers**: Inclui helpers Handlebars para lógicas condicionais e iterações.

```javascript
// Exemplo de processamento de template
processTemplate(
  'templates/appsscript-template.json',
  'build/example/appsscript.json',
  { timeZone: 'America/Sao_Paulo', runtimeVersion: 'V8' }
);
```

#### 3. Gerenciador de Filesystem (`filesystem-helper.js`)

- **Operações de Diretório**: Cria, limpa e verifica diretórios de build.
- **Otimização de Build**: Evita builds desnecessários verificando se os diretórios de saída existem e não estão vazios.
- **Copia de Arquivos**: Copia arquivos estáticos e recursos para o diretório de build.

#### 4. Integração com Clasp (`clasp-helper.js`)

- **Configuração do Clasp**: Gera arquivos de configuração `.clasp.json` para cada projeto.
- **Push e Deploy**: Executa comandos clasp para enviar código e fazer deploy para o Google Apps Script.
- **Suporte a Múltiplos Ambientes**: Gerencia diferentes IDs de script para ambientes de desenvolvimento e produção.

#### 5. Sistema de Logging (`logger.js`)

- **Níveis de Log**: Suporta diferentes níveis de log (info, verbose, debug, warn, error).
- **Saída Formatada**: Formata mensagens de log com cores e timestamps.
- **Controle de Verbosidade**: Permite ajustar o nível de detalhamento dos logs.

### Fluxo de Build e Deploy

1. **Carregamento de Configuração**: O sistema carrega e valida o arquivo `config.yml`.
2. **Resolução de Projetos**: Determina quais projetos serão processados com base nos argumentos de linha de comando.
3. **Compilação TypeScript**: Compila o código TypeScript para JavaScript usando Rollup.
4. **Processamento de Templates**: Gera arquivos de configuração (`appsscript.json`, `.clasp.json`, etc.) a partir de templates.
5. **Preparação para Deploy**: Organiza os arquivos compilados e configurados no diretório de build.
6. **Push para GAS**: Envia os arquivos para o Google Apps Script usando o clasp.
7. **Deploy (opcional)**: Cria uma nova versão/deploy no Google Apps Script.

### Personalização do Build

O sistema de build pode ser personalizado de várias formas:

- **Configuração de Rollup**: Modifique `rollup.config.js` para ajustar a compilação TypeScript.
- **Templates Personalizados**: Crie novos templates em `templates/` para gerar arquivos específicos.
- **Hooks de Build**: Adicione scripts personalizados que são executados em diferentes fases do build.

## Sistema de Versionamento

O sistema de versionamento permite gerenciar versões do projeto, gerar notas de release e incluir metadados de versão nos builds. Ele é composto pelos seguintes componentes:

### Componentes do Sistema de Versionamento

#### 1. Arquivo de Versão Central (`version.json`)

- **Armazenamento de Metadados**: Mantém informações sobre a versão atual, data e descrição.
- **Formato JSON**: Facilmente legível por humanos e processado por scripts.

```json
{
  "version": "1.0.0",
  "description": "Versão inicial do sistema de build e deploy para Google Apps Script",
  "date": "2024-05-02",
  "author": "Villa das Pedras Team"
}
```

#### 2. Gerenciador de Versões (`scripts/version/version-manager.js`)

- **Incremento de Versões**: Suporte para incrementos major, minor e patch seguindo SemVer.
- **Geração de Changelog**: Cria automaticamente notas de release a partir dos commits Git.
- **Integração com Git**: Cria tags Git para novas versões.
- **Categorização de Commits**: Organiza commits por tipo (feat, fix, docs, etc.) usando conventional commits.

#### 3. Integração com o Sistema de Build

- **Metadados em Templates**: Inclui automaticamente informações de versão em todos os templates processados.
- **Manifesto de Versão**: Gera um arquivo `manifest.json` com detalhes da versão para cada build.
- **Rastreabilidade**: Cada build inclui informações sobre a versão, data e ambiente.

### Comandos de Versionamento

O sistema oferece vários comandos para gerenciar versões:

```bash
# Mostrar informações da versão atual
pnpm run version:show

# Incrementar a versão (patch)
pnpm run version:bump

# Incrementar a versão minor
pnpm run version:bump:minor

# Incrementar a versão major
pnpm run version:bump:major

# Gerar notas de release
pnpm run version:notes

# Incrementar versão e criar tag Git
pnpm run version:release

# Incrementar versão minor e criar tag Git
pnpm run version:release:minor

# Incrementar versão major e criar tag Git
pnpm run version:release:major
```

### Fluxo de Trabalho de Versionamento

1. **Desenvolvimento**: Realize alterações no código e faça commits seguindo o padrão conventional commits.
2. **Visualização de Versão**: Use `version:show` para ver a versão atual.
3. **Geração de Notas**: Use `version:notes` para visualizar as notas de release baseadas nos commits.
4. **Incremento de Versão**: Use `version:bump` ou suas variantes para incrementar a versão.
5. **Release**: Use `version:release` para criar uma tag Git para a nova versão.
6. **Deploy**: Faça o deploy da nova versão para o ambiente desejado.

### Benefícios do Sistema de Versionamento

- **Rastreabilidade**: Cada build inclui informações detalhadas sobre a versão.
- **Automação**: Geração automática de notas de release a partir dos commits.
- **Integração com CI/CD**: Os workflows do GitHub Actions usam as informações de versão.
- **Documentação**: CHANGELOG mantido automaticamente com histórico de mudanças.
- **Consistência**: Todos os arquivos de configuração são atualizados com a mesma versão.

## Contribuição

Contribuições são bem-vindas! Siga estas etapas para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Faça commit das suas mudanças: `git commit -m 'feat: minha nova feature'`
4. Envie para o branch: `git push origin minha-feature`
5. Abra um Pull Request

### Convenções de Código

- Siga as convenções de código definidas no ESLint e Prettier
- Use conventional commits para mensagens de commit
- Mantenha a documentação atualizada
- Adicione testes para novas funcionalidades

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Projetos Atuais

### Planilhas de Salário

- **salario-2024**: Planilha de salários do ano 2024

### Planilhas de Consumo

- **consumo-cafeteria-2024**: Planilha de consumo da Cafeteria para 2024
- **consumo-saara-2024**: Planilha de consumo do Saara para 2024
- **consumo-castelo-2024**: Planilha de consumo do Castelo para 2024
- **consumo-stones-2024**: Planilha de consumo do Stones para 2024

## Desenvolvimento

### Requisitos

- [Node.js](https://nodejs.org/en/) (v16+)
- [pnpm](https://pnpm.io/) (v8+)
- [clasp](https://github.com/google/clasp) (instalado globalmente)

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pnpm install
```

### Fluxo de Trabalho

O desenvolvimento é realizado no diretório `src/` em TypeScript. O código é compilado para JavaScript e depois convertido para o formato .gs do Google Apps Script.

#### Compilar o código

```bash
pnpm run build
```

#### Preparar o build para um projeto específico

```bash
pnpm run deploy:dev -- --project=salario
# ou
pnpm run deploy:dev -- --project=consumo --key=pdv=1-cafeteria --key=year=2024
```

#### Enviar o código para o Google Apps Script

```bash
pnpm run deploy:push -- --project=salario
# ou
pnpm run deploy:push -- --project=consumo --key=pdv=1-cafeteria --key=year=2024
```

#### Debug e Execução Remota

O projeto conta com um sistema robusto de debug e execução remota:

```bash
# Enviar código para ambiente de teste
pnpm run deploy:dev -- --project=salario --env=test

# Executar funções remotamente e ver logs
pnpm run clasp run 'minhaFuncao' --project=salario
```

### Criando um Novo Projeto

Para adicionar um novo projeto (por exemplo, para o ano 2025):

1. Adicione a configuração do projeto no arquivo `config.yml`:

```yaml
projects:
  salario:
    keys:
      year: [2024, 2025]
    # resto da configuração...
```

1. Execute o comando de deploy:

```bash
pnpm run deploy:dev -- --project=salario --key=year=2025
```

### Funcionalidades Específicas

#### Virada de Mês

Função para automatizar a virada de mês nas planilhas de salário e consumo:

- Cria uma nova aba para o mês atual
- Copia as fórmulas e formatações da aba anterior
- Limpa os dados de consumo/salário
- Atualiza referências e datas

#### Virada de Ano

Função para automatizar a virada de ano nas planilhas de salário e consumo:

- Cria uma nova planilha para o novo ano
- Copia todas as abas e configurações da planilha anterior
- Atualiza referências e datas para o novo ano
- Limpa os dados históricos

#### Proteção de Abas

Funções para proteger e desproteger abas automaticamente:

- Proteção automática após virada de mês
- Desprotege apenas para usuários autorizados
- Configuração de permissões por tipo de usuário

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
