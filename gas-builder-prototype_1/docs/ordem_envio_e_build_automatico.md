# Ordem de Envio de Arquivos e Build Automático

## Ordem de Envio de Arquivos

Uma das melhorias implementadas no sistema de build é a configuração da ordem correta de envio dos arquivos para o Google Apps Script. A ordem de carregamento dos arquivos é fundamental para garantir que as dependências estejam disponíveis antes de serem utilizadas.

### Ordem Ideal de Carregamento

A ordem implementada segue a seguinte sequência:

1. **Bibliotecas externas** (`externals`): Bibliotecas de terceiros que são utilizadas pelo projeto
2. **Bibliotecas comuns** (`common-libs`): Bibliotecas compartilhadas entre projetos, como utilitários
3. **Bibliotecas específicas** (`project-libs`): Bibliotecas específicas do projeto atual
4. **Arquivo principal** (`main.js`): Arquivo principal do projeto, que contém as funções expostas globalmente
5. **appsscript.json**: Arquivo de manifesto do Google Apps Script (sempre por último)

Esta ordem garante que as dependências estejam disponíveis antes de serem utilizadas por outros arquivos, evitando erros de referência.

### Implementação

A ordem de envio é configurada no arquivo `.clasp.json` gerado durante o deploy, através da propriedade `filePushOrder`. O sistema:

1. Identifica automaticamente os diferentes tipos de arquivos com base na configuração YAML
2. Cria um array `file_push_order` com todos os arquivos na ordem correta
3. Utiliza o template Handlebars para gerar o arquivo `.clasp.json` com a ordem definida

Exemplo de arquivo `.clasp.json` gerado:

```json
{
  "scriptId": "1U4zAb5JdN7Ys0dGe6a140InYiVbF937UU8gHHD905kicBeKuRsleaN6H",
  "filePushOrder": [
    "utils.js",
    "main.js",
    "appsscript.json"
  ]
}
```

### Configuração no YAML

Os diferentes tipos de bibliotecas são definidos na configuração YAML de cada projeto:

```yaml
rollup:
  # Arquivo principal de entrada
  main: main.ts
  # Bibliotecas comuns a serem incluídas
  common-libs:
    - name: utils
      path: ./src/commons/utils.ts
  # Bibliotecas específicas deste projeto
  project-libs: []
  # Bibliotecas externas (não empacotadas)
  externals: []
```

## Build Automático

Outra melhoria importante é a verificação e execução automática do build antes do deploy. Isso elimina a necessidade de executar manualmente o comando de build antes do deploy.

### Funcionamento

O sistema verifica automaticamente se os diretórios de build existem para os projetos que serão deployados. Se os diretórios não existirem ou estiverem vazios, o sistema executa automaticamente o comando de build.

### Principais Características

1. **Verificação Inteligente**: Verifica apenas os diretórios de build dos projetos que serão deployados
2. **Build Seletivo**: Suporta build para projetos específicos ou para todos os projetos
3. **Feedback Detalhado**: Fornece mensagens informativas sobre cada etapa do processo
4. **Interrupção Segura**: Interrompe o deploy com mensagem de erro se o build falhar

### Uso

Com esta funcionalidade, você pode simplesmente executar:

```bash
pnpm run deploy
```

E o sistema cuidará automaticamente de executar o build quando necessário. Isso simplifica o fluxo de trabalho e evita erros comuns, como tentar fazer deploy sem ter executado o build.

### Opções Avançadas

- **Forçar Build**: É possível forçar a execução do build mesmo se os diretórios já existirem
- **Build para Projeto Específico**: Ao especificar um projeto, apenas o build desse projeto será verificado/executado

## Benefícios das Novas Funcionalidades

1. **Fluxo de Trabalho Simplificado**: Menos comandos para executar, menos erros para se preocupar
2. **Prevenção de Erros**: Evita tentativas de deploy sem arquivos de build ou com ordem incorreta
3. **Melhor Desempenho**: A ordem correta de carregamento melhora o desempenho dos scripts
4. **Maior Confiabilidade**: Garante que os scripts funcionem corretamente no ambiente do Google Apps Script

## Implementação Técnica

Estas funcionalidades foram implementadas de forma modular e extensível:

- **Módulos Separados**: Funções organizadas em módulos específicos (filesystem-helper.js, template-helper.js, etc.)
- **Configuração Centralizada**: Toda a lógica é baseada na configuração YAML
- **Código Limpo**: Funções bem documentadas e com responsabilidades claras
- **Manutenibilidade**: Fácil de estender para suportar novos tipos de arquivos ou lógicas de build
