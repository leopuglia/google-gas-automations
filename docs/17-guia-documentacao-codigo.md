# Guia de Documentação de Código para o GAS Builder

> Data: 02/05/2025

Este guia estabelece os padrões e práticas recomendadas para documentação de código no projeto Google Apps Script Builder. Seguir estes padrões garantirá uma documentação consistente e de alta qualidade em todo o código-fonte.

## Padrão JSDoc/TSDoc

Todo o código do projeto deve ser documentado usando JSDoc para arquivos JavaScript e TSDoc para arquivos TypeScript. A documentação deve seguir o seguinte formato:

### Para Funções e Métodos

```typescript
/**
 * Descrição clara e concisa da função
 * 
 * Detalhes adicionais sobre o comportamento da função, se necessário.
 * Pode incluir múltiplas linhas para explicações mais complexas.
 * 
 * @param {tipo} nomeParametro - Descrição do parâmetro
 * @param {tipo} [parametroOpcional] - Descrição do parâmetro opcional
 * @param {tipo} [parametroComPadrao=valorPadrao] - Parâmetro com valor padrão
 * @returns {tipoRetorno} Descrição do valor de retorno
 * @throws {TipoErro} Descrição da condição que causa o erro
 * 
 * @example
 * // Exemplo básico de uso
 * const resultado = minhaFuncao('valor', 42);
 * 
 * @example
 * // Exemplo mais complexo
 * try {
 *   const resultado = minhaFuncao('valor', 42, { opcao: true });
 *   // Fazer algo com o resultado
 * } catch (erro) {
 *   // Tratar o erro
 * }
 */
```

### Para Classes

```typescript
/**
 * Descrição da classe
 * 
 * @class
 * @implements {Interface}
 * @extends {ClassePai}
 * 
 * @example
 * const instancia = new MinhaClasse(parametro);
 * instancia.metodo();
 */
```

### Para Interfaces e Tipos

```typescript
/**
 * Descrição da interface
 * 
 * @interface
 * @property {tipo} propriedade - Descrição da propriedade
 * @property {tipo} [propriedadeOpcional] - Descrição da propriedade opcional
 */
```

### Para Módulos

```typescript
/**
 * @module NomeDoModulo
 * @description Descrição geral do módulo e sua finalidade
 */
```

## Exemplos Específicos para o GAS Builder

### Exemplo para o template-helper.js

```typescript
/**
 * Processa um template Handlebars com as variáveis fornecidas
 * 
 * @param {string} templatePath - Caminho absoluto ou relativo para o arquivo de template
 * @param {string} outputPath - Caminho absoluto ou relativo para o arquivo de saída
 * @param {object} context - Objeto contendo as variáveis a serem substituídas no template
 * @returns {boolean} - Verdadeiro se o processamento foi bem-sucedido, falso caso contrário
 * @throws {Error} - Se o template não puder ser compilado
 * 
 * @example
 * // Processar um template com variáveis
 * processTemplate(
 *   'templates/appsscript.json.template',
 *   'build/example/appsscript.json',
 *   { timeZone: 'America/Sao_Paulo', runtimeVersion: 'V8' }
 * );
 */
function processTemplate(templatePath, outputPath, context) {
  // Implementação...
}
```

### Exemplo para o config-helper.js

```typescript
/**
 * Carrega e valida a configuração do arquivo YAML
 * 
 * @param {string} configPath - Caminho para o arquivo de configuração YAML
 * @param {object} [options] - Opções adicionais
 * @param {boolean} [options.validate=true] - Se verdadeiro, valida a configuração contra o schema
 * @param {string} [options.schemaPath] - Caminho para o arquivo de schema JSON (opcional)
 * @returns {object} Objeto de configuração carregado e validado
 * @throws {Error} Se o arquivo não existir ou a validação falhar
 * 
 * @example
 * // Carregar configuração com validação padrão
 * const config = loadConfig('config.yml');
 * 
 * @example
 * // Carregar configuração sem validação
 * const config = loadConfig('config.yml', { validate: false });
 */
function loadConfig(configPath, options = {}) {
  // Implementação...
}
```

## Diretrizes Adicionais

### 1. Comentários em Português

Todos os comentários de documentação devem ser escritos em português do Brasil, seguindo a convenção estabelecida para o projeto. Quando a documentação for traduzida para inglês, serão criadas versões separadas dos arquivos.

### 2. Documentação Obrigatória

A documentação é obrigatória para:
- Todas as funções e métodos exportados/públicos
- Todas as classes
- Todas as interfaces e tipos
- Todos os módulos

### 3. Exemplos de Uso

Sempre que possível, inclua exemplos de uso para facilitar o entendimento. Os exemplos devem ser:
- Concisos e claros
- Funcionais (código que realmente funciona)
- Relevantes para casos de uso comuns

### 4. Manutenção da Documentação

A documentação deve ser mantida atualizada sempre que o código for modificado:
- Atualize a descrição se o comportamento mudar
- Atualize os parâmetros se forem adicionados, removidos ou modificados
- Atualize os exemplos se não forem mais válidos

## Integração com TypeDoc

O projeto utilizará TypeDoc para gerar documentação automática a partir dos comentários JSDoc/TSDoc. Para garantir que a documentação seja gerada corretamente:

1. Siga rigorosamente o formato JSDoc/TSDoc
2. Use tags padronizadas (@param, @returns, etc.)
3. Verifique a documentação gerada após alterações significativas

## Verificação de Documentação

Para verificar se a documentação está completa e correta:

1. Execute o ESLint com regras de documentação ativadas
2. Gere a documentação com TypeDoc e verifique se não há erros
3. Faça uma revisão manual periódica da documentação

## Próximos Passos

1. Implementar JSDoc/TSDoc em todos os arquivos principais
2. Configurar TypeDoc para geração automática de documentação
3. Integrar verificação de documentação no pipeline de CI/CD
4. Criar exemplos de documentação para casos específicos do GAS Builder

## Referências

- [JSDoc - Documentação Oficial](https://jsdoc.app/)
- [TypeDoc - Documentação Oficial](https://typedoc.org/)
- [Google JavaScript Style Guide - Documentação](https://google.github.io/styleguide/jsguide.html#jsdoc)

---

Este guia está alinhado com o [plano de melhorias da documentação](./17-plano-melhorias-documentacao.md) e faz parte da [Fase 1.7: Documentação Avançada](./00-roadmap-gas-builder.md) do roadmap do projeto.
