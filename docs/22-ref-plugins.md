# Referência de Plugins

> Última atualização: 08/05/2025

## Resumo

Este documento fornece uma referência detalhada dos plugins disponíveis no GAS Builder, incluindo suas funcionalidades, configurações e exemplos de uso. Os plugins estendem as funcionalidades do sistema, permitindo integrações com serviços do Google e outros recursos avançados.

## Pré-requisitos

- Conhecimento básico do [GAS Builder](./00-introducao-gas-builder.md)
- Familiaridade com a [arquitetura do sistema](./02-arquitetura-gas-builder.md)
- Conhecimento do [sistema de build](./21-ref-sistema-build.md)

## 1. Sistema de Plugins

### 1.1. Visão Geral

O GAS Builder adota uma arquitetura extensível baseada em plugins, onde funcionalidades adicionais podem ser incorporadas ao sistema de forma modular. Cada plugin:

- Implementa uma interface comum
- Possui pontos de extensão específicos (hooks)
- Pode adicionar comandos à CLI
- Pode contribuir com transformações durante o build
- Pode fornecer funcionalidades específicas para serviços do Google

### 1.2. Ativação de Plugins

Os plugins são ativados na seção `plugins` do arquivo de configuração YAML:

```yaml
plugins:
  - id: google-sheets
    enabled: true
    options:
      generateCustomFunctions: true
      
  - id: google-drive
    enabled: true
    options:
      integrateWithPicker: true
```

### 1.3. Ciclo de Vida dos Plugins

Os plugins participam do ciclo de vida do GAS Builder através de hooks específicos:

1. **initialize**: Chamado quando o plugin é carregado
2. **onBeforeBuild**: Chamado antes do processo de build
3. **onAfterBuild**: Chamado após o processo de build
4. **onBeforeDeploy**: Chamado antes do processo de deploy
5. **onAfterDeploy**: Chamado após o processo de deploy

## 2. Plugins Oficiais

### 2.1. Google Sheets Plugin

Adiciona recursos específicos para integração com Google Sheets.

#### 2.1.1. Funcionalidades

- Geração de funções personalizadas para planilhas
- Templates para manipulação de dados de planilhas
- Utilitários para formatação, validação e cálculos
- Sincronização de dados entre planilhas
- Manipulação avançada de intervalos

#### 2.1.2. Configuração

```yaml
plugins:
  - id: google-sheets
    enabled: true
    options:
      # Gerar funções personalizadas para uso em fórmulas
      generateCustomFunctions: true
      
      # Incluir assistentes de UI para Sheets
      includeUiHelpers: true
      
      # Gerar endpoints para CRUD de dados
      generateCrudEndpoints: false
      
      # Adicionar formatação condicional
      conditionalFormatting: true
      
      # Métodos de validação de dados
      dataValidation: true
```

#### 2.1.3. Exemplo de Uso

```typescript
// src/sheets-functions.ts

/**
 * Extrai o domínio de um endereço de email.
 * 
 * @param {string} email - Endereço de email
 * @return {string} Domínio do email
 * @customfunction
 */
export function EXTRACT_DOMAIN(email: string): string {
  if (!email.includes('@')) return '';
  return email.split('@')[1];
}

/**
 * Formata um número como moeda brasileira.
 * 
 * @param {number} value - Valor a ser formatado
 * @return {string} Valor formatado
 * @customfunction
 */
export function FORMAT_BRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
```

### 2.2. Google Drive Plugin

Adiciona recursos para integração com Google Drive.

#### 2.2.1. Funcionalidades

- Gerenciamento de arquivos e pastas
- Criação e manipulação de permissões
- Sincronização de conteúdo
- Busca avançada de arquivos
- Integração com Drive Picker

#### 2.2.2. Configuração

```yaml
plugins:
  - id: google-drive
    enabled: true
    options:
      # Integração com Drive Picker
      integrateWithPicker: true
      
      # Incluir utilitários para permissões
      permissionUtils: true
      
      # Inclui funções de busca avançada
      advancedSearch: true
      
      # Sincronização de conteúdo
      contentSync: false
```

#### 2.2.3. Exemplo de Uso

```typescript
// src/drive-operations.ts
import { DriveUtils } from '@gas-builder/plugin-drive';

/**
 * Obtém todos os arquivos compartilhados com o usuário atual.
 */
export function getSharedFiles() {
  return DriveUtils.findFiles({
    sharedWithMe: true,
    mimeTypes: ['application/pdf', 'image/jpeg']
  });
}

/**
 * Organiza arquivos movendo-os para pastas apropriadas.
 */
export function organizeFiles() {
  // Pasta para imagens
  const imageFolder = DriveUtils.getFolderByName('Imagens') || 
                      DriveUtils.createFolder('Imagens');
  
  // Pasta para documentos
  const docsFolder = DriveUtils.getFolderByName('Documentos') || 
                     DriveUtils.createFolder('Documentos');
  
  // Encontrar arquivos não organizados
  const files = DriveUtils.findFiles({
    parentsExclude: [imageFolder.getId(), docsFolder.getId()],
    maxResults: 100
  });
  
  // Organizar por tipo
  files.forEach(file => {
    const mimeType = file.getMimeType();
    if (mimeType.includes('image/')) {
      DriveUtils.moveFile(file, imageFolder);
    } else if (mimeType.includes('application/')) {
      DriveUtils.moveFile(file, docsFolder);
    }
  });
}
```

### 2.3. Google Docs Plugin

Adiciona recursos para integração com Google Docs.

#### 2.3.1. Funcionalidades

- Criação e manipulação de documentos
- Geração de relatórios
- Substituição de texto com marcadores
- Manipulação avançada de estilos
- Conversão entre formatos

#### 2.3.2. Configuração

```yaml
plugins:
  - id: google-docs
    enabled: true
    options:
      # Incluir recursos de geração de relatórios
      reportGeneration: true
      
      # Funções de mesclagem de templates
      templateMerge: true
      
      # Manipulação avançada de estilos
      advancedStyling: false
      
      # Conversão de formatos
      formatConversion: true
```

#### 2.3.3. Exemplo de Uso

```typescript
// src/document-generator.ts
import { DocsUtils } from '@gas-builder/plugin-docs';

/**
 * Gera um relatório baseado em um template e dados.
 * 
 * @param templateId ID do documento template
 * @param data Dados para preencher o template
 * @returns ID do documento gerado
 */
export function generateReport(templateId: string, data: Record<string, any>): string {
  // Criar cópia do template
  const newDoc = DocsUtils.copyDocument(templateId, `Relatório - ${data.title}`);
  
  // Substituir marcadores
  DocsUtils.replaceTextMarkers(newDoc, {
    '{{title}}': data.title,
    '{{author}}': data.author,
    '{{date}}': new Date().toLocaleDateString('pt-BR'),
    '{{content}}': data.content,
    '{{summary}}': data.summary || 'Sem resumo disponível'
  });
  
  // Aplicar estilos, se especificados
  if (data.styles) {
    DocsUtils.applyStyles(newDoc, data.styles);
  }
  
  return newDoc.getId();
}
```

### 2.4. Forms Plugin

Adiciona recursos para trabalhar com Google Forms.

#### 2.4.1. Funcionalidades

- Criação dinâmica de formulários
- Processamento de respostas
- Validação personalizada
- Geração de análises
- Integração com outras ferramentas do Google

#### 2.4.2. Configuração

```yaml
plugins:
  - id: google-forms
    enabled: true
    options:
      # Processamento automático de respostas
      autoProcessResponses: true
      
      # Validação avançada
      advancedValidation: true
      
      # Geração de análises e relatórios
      generateAnalytics: true
      
      # Notificações de novas respostas
      responseNotifications: false
```

#### 2.4.3. Exemplo de Uso

```typescript
// src/survey-manager.ts
import { FormsUtils } from '@gas-builder/plugin-forms';

/**
 * Cria um formulário de pesquisa de satisfação.
 * 
 * @returns ID do formulário criado
 */
export function createSatisfactionSurvey(): string {
  const form = FormsUtils.createForm('Pesquisa de Satisfação', {
    description: 'Ajude-nos a melhorar nosso atendimento',
    confirmationMessage: 'Obrigado por sua resposta!'
  });
  
  // Adicionar perguntas
  form.addScaleItem('Como você avalia nosso atendimento?', 1, 5, {
    leftLabel: 'Muito ruim',
    rightLabel: 'Excelente'
  });
  
  form.addParagraphItem('O que podemos melhorar?');
  
  form.addMultipleChoiceItem('Como você nos conheceu?', [
    'Redes sociais',
    'Indicação',
    'Busca na internet',
    'Outros'
  ]);
  
  // Configurar destino das respostas
  const sheet = SpreadsheetApp.openById('PLANILHA_ID').getSheetByName('Respostas');
  FormsUtils.setDestination(form, sheet);
  
  return form.getId();
}

/**
 * Processa novas respostas de um formulário.
 * 
 * @param formId ID do formulário
 */
export function processNewResponses(formId: string): void {
  const responses = FormsUtils.getUnprocessedResponses(formId);
  
  responses.forEach(response => {
    // Analisar resposta
    const data = FormsUtils.parseResponse(response);
    
    // Aplicar lógica de negócio
    if (data.rating < 3) {
      // Resposta negativa - acionar alerta
      sendLowSatisfactionAlert(data);
    }
    
    // Marcar como processada
    FormsUtils.markAsProcessed(response);
  });
}
```

### 2.5. Gmail Plugin

Adiciona recursos para integração com Gmail.

#### 2.5.1. Funcionalidades

- Envio de emails personalizados
- Processamento de emails recebidos
- Gerenciamento de rótulos e categorias
- Criação de respostas automáticas
- Templates de email HTML

#### 2.5.2. Configuração

```yaml
plugins:
  - id: gmail
    enabled: true
    options:
      # Templates HTML para emails
      htmlTemplates: true
      
      # Processamento automatizado de emails
      emailProcessing: true
      
      # Gerenciamento de rótulos
      labelManagement: true
      
      # Respostas automáticas
      autoResponders: false
```

#### 2.5.3. Exemplo de Uso

```typescript
// src/email-manager.ts
import { GmailUtils } from '@gas-builder/plugin-gmail';

/**
 * Envia email de boas-vindas para novos usuários.
 * 
 * @param user Dados do usuário
 */
export function sendWelcomeEmail(user: { name: string, email: string }) {
  // Carregar template HTML
  const template = GmailUtils.getHtmlTemplate('welcome-email');
  
  // Substituir variáveis no template
  const html = template.replace(/\{\{name\}\}/g, user.name)
                       .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('pt-BR'));
  
  // Enviar email
  GmailUtils.sendEmail({
    to: user.email,
    subject: 'Bem-vindo ao nosso serviço!',
    htmlBody: html,
    attachments: [
      GmailUtils.createAttachment('Guia do Usuário.pdf', DriveApp.getFileById('PDF_ID').getBlob())
    ]
  });
}

/**
 * Processa emails com solicitações de suporte.
 */
export function processSupportEmails() {
  // Buscar emails não lidos com rótulo "suporte"
  const threads = GmailUtils.searchThreads('label:suporte is:unread');
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    const latestMessage = messages[messages.length - 1];
    
    // Extrair informações da mensagem
    const sender = latestMessage.getFrom();
    const subject = latestMessage.getSubject();
    const body = latestMessage.getPlainBody();
    
    // Criar ticket no sistema de suporte
    const ticketId = createSupportTicket(sender, subject, body);
    
    // Responder ao remetente
    GmailUtils.replyToMessage(latestMessage, {
      htmlBody: `<p>Recebemos sua solicitação de suporte. Seu ticket é <strong>#${ticketId}</strong>.</p>`
    });
    
    // Marcar como lido e aplicar rótulo
    thread.markRead();
    GmailUtils.addLabel(thread, 'processado');
  });
}
```

### 2.6. Calendar Plugin

Adiciona recursos para integração com Google Calendar.

#### 2.6.1. Funcionalidades

- Criação e gerenciamento de eventos
- Configuração de gatilhos baseados no calendário
- Verificação de disponibilidade
- Envio de lembretes
- Sincronização com outros sistemas

#### 2.6.2. Configuração

```yaml
plugins:
  - id: google-calendar
    enabled: true
    options:
      # Verificação de disponibilidade
      availabilityChecking: true
      
      # Sistema de lembretes
      reminderSystem: true
      
      # Sincronização com agendas externas
      externalSync: false
      
      # Análise de uso de tempo
      timeAnalytics: true
```

#### 2.6.3. Exemplo de Uso

```typescript
// src/calendar-manager.ts
import { CalendarUtils } from '@gas-builder/plugin-calendar';

/**
 * Agenda uma reunião com base na disponibilidade.
 * 
 * @param participants Lista de emails dos participantes
 * @param duration Duração em minutos
 * @param topic Assunto da reunião
 * @returns Detalhes do evento criado ou null se não for possível
 */
export function scheduleTeamMeeting(
  participants: string[], 
  duration: number, 
  topic: string
) {
  // Definir janela de tempo para busca (próximos 5 dias úteis)
  const timeWindow = CalendarUtils.getBusinessDaysRange(5);
  
  // Encontrar slots disponíveis para todos os participantes
  const availableSlots = CalendarUtils.findAvailableSlots({
    participants,
    duration,
    timeWindow,
    workingHours: { start: 9, end: 17 },
    minimumOptions: 3
  });
  
  if (availableSlots.length === 0) {
    return null;
  }
  
  // Selecionar o primeiro slot disponível
  const selectedSlot = availableSlots[0];
  
  // Criar o evento
  const event = CalendarUtils.createEvent({
    title: topic,
    startTime: selectedSlot.start,
    endTime: selectedSlot.end,
    description: `Reunião sobre: ${topic}`,
    attendees: participants,
    sendInvites: true,
    location: 'Sala de Conferências Virtual',
    conferenceData: {
      type: 'hangoutsMeet',
      createNewMeeting: true
    }
  });
  
  return {
    id: event.getId(),
    link: event.getHangoutLink(),
    time: {
      start: event.getStartTime(),
      end: event.getEndTime()
    }
  };
}
```

## 3. Plugins de Sistema e Build

### 3.1. TypeScript Plugin

Configura a compilação de TypeScript para Google Apps Script.

#### 3.1.1. Funcionalidades

- Compilação de TypeScript para JavaScript
- Verificação de tipos
- Configuração do compilador
- Geração de declarações de tipo

#### 3.1.2. Configuração

```yaml
plugins:
  - id: typescript
    enabled: true
    options:
      # Versão alvo do ECMAScript
      target: "ES2019"
      
      # Gerar source maps para debugging
      sourceMap: true
      
      # Modo estrito
      strict: true
      
      # Verificações de qualidade adicionais
      noUnusedLocals: true
      noImplicitReturns: true
      
      # Permitir importações parciais
      allowSyntheticDefaultImports: true
```

### 3.2. ESLint Plugin

Adiciona verificação de qualidade de código.

#### 3.2.1. Funcionalidades

- Validação de padrões de código
- Integração com TypeScript
- Regras personalizáveis
- Correção automática de problemas

#### 3.2.2. Configuração

```yaml
plugins:
  - id: eslint
    enabled: true
    options:
      # Configuração para execução automática
      runOnBuild: true
      
      # Falhar o build em caso de erros
      failOnError: true
      
      # Corrigir problemas automaticamente quando possível
      autoFix: true
      
      # Regras específicas
      rules:
        "no-unused-vars": "error"
        "no-console": "warn"
```

### 3.3. Rollup Plugin

Configura o sistema de bundling Rollup.

#### 3.3.1. Funcionalidades

- Bundling de JavaScript modular
- Resolução de dependências
- Tree-shaking para remover código não utilizado
- Minificação e otimização

#### 3.3.2. Configuração

```yaml
plugins:
  - id: rollup
    enabled: true
    options:
      # Formato de saída
      format: "esm"
      
      # Minificação com Terser
      minify: true
      
      # Preservar comentários JSDoc
      preserveJsDoc: true
      
      # Plugins adicionais do Rollup
      plugins:
        - "@rollup/plugin-json"
        - "rollup-plugin-cleanup"
```

### 3.4. Clasp Plugin

Configura a integração com a ferramenta Clasp do Google.

#### 3.4.1. Funcionalidades

- Autenticação com Google
- Push para o Google Apps Script
- Configuração de projetos
- Gerenciamento de versões

#### 3.4.2. Configuração

```yaml
plugins:
  - id: clasp
    enabled: true
    options:
      # Diretório raiz para deploy
      rootDir: "build"
      
      # Criar versão após push
      createVersions: true
      
      # Arquivos a ignorar no push
      ignore:
        - "node_modules/**"
        - "*.test.js"
      
      # Ordem de push (quando crítico)
      pushOrder:
        - "build/config.js"
        - "build/utils.js"
```

## 4. Plugins de Terceiros

### 4.1. Instalação de Plugins de Terceiros

Os plugins de terceiros podem ser instalados via npm:

```bash
pnpm add @autor/gas-builder-plugin-nome
```

Em seguida, registre o plugin no arquivo de configuração:

```yaml
plugins:
  - id: nome-do-plugin
    enabled: true
    path: 'node_modules/@autor/gas-builder-plugin-nome'
    options:
      # opções do plugin
```

### 4.2. Plugins Comunitários Recomendados

| Nome | Descrição | URL |
|------|-----------|-----|
| **Translation Plugin** | Suporte a traduções e i18n | `@gasbuilder/plugin-translation` |
| **Database Plugin** | Abstração para armazenamento de dados | `@gasbuilder/plugin-database` |
| **OAuth Plugin** | Simplifica autenticação OAuth2 | `@gasbuilder/plugin-oauth` |
| **Charts Plugin** | Visualização de dados avançada | `@gasbuilder/plugin-charts` |
| **Logging Plugin** | Sistema avançado de logging | `@gasbuilder/plugin-logging` |

## 5. Desenvolvimento de Plugins

### 5.1. Estrutura Básica de um Plugin

```typescript
// src/plugins/meu-plugin.ts
import { Plugin, PluginContext, BuildContext, DeployContext } from '@gas-builder/core';

export class MeuPlugin implements Plugin {
  // Identificação do plugin
  id = 'meu-plugin';
  name = 'Meu Plugin Personalizado';
  description = 'Adiciona funcionalidades personalizadas';
  version = '1.0.0';
  
  // Hook de inicialização
  async initialize(context: PluginContext): Promise<void> {
    context.logger.info(`Inicializando ${this.name}`);
    
    // Lógica de inicialização
  }
  
  // Hook de pré-build
  async onBeforeBuild(context: BuildContext): Promise<void> {
    context.logger.info(`Preparando build para ${context.project.name}`);
    
    // Lógica de pré-build
  }
  
  // Hook de pós-build
  async onAfterBuild(context: BuildContext): Promise<void> {
    context.logger.info(`Build concluído para ${context.project.name}`);
    
    // Lógica de pós-build
  }
  
  // Hook de pré-deploy
  async onBeforeDeploy(context: DeployContext): Promise<void> {
    context.logger.info(`Preparando deploy para ${context.project.name}`);
    
    // Lógica de pré-deploy
  }
  
  // Hook de pós-deploy
  async onAfterDeploy(context: DeployContext): Promise<void> {
    context.logger.info(`Deploy concluído para ${context.project.name}`);
    
    // Lógica de pós-deploy
  }
  
  // Comandos personalizados
  commands = {
    'meu-comando': async (args: any, cliContext: any) => {
      console.log('Executando comando personalizado:', args);
      
      // Implementação do comando
      return { success: true };
    }
  };
}
```

### 5.2. Registro de um Plugin

Para registrar seu plugin no GAS Builder:

```typescript
// src/plugins/index.ts
import { PluginManager } from '@gas-builder/core';
import { MeuPlugin } from './meu-plugin';

export function registerPlugins(pluginManager: PluginManager): void {
  pluginManager.registerPlugin(new MeuPlugin());
}
```

### 5.3. Configuração de Plugin

```typescript
// Arquivo de configuração típico para um plugin
import { PluginConfig } from '@gas-builder/core';

export interface MeuPluginConfig extends PluginConfig {
  options: {
    // Opções específicas do plugin
    recurso1: boolean;
    recurso2: boolean;
    configuracao: string;
  };
}

// Acessando configuração no plugin
const pluginConfig = context.config.plugins.find(p => p.id === 'meu-plugin');
const recurso1Ativo = pluginConfig?.options?.recurso1 || false;
```

### 5.4. Publicação de Plugin

Para publicar seu plugin:

1. Crie um pacote npm:

   ```bash
   pnpm init
   ```

2. Configure seu package.json:

   ```json
   {
     "name": "gas-builder-plugin-meu-plugin",
     "version": "1.0.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist"],
     "keywords": ["gas-builder", "plugin"]
   }
   ```

3. Compile e publique:

   ```bash
   pnpm build
   pnpm publish
   ```

## 6. Melhores Práticas

### 6.1. Desempenho de Plugins

- **Inicialização Leve**: Minimize o trabalho no hook `initialize`
- **Processamento Assíncrono**: Use async/await para operações de I/O
- **Cache**: Implemente cache para operações repetidas
- **Lazy Loading**: Carregue recursos apenas quando necessários

### 6.2. Compatibilidade

- **Versões do GAS Builder**: Especifique a versão compatível
- **Dependências**: Minimize dependências externas
- **API Pública**: Mantenha uma API estável e bem documentada
- **Testes**: Teste em diferentes ambientes e versões

### 6.3. Documentação

- **README**: Forneça instruções claras de instalação e uso
- **JSDoc**: Documente interfaces e funções
- **Exemplos**: Inclua exemplos práticos
- **Changelog**: Mantenha um histórico de mudanças

## 7. Troubleshooting

### 7.1. Problemas Comuns

| Problema | Solução |
|----------|---------|
| **Plugin não carrega** | Verifique a configuração e o caminho do plugin |
| **Conflito entre plugins** | Verifique a ordem de carregamento e hooks |
| **Build falha com plugin** | Desative plugins um por um para identificar o problema |
| **Erro em hook específico** | Verifique logs detalhados para identificar o erro |

### 7.2. Debugging de Plugins

```typescript
// Adicionar logs detalhados no plugin
async onBeforeBuild(context: BuildContext): Promise<void> {
  context.logger.debug('OnBeforeBuild:', {
    project: context.project.name,
    config: context.buildConfig,
    // Não logue informações sensíveis!
  });
  
  try {
    // Lógica do plugin
  } catch (error) {
    context.logger.error('Erro no plugin:', error);
    throw error; // Relancar ou tratar conforme necessário
  }
}
```

## Próximos Passos

- Consulte a [implementação de plugins](./34-impl-plugins-templates.md) para detalhes de implementação
- Explore a [Referência da API](./21-ref-api.md) para interfaces e métodos disponíveis
- Veja o [Guia de Troubleshooting](./19-guia-troubleshooting.md) para solução de problemas

## Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Google Apps Script Reference](https://developers.google.com/apps-script/reference/)
- [Rollup Plugin API](https://rollupjs.org/guide/en/#plugin-development)
- [Plugin Design Patterns](https://en.wikipedia.org/wiki/Plugin_(computing))
