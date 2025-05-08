# Guia de Uso de Prompts

> Última atualização: 06/05/2025

## Resumo

Este guia fornece instruções detalhadas sobre como usar os prompts do GAS Builder de forma eficaz, incluindo exemplos práticos, técnicas de otimização e dicas para casos específicos. Os prompts são uma ferramenta poderosa para automatizar tarefas de desenvolvimento, facilitar a configuração e melhorar a documentação.

## Pré-requisitos

- Acesso a uma API de LLM (ChatGPT, Claude, etc.)
- Conhecimento básico do [GAS Builder](./00-introducao-gas-builder.md)
- Familiaridade com o [índice de prompts disponíveis](./50-indice-prompts.md)

## 1. Conceitos Básicos

### 1.1. O que são Prompts?

Os prompts são instruções estruturadas para modelos de linguagem grandes (LLMs) que os orientam a gerar respostas específicas e úteis para tarefas do GAS Builder. Cada prompt é cuidadosamente projetado para:

- Definir o contexto e cenário
- Especificar o papel ou persona do modelo
- Fornecer instruções detalhadas
- Definir o formato esperado da saída

### 1.2. Benefícios do Uso de Prompts

O uso de prompts no desenvolvimento com GAS Builder oferece vários benefícios:

- **Aceleração do Desenvolvimento**: Automação de tarefas repetitivas
- **Consistência**: Padrões consistentes em código e documentação
- **Transferência de Conhecimento**: Orientação para novos desenvolvedores
- **Qualidade**: Sugestões baseadas em melhores práticas
- **Economia de Tempo**: Redução do tempo em tarefas de baixo valor

## 2. Como Usar Prompts

### 2.1. Uso via Interface Web

Para usar um prompt via interface web de um LLM (ChatGPT, Claude, etc.):

1. Acesse a interface web do LLM
2. Localize o arquivo do prompt desejado no repositório
3. Copie o conteúdo completo do prompt
4. Cole na interface do LLM
5. Forneça as informações específicas solicitadas pelo prompt
6. Execute e obtenha o resultado

**Exemplo**:

![Exemplo de uso na interface web](../assets/images/prompt-web-interface.png)

### 2.2. Uso via CLI

O GAS Builder inclui uma ferramenta de linha de comando para executar prompts:

```bash
# Sintaxe básica
pnpm gas-prompt [id-do-prompt] [--opção1=valor1] [--opção2=valor2]

# Exemplos
pnpm gas-prompt CFG-001 --nome="Meu Projeto" --ambientes="dev,prod"
pnpm gas-prompt MIG-001 --caminho="./projeto-legado"
```

Os parâmetros disponíveis variam de acordo com o prompt específico. Use o comando de ajuda para ver as opções:

```bash
pnpm gas-prompt --help
pnpm gas-prompt CFG-001 --help  # Ajuda específica para o prompt
```

### 2.3. Uso via API

Para integração com scripts ou ferramentas personalizadas, você pode usar a API do LLM diretamente:

```typescript
// Exemplo usando API do OpenAI
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function executePrompt(promptId, variables) {
  // Carregar template do prompt
  const promptPath = path.resolve(
    __dirname, 
    `../prompts/${getPromptCategory(promptId)}/${promptId}.md`
  );
  
  let promptTemplate = fs.readFileSync(promptPath, 'utf8');
  
  // Substituir variáveis
  for (const [key, value] of Object.entries(variables)) {
    promptTemplate = promptTemplate.replace(`{{${key}}}`, value);
  }
  
  // Executar prompt
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a specialized assistant for GAS Builder." },
      { role: "user", content: promptTemplate }
    ],
    temperature: 0.2
  });
  
  return completion.choices[0].message.content;
}

// Uso
const result = await executePrompt('CFG-001', {
  projectName: 'Meu Projeto',
  environments: 'dev,prod',
  description: 'Aplicação para gerenciamento de planilhas'
});

console.log(result);
```

## 3. Personalização de Prompts

### 3.1. Modificando Variáveis

Cada prompt contém variáveis que podem ser personalizadas:

```md
# Geração de Configuração YAML

## Cenário
Você está configurando um projeto chamado {{projectName}} com os seguintes ambientes: {{environments}}.
```

Ao usar o prompt, substitua `{{projectName}}` e `{{environments}}` pelos valores específicos do seu projeto.

### 3.2. Ajustando o Escopo

Você pode ajustar o escopo de um prompt para torná-lo mais específico:

**Original**:

```md
Gere uma função para processar dados de planilha.
```

**Ajustado**:

```md
Gere uma função TypeScript para processar dados da planilha 'Vendas', especificamente para calcular o total de vendas por categoria no mês atual, considerando a estrutura onde as categorias estão na coluna B e os valores na coluna D.
```

### 3.3. Técnicas de Engenharia de Prompts

Para obter melhores resultados:

1. **Seja específico**: Forneça detalhes claros e contexto
2. **Use exemplos**: Inclua exemplos do resultado esperado
3. **Itere**: Refine o prompt com base nos resultados
4. **Combine prompts**: Use resultados de um prompt como entrada para outro
5. **Controle a temperatura**: Ajuste para mais criatividade ou mais precisão

## 4. Exemplos Práticos

### 4.1. Configuração de Novo Projeto

**Cenário**: Criar um novo projeto para automação de planilhas de vendas

**Sequência de prompts**:

1. **Análise de Requisitos (DEV-002)**:

   ```bash
   pnpm gas-prompt DEV-002 --descricao="Sistema para rastrear vendas diárias, calcular totais por vendedor, gerar relatórios mensais e enviar alertas quando metas não são atingidas."
   ```

2. **Geração de Configuração (CFG-001)**:

   ```bash
   pnpm gas-prompt CFG-001 --nome="vendas-tracker" --ambientes="dev,prod" --descricao="Sistema de rastreamento de vendas"
   ```

3. **Esqueleto de Módulo (DEV-001)**:

   ```bash
   pnpm gas-prompt DEV-001 --nome="ProcessadorVendas" --funcionalidades="processarPlanilha,calcularTotais,gerarRelatorio,enviarAlertas"
   ```

4. **Geração de README (DOC-001)**:

   ```bash
   pnpm gas-prompt DOC-001 --nome="Vendas Tracker" --descricao="Sistema para rastreamento de vendas diárias" --tecnologias="Google Sheets,Apps Script,TypeScript"
   ```

### 4.2. Migração de Projeto Existente

**Cenário**: Migrar sistema legacy de processamento de pedidos

1. **Análise de Projeto (MIG-001)**:

   ```bash
   pnpm gas-prompt MIG-001 --caminho="./sistemas-legados/processador-pedidos"
   ```

2. **Plano de Migração (MIG-002)**:

   ```bash
   pnpm gas-prompt MIG-002 --nome="Processador de Pedidos" --caminho="./sistemas-legados/processador-pedidos" --resultado-analise="[colar resultado do prompt anterior]"
   ```

3. **Conversão de Estrutura (MIG-003)**:

   ```bash
   pnpm gas-prompt MIG-003 --projeto-origem="./sistemas-legados/processador-pedidos" --projeto-destino="./src/processador-pedidos" --plano="[colar plano gerado]"
   ```

4. **Adaptação de Código (MIG-004)**:

   ```bash
   pnpm gas-prompt MIG-004 --arquivo="./sistemas-legados/processador-pedidos/main.js"
   ```

### 4.3. Debug e Resolução de Problemas

**Cenário**: Erro durante o build do projeto

1. **Diagnóstico de Erros (DBG-001)**:

   ```bash
   pnpm gas-prompt DBG-001 --erro="Error: Cannot find module '@rollup/plugin-typescript'" --contexto="Tentando executar build para o projeto vendas-tracker"
   ```

2. **Solução de Problemas (DBG-002)**:

   ```bash
   pnpm gas-prompt DBG-002 --problema="Módulo Rollup não encontrado" --diagnostico="[colar diagnóstico]"
   ```

## 5. Melhores Práticas

### 5.1. Preparação

- **Conheça o contexto**: Entenda claramente o problema antes de usar um prompt
- **Escolha o prompt correto**: Consulte o [índice de prompts](./50-indice-prompts.md) para identificar o mais adequado
- **Prepare os dados**: Reúna todas as informações necessárias antecipadamente

### 5.2. Execução

- **Forneça contexto completo**: Quanto mais informações relevantes, melhor o resultado
- **Seja específico**: Evite ambiguidades e seja claro sobre o que deseja
- **Verifique o resultado**: Sempre revise e valide a saída do prompt

### 5.3. Iteração

- **Refine gradualmente**: Se o resultado não for satisfatório, ajuste o prompt e tente novamente
- **Mantenha um registro**: Documente prompts bem-sucedidos para uso futuro
- **Compartilhe melhorias**: Contribua com refinamentos para a comunidade

## 6. Limitações e Considerações

### 6.1. Limitações dos LLMs

- **Conhecimento limitado**: Modelos podem não ter informações sobre as versões mais recentes de APIs
- **Alucinações**: Podem gerar código plausível, mas incorreto
- **Limitações contextuais**: Existe um limite para quanto contexto pode ser fornecido

### 6.2. Validação de Saída

Sempre verifique:

- **Correção técnica**: O código gerado está correto e funciona?
- **Segurança**: Não contém vulnerabilidades ou práticas inseguras?
- **Estilo e padrões**: Segue as convenções do projeto?
- **Eficiência**: A solução é eficiente ou tem problemas de performance?

### 6.3. Questões Éticas e de Privacidade

- **Dados sensíveis**: Nunca inclua credenciais, tokens ou dados pessoais nos prompts
- **Propriedade intelectual**: Cuidado com código proprietário compartilhado com modelos externos
- **Atribuição**: Documente código gerado por LLMs quando necessário por políticas internas

## 7. Ferramenta de Prompt CLI

### 7.1. Instalação

A ferramenta CLI está incluída no GAS Builder:

```bash
# No diretório do projeto
pnpm install

# Verificar instalação
pnpm gas-prompt --version
```

### 7.2. Configuração

Configure suas chaves de API e preferências:

```bash
# Configurar API OpenAI
pnpm gas-prompt config set api.provider openai
pnpm gas-prompt config set api.key sk-xxxxxxxxxxxxxxxxxxxxxxxx

# Configurar API Claude
pnpm gas-prompt config set api.provider anthropic
pnpm gas-prompt config set api.key sk-ant-xxxxxxxxxxxxxx

# Definir modelo padrão
pnpm gas-prompt config set default.model gpt-4
```

### 7.3. Comandos Principais

```bash
# Listar todos os prompts disponíveis
pnpm gas-prompt list

# Listar prompts por categoria
pnpm gas-prompt list --categoria=configuracao

# Ver detalhes de um prompt
pnpm gas-prompt info CFG-001

# Executar prompt
pnpm gas-prompt exec CFG-001 --nome="Meu Projeto"

# Executar com saída para arquivo
pnpm gas-prompt exec CFG-001 --nome="Meu Projeto" --output=config.yml
```

### 7.4. Opções Avançadas

```bash
# Definir modelo específico
pnpm gas-prompt exec CFG-001 --nome="Meu Projeto" --model=gpt-4

# Definir temperatura (0.0 a 1.0)
pnpm gas-prompt exec CFG-001 --nome="Meu Projeto" --temperatura=0.2

# Modo interativo
pnpm gas-prompt interactive CFG-001

# Histórico de execuções
pnpm gas-prompt history
```

## 8. Desenvolvimento de Novos Prompts

### 8.1. Template Básico

```markdown
# [TÍTULO DO PROMPT]

> Versão: 1.0.0 | Última atualização: 06/05/2025

## Cenário
[Descrição do contexto e situação em que o prompt deve ser usado]

## Seu Papel
[Definição do papel/persona que o LLM deve assumir]

## Instruções Detalhadas
[Instruções passo a passo do que deve ser feito]

## Fontes de Referência
[Links e referências relevantes]

## Formato de Saída
[Especificação do formato esperado da resposta]

## Exemplo de Saída
[Exemplo concreto do tipo de resposta esperada]
```

### 8.2. Processo de Desenvolvimento

1. **Identificação de Necessidade**:
   - Identifique tarefa repetitiva ou complexa
   - Verifique se não existe prompt similar

2. **Design Inicial**:
   - Crie primeiro rascunho seguindo o template
   - Defina claramente o propósito e saída esperada

3. **Teste e Refinamento**:
   - Teste com diferentes inputs
   - Itere baseado nos resultados
   - Refine instruções para melhorar consistência

4. **Documentação**:
   - Documente casos de uso e exemplos
   - Adicione ao índice de prompts

5. **Publicação**:
   - Submeta como pull request
   - Descreva propósito e benefícios

### 8.3. Dicas para Prompts Eficazes

- **Estrutura clara**: Divida instruções complexas em passos
- **Exemplo explícito**: Forneça exemplos do resultado desejado
- **Feedback embutido**: Inclua instruções para auto-avaliação
- **Limitações claras**: Especifique o que o prompt não deve fazer
- **Casos de borda**: Considere situações excepcionais

## Próximos Passos

- Explore o [índice de prompts](./50-indice-prompts.md) para conhecer todos os prompts disponíveis
- Consulte o [plano de engenharia de prompts](./35-prompt-engineering-plan.md) para entender a estratégia futura
- Contribua com novos prompts ou melhorias nos existentes

## Referências

- [50-indice-prompts.md](./50-indice-prompts.md): Catálogo completo de prompts
- [35-prompt-engineering-plan.md](./35-prompt-engineering-plan.md): Plano estratégico
- [OpenAI Cookbook](https://cookbook.openai.com/): Receitas para engenharia de prompts
- [Anthropic Prompt Design](https://docs.anthropic.com/claude/prompt-design): Guia de design de prompts
