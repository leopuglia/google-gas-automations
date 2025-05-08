# FAQ - Perguntas Frequentes

> Última atualização: 06/05/2025

## Resumo

Este documento contém respostas para as perguntas mais frequentes sobre o GAS Builder, abrangendo instalação, uso, desenvolvimento, e solução de problemas comuns.

## Pré-requisitos

- Conhecimento básico do [GAS Builder](./00-introducao-gas-builder.md)
- Familiaridade com [Google Apps Script](https://developers.google.com/apps-script/)

## 1. Perguntas Gerais

### 1.1. O que é o GAS Builder?

O GAS Builder é uma ferramenta de desenvolvimento para Google Apps Script que permite a criação, desenvolvimento e gerenciamento de projetos usando TypeScript e práticas modernas de desenvolvimento. Ele simplifica o desenvolvimento, build e deploy de scripts para a plataforma Google Apps.

### 1.2. Quais as principais vantagens do GAS Builder?

As principais vantagens incluem:

- Desenvolvimento em TypeScript com tipagem forte
- Modularização do código
- Sistema de build automatizado
- Plugins extensíveis
- Templates para casos de uso comuns
- CLI para automação de tarefas
- Integração com ferramentas modernas de desenvolvimento

### 1.3. Quais aplicações do Google são suportadas?

O GAS Builder suporta desenvolvimento para todas as aplicações compatíveis com Google Apps Script, incluindo:

- Google Sheets
- Google Docs
- Google Forms
- Google Slides
- Google Drive
- Gmail
- Calendar
- E outros serviços da plataforma Google

## 2. Instalação e Configuração

### 2.1. Quais são os requisitos mínimos para usar o GAS Builder?

Para usar o GAS Builder, você precisa de:

- Node.js 18.x ou superior
- pnpm (gerenciador de pacotes)
- Conta Google com acesso ao Google Apps Script
- Git (recomendado para controle de versão)

### 2.2. Como instalar o GAS Builder?

Para instalar:

```bash
# Clonar o repositório
git clone https://github.com/org/gas-builder.git
cd gas-builder

# Instalar dependências
pnpm install

# Testar a instalação
pnpm gas-builder --version
```

### 2.3. Como configurar o ambiente de desenvolvimento?

Siga estes passos:

1. Instale as dependências necessárias:

   ```bash
   pnpm install
   ```

2. Configure o Clasp para autenticação com Google:

   ```bash
   pnpm clasp login
   ```

3. Crie um arquivo de configuração YAML:

   ```bash
   pnpm gas-builder init
   ```

4. Configure seu editor (recomendado VS Code com extensões TypeScript)

### 2.4. É possível usar npm ou yarn em vez de pnpm?

Embora o GAS Builder seja otimizado para pnpm, você pode usar npm ou yarn modificando os scripts no `package.json`. No entanto, recomendamos o uso de pnpm para garantir compatibilidade total e melhor desempenho.

## 3. Uso Básico

### 3.1. Como criar um novo projeto?

Para criar um novo projeto:

```bash
# Usando a CLI
pnpm gas-builder new meu-projeto --template basic

# Ou com assistente interativo
pnpm gas-builder new
```

### 3.2. Como compilar um projeto?

Para compilar:

```bash
# No diretório do projeto
pnpm build

# Ou especificando o projeto
pnpm gas-builder build --project meu-projeto
```

### 3.3. Como fazer deploy para o Google Apps Script?

Para fazer deploy:

```bash
# No diretório do projeto
pnpm deploy

# Ou especificando o projeto com ambiente
pnpm gas-builder deploy --project meu-projeto --env production
```

### 3.4. Como executar um script localmente para testes?

O GAS Builder permite testar parcialmente scripts localmente:

```bash
# Executar testes unitários
pnpm test

# Ou simular execução (quando aplicável)
pnpm gas-builder run --local --function myFunction
```

Para testes completos, ainda é necessário fazer deploy para o ambiente GAS.

## 4. Desenvolvimento

### 4.1. Como organizar um projeto grande?

Recomendamos a seguinte estrutura:

```bash
src/
  ├── functions/    # Funções expostas globalmente
  ├── services/     # Serviços e lógica de negócio
  ├── types/        # Definições de tipos
  ├── utils/        # Funções utilitárias
  └── ui/           # Interface de usuário
```

Para projetos muito grandes, considere dividi-los em múltiplos projetos GAS Builder.

### 4.2. Como usar TypeScript com Google Apps Script?

O GAS Builder já configura tudo para você. Algumas dicas importantes:

- Importe tipos do Google Apps Script:

  ```typescript
  import { SpreadsheetApp } from 'google-apps-script-types';
  ```

- Exporte funções globais explicitamente:

  ```typescript
  function onOpen() {
    // Implementação
  }
  
  // Exportar para o escopo global
  export { onOpen };
  ```

### 4.3. Como adicionar dependências externas?

Para adicionar dependências:

```bash
# Adicionar dependência
pnpm add lodash-es

# Usar no código
import { debounce } from 'lodash-es';
```

Lembre-se que nem todas as bibliotecas são compatíveis com o ambiente GAS. Prefira bibliotecas pequenas e com poucos recursos de plataforma.

### 4.4. Como criar um novo template personalizado?

Para criar um template:

1. Crie um diretório em `templates/seu-template/`
2. Adicione os arquivos base (incluindo .template.json para configuração)
3. Registre o template em `src/templates/index.ts`

Consulte a [documentação de templates](./34-impl-plugins-templates.md) para mais detalhes.

## 5. Solução de Problemas

### 5.1. O que fazer quando o build falha?

Verifique os seguintes pontos:

1. Erros de TypeScript - corrija quaisquer erros de tipo
2. Problemas de dependências - verifique se todas as dependências estão instaladas
3. Configuração do Rollup - verifique se o rollup.config.js está correto
4. Tamanho do bundle - verifique se o bundle não excede os limites do GAS

Para diagnóstico completo, consulte o [guia de troubleshooting](./19-guia-troubleshooting.md).

### 5.2. O deploy falha com erro de autenticação. O que fazer?

Se o deploy falhar com erro de autenticação:

1. Execute `pnpm clasp login` para autenticar novamente
2. Verifique se você tem acesso ao projeto no Google Apps Script
3. Verifique se o scriptId no .clasp.json está correto
4. Tente limpar o cache: `rm -rf ~/.clasprc.json` e login novamente

### 5.3. Como lidar com os limites do Google Apps Script?

Para lidar com limites do GAS:

1. **Tempo de execução (6 minutos)**: Divida processamentos longos em partes menores usando gatilhos
2. **Tamanho do script**: Mantenha o código conciso, use plugins de minificação
3. **Chamadas de serviço**: Implemente caching e backoff exponencial para APIs
4. **Armazenamento**: Use DriveApp ou serviços externos para dados grandes

### 5.4. Por que as funções não aparecem no Google Apps Script após o deploy?

Verifique:

1. Se você exportou as funções corretamente:

   ```typescript
   // Forma correta
   function myFunction() { /* ... */ }
   export { myFunction };
   ```

2. Se o build foi bem-sucedido e gerou os arquivos corretamente
3. Se o deploy incluiu todos os arquivos necessários
4. Se há erros de compilação ou execução no console do GAS

### 5.5. Os testes funcionam localmente, mas falham no Google Apps Script. Por quê?

Possíveis razões:

1. Diferenças de ambiente (Node.js vs V8 do GAS)
2. Recursos do JavaScript não suportados pelo GAS
3. Mocks inadequados para APIs do Google
4. Escopos de autorização insuficientes
5. Limitações específicas do GAS não consideradas nos testes

## 6. Integração com Ferramentas Externas

### 6.1. Como integrar com controle de versão (Git)?

O GAS Builder trabalha bem com Git:

1. Inicialize um repositório Git no seu projeto

   ```bash
   git init
   ```

2. Use o .gitignore fornecido pelo template
3. Adicione arquivos e faça commit normalmente
4. Considere ignorar arquivos específicos do GAS (.clasp.json, etc.) se sensíveis

### 6.2. Como configurar CI/CD para projetos GAS Builder?

Para configurar CI/CD (ex: GitHub Actions):

1. Crie um arquivo de workflow (ex: `.github/workflows/deploy.yml`)
2. Configure autenticação segura para o Clasp (usando secrets)
3. Execute build e testes automaticamente
4. Deploy condicionalmente para ambientes específicos

Exemplo simplificado:

```yaml
name: Build and Deploy
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      # Deploy para ambientes específicos conforme necessário
```

### 6.3. É possível usar o GAS Builder com outros IDEs além do VS Code?

Sim, o GAS Builder é independente de IDE. No entanto, fornecemos configurações otimizadas para VS Code, incluindo:

- Snippets
- Tasks
- Launch configs para debugging
- Recomendações de extensões

Para outros IDEs, você precisará configurar manualmente os recursos equivalentes.

## 7. Casos de Uso Avançados

### 7.1. Como desenvolver Add-ons para Google Workspace?

Para desenvolver Add-ons:

1. Use o template específico para add-ons:

   ```bash
   pnpm gas-builder new meu-addon --template workspace-addon
   ```

2. Configure o manifesto em `src/appsscript.json`
3. Implemente a UI e funcionalidades conforme documentação do Google
4. Siga o processo de publicação no Google Workspace Marketplace

### 7.2. Como integrar com APIs externas?

Para integrar com APIs externas:

1. Use `UrlFetchApp` para requisições HTTP:

   ```typescript
   function callExternalApi(endpoint: string, data: any) {
     const options = {
       method: 'post',
       contentType: 'application/json',
       payload: JSON.stringify(data),
       muteHttpExceptions: true
     };
     
     const response = UrlFetchApp.fetch(endpoint, options);
     return JSON.parse(response.getContentText());
   }
   ```

2. Adicione os escopos necessários no manifesto
3. Implemente tratamento de erros robusto
4. Considere armazenar credenciais no PropertiesService

### 7.3. Como criar uma interface de usuário rica no Google Sheets?

Para UIs avançadas:

1. Use o template UI:

   ```bash
   pnpm gas-builder new meu-projeto-ui --template sheets-ui
   ```

2. Implemente a UI usando HTML Service ou Card Service
3. Use modularização para separar lógica de UI do backend
4. Considere frameworks JavaScript leves para a parte front-end

## 8. Contribuindo para o GAS Builder

### 8.1. Como contribuir com o desenvolvimento do GAS Builder?

Para contribuir:

1. Faça fork do repositório no GitHub
2. Implemente sua feature ou correção
3. Adicione testes adequados
4. Envie um Pull Request
5. Siga o guia de contribuição no repositório

### 8.2. Como reportar bugs ou solicitar features?

Para reportar bugs ou solicitar features:

1. Verifique se o problema/solicitação já não existe nas issues
2. Crie uma nova issue seguindo o template
3. Forneça informações detalhadas, incluindo:
   - Versão do GAS Builder
   - Sistema operacional
   - Passos para reproduzir
   - Logs de erro
   - Comportamento esperado vs. atual

### 8.3. Posso criar plugins personalizados para o GAS Builder?

Sim! Para criar plugins:

1. Use o template de plugin:

   ```bash
   pnpm gas-builder create-plugin meu-plugin
   ```

2. Implemente as interfaces necessárias
3. Registre seu plugin no sistema
4. Documente seu plugin adequadamente

Para mais detalhes, consulte o documento [Implementação de Plugins](./34-impl-plugins-templates.md).

## Próximos Passos

- Consulte o [Guia de Início Rápido](./10-guia-inicio-rapido.md) para começar seu primeiro projeto
- Explore os [Templates disponíveis](./34-impl-plugins-templates.md) para diferentes casos de uso
- Veja dicas avançadas no [Guia de Troubleshooting](./19-guia-troubleshooting.md)

## Referências

- [Documentação do Google Apps Script](https://developers.google.com/apps-script/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Repositório do Clasp](https://github.com/google/clasp)
- [Rollup.js Documentation](https://rollupjs.org/guide/en/)
