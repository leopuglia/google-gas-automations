# Sistema de Logs para Scripts de Build e Deploy

Este documento descreve o sistema de logs implementado para os scripts de build e deploy do projeto `villadaspedras_new`.

## Visão Geral

O sistema de logs foi projetado para tornar a saída dos scripts mais organizada e menos poluída, permitindo categorizar os logs em diferentes níveis de importância e personalizar a aparência das mensagens.

## Níveis de Log

O sistema suporta os seguintes níveis de log, em ordem crescente de importância:

| Nível   | Descrição                                  | Cor Padrão |
|---------|-------------------------------------------|------------|
| VERBOSE | Logs detalhados para depuração profunda    | Cinza      |
| DEBUG   | Informações úteis para depuração           | Azul       |
| INFO    | Informações gerais sobre o processo        | Verde      |
| WARN    | Avisos que não interrompem o processo      | Amarelo    |
| ERROR   | Erros que podem interromper o processo     | Vermelho   |
| NONE    | Nenhum log (silencioso)                    | -          |

## Métodos Especiais

Além dos níveis padrão, o sistema também oferece métodos especiais para destacar mensagens importantes:

| Método     | Descrição                                | Cor Padrão     |
|------------|------------------------------------------|----------------|
| success    | Mensagens de sucesso (nível INFO)        | Verde Brilhante|
| highlight  | Mensagens destacadas (nível INFO)        | Ciano          |
| important  | Mensagens importantes (nível INFO)       | Magenta + Negrito |

## Uso Básico

```javascript
import logger from './scripts/logger.js';

// Logs com diferentes níveis
logger.verbose('Mensagem detalhada para depuração profunda');
logger.debug('Informação útil para depuração');
logger.info('Informação geral sobre o processo');
logger.warn('Aviso que não interrompe o processo');
logger.error('Erro que pode interromper o processo', erro);

// Métodos especiais
logger.success('Operação concluída com sucesso');
logger.highlight('Informação que merece destaque');
logger.important('Informação muito importante');
```

## Personalização de Cores

O sistema permite personalizar as cores das mensagens de duas formas:

### 1. Personalização por Mensagem

Você pode especificar uma cor personalizada para uma mensagem específica:

```javascript
// Mensagem INFO com cor personalizada
logger.info('Mensagem importante', { color: 'red' });
logger.debug('Detalhes do processo', { color: 'cyan' });

// Mensagem em negrito
logger.info('Mensagem destacada', { bold: true });

// Combinação de opções
logger.info('Mensagem muito importante', { color: 'magenta', bold: true });
```

### 2. Configuração Global de Cores

Você pode configurar as cores padrão para cada nível:

```javascript
logger.configure({
  colors: {
    INFO: 'blueBright',
    DEBUG: 'magentaBright',
    WARN: 'yellowBright'
  }
});
```

## Controle de Nível

O nível mínimo de log a ser exibido pode ser configurado de várias formas:

### 1. Via Linha de Comando

```bash
# Exibir apenas logs de informação e superiores (padrão)
pnpm run deploy

# Exibir logs detalhados (todos os níveis)
pnpm run deploy -- --log-level=verbose

# Exibir apenas erros
pnpm run deploy -- --log-level=error
```

### 2. Via Configuração Programática

```javascript
// Configurar para exibir apenas logs de nível DEBUG e superiores
logger.configure({ level: logger.levels.DEBUG });

// Configurar para exibir todos os logs
logger.configure({ level: logger.levels.VERBOSE });

// Configurar para exibir apenas erros
logger.configure({ level: logger.levels.ERROR });

// Configurar para não exibir nenhum log
logger.configure({ level: logger.levels.NONE });
```

### 3. Via Variáveis de Ambiente

```bash
# Exibir apenas logs de nível DEBUG e superiores
LOG_LEVEL=DEBUG pnpm run deploy

# Desativar cores
LOG_COLORS=false pnpm run deploy

# Ocultar timestamp
LOG_TIMESTAMP=false pnpm run deploy

# Ocultar nível
LOG_SHOW_LEVEL=false pnpm run deploy
```

## Cores Disponíveis

O sistema utiliza a biblioteca `chalk` para colorir as mensagens. Algumas das cores disponíveis são:

- `black`
- `red`, `redBright`
- `green`, `greenBright`
- `yellow`, `yellowBright`
- `blue`, `blueBright`
- `magenta`, `magentaBright`
- `cyan`, `cyanBright`
- `white`, `whiteBright`
- `gray`, `grey`

Para a lista completa de cores e estilos, consulte a [documentação do Chalk](https://github.com/chalk/chalk).

## Exemplo Completo

```javascript
import logger from './scripts/logger.js';

// Configurar o logger
logger.configure({
  level: logger.levels.DEBUG,
  colors: {
    INFO: 'blueBright',
    SUCCESS: 'greenBright'
  }
});

// Logs com diferentes níveis
logger.debug('Iniciando processamento');
logger.info('Processando arquivo X');
logger.success('Arquivo X processado com sucesso');
logger.warn('Arquivo Y não encontrado, usando alternativa');
logger.error('Falha ao processar arquivo Z', erro);

// Logs com cores personalizadas
logger.info('Etapa importante', { color: 'magenta', bold: true });
```

## Implementação

O sistema de logs está implementado no arquivo `scripts/logger.js` e é utilizado por todos os scripts de build e deploy do projeto.
