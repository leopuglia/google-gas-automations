# Guia do Sistema de Build

> Última atualização: 08/05/2025

## Resumo

Este guia explica como usar o sistema de build do GAS Builder para compilar, otimizar e preparar seus projetos Google Apps Script para deploy. O sistema de build é baseado em Rollup e oferece várias opções de configuração para atender diferentes necessidades de projeto.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18.x ou superior
- [pnpm](https://pnpm.io/) (gerenciador de pacotes preferido)
- Conhecimento básico de [TypeScript](https://www.typescriptlang.org/)
- [Clasp](https://github.com/google/clasp) configurado

## 1. Visão Geral do Sistema de Build

O sistema de build do GAS Builder transforma seu código TypeScript modular em JavaScript compatível com Google Apps Script. Ele realiza as seguintes operações:

1. Compila o código TypeScript para JavaScript
2. Resolve dependências e módulos
3. Concatena os arquivos conforme necessário
4. Aplica otimizações (minificação, tree-shaking)
5. Gera artefatos prontos para o deploy

Este processo é automatizado e configurável via arquivos de configuração e CLI.

## 2. Configuração Básica do Build

### 2.1. Estrutura de Arquivos

Um projeto típico do GAS Builder tem a seguinte estrutura:

```bash
meu-projeto/
├── build/              # Diretório de saída (gerado automaticamente)
├── src/                # Código fonte TypeScript
│   ├── index.ts        # Ponto de entrada principal
│   └── ...             # Outros arquivos e módulos
├── config.yml          # Configuração do GAS Builder
├── package.json        # Dependências e scripts
├── rollup.config.js    # Configuração do Rollup
└── tsconfig.json       # Configuração do TypeScript
```

### 2.2. Scripts de Build

Os comandos básicos de build estão disponíveis através do `package.json`:

```bash
# Build de desenvolvimento
pnpm build

# Build de produção (com otimizações)
pnpm build:prod

# Build com watch (reconstruir ao detectar mudanças)
pnpm build:watch

# Build e deploy
pnpm deploy
```

### 2.3. Configuração no arquivo YAML

O comportamento do build é controlado pela seção `build` no arquivo `config.yml`:

```yaml
projects:
  meu-projeto:
    # ... outras configurações
    build:
      entry: src/index.ts
      outDir: build
      format: esm
      sourcemap: true
      minify: true
      plugins:
        - rollup-plugin-gas-export
```

Para detalhes completos sobre as opções de configuração, consulte a [Referência de Configuração YAML](./20-ref-configuracao-yaml.md).

## 3. Uso Básico

### 3.1. Build Simples

Para executar um build básico do projeto:

```bash
# Na raiz do projeto
pnpm build

# Ou usando a CLI diretamente
pnpm gas-builder build --project meu-projeto
```

Isto irá:

1. Compilar o código TypeScript de acordo com o `tsconfig.json`
2. Aplicar as transformações configuradas
3. Gerar os arquivos JavaScript na pasta `build/`

### 3.2. Build com Watch

Durante o desenvolvimento, é útil usar o modo watch para recompilar automaticamente quando os arquivos são modificados:

```bash
pnpm build:watch
```

### 3.3. Build de Produção

Para um build otimizado para produção:

```bash
pnpm build:prod
```

O build de produção aplica otimizações adicionais como:

- Minificação mais agressiva
- Remoção de código morto
- Desativação de sourcemaps
- Validações extras

## 4. Personalização do Build

### 4.1. Configuração do TypeScript

O arquivo `tsconfig.json` controla como o TypeScript é compilado:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "outDir": "build",
    "rootDir": "src",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "build"]
}
```

Ajuste estas configurações conforme necessário para seu projeto.

### 4.2. Configuração do Rollup

O arquivo `rollup.config.js` pode ser personalizado para casos específicos:

```javascript
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import gasExport from 'rollup-plugin-gas-export';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'build',
    format: 'esm',
    sourcemap: !isProduction
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    gasExport(),
    isProduction && terser()
  ]
};
```

### 4.3. Plugins Personalizados

O GAS Builder suporta vários plugins para o Rollup, incluindo:

- **typescript**: Compila TypeScript
- **node-resolve**: Resolve módulos do Node.js
- **commonjs**: Converte módulos CommonJS para ES
- **terser**: Minifica o código
- **gas-export**: Adiciona exportações globais para funcionar no Google Apps Script
- **cleanup**: Remove comentários e código não utilizado

Você pode adicionar plugins personalizados conforme necessário:

```javascript
// rollup.config.js
import customPlugin from './plugins/my-custom-plugin.js';

export default {
  // configuração existente
  plugins: [
    // plugins existentes
    customPlugin({
      // opções personalizadas
    })
  ]
};
```

## 5. Casos de Uso Comuns

### 5.1. Módulos Múltiplos com Entradas Separadas

Para projetos com múltiplos pontos de entrada:

```javascript
// rollup.config.js
export default [
  {
    input: 'src/main.ts',
    output: { file: 'build/Code.js', format: 'iife' },
    plugins: [/* ... */]
  },
  {
    input: 'src/ui.ts',
    output: { file: 'build/UI.js', format: 'iife' },
    plugins: [/* ... */]
  }
];
```

### 5.2. Bibliotecas Externas

Para incorporar bibliotecas externas:

```javascript
// rollup.config.js
export default {
  // configuração básica
  external: ['@google/sheets'], // Bibliotecas tratadas como externas
  plugins: [
    // plugins existentes
    // Para libs que não são ESM:
    commonjs({
      include: 'node_modules/**'
    })
  ]
};
```

### 5.3. HTML e CSS

Para projetos com HTML e CSS:

```javascript
// rollup.config.js
import html from '@rollup/plugin-html';
import css from 'rollup-plugin-css-only';

export default {
  // configuração básica
  plugins: [
    // plugins existentes
    html({
      template: ({ bundle }) => `<!DOCTYPE html><html>${bundle}</html>`
    }),
    css({ output: 'styles.css' })
  ]
};
```

## 6. Deploy Após Build

### 6.1. Deploy Básico

Após um build bem-sucedido, você pode fazer deploy para o Google Apps Script:

```bash
pnpm deploy
```

Este comando executa:

1. Build do projeto (se não foi feito ainda)
2. Validação dos artefatos gerados
3. Push para o Google Apps Script via Clasp

### 6.2. Deploy para Ambientes Específicos

O GAS Builder suporta múltiplos ambientes (dev, staging, prod):

```bash
# Deploy para desenvolvimento
pnpm deploy:dev

# Deploy para produção
pnpm deploy:prod
```

Cada ambiente pode ter suas próprias configurações no arquivo `config.yml`:

```yaml
environments:
  dev:
    scriptId: "1abc123_dev"
  prod:
    scriptId: "1abc123_prod"
```

### 6.3. Deploy Parcial

Para fazer deploy de apenas alguns arquivos:

```bash
pnpm gas-builder deploy --files "build/Code.js,build/UI.js"
```

## 7. Troubleshooting

### 7.1. Problemas Comuns de Build

| Problema | Solução |
|----------|---------|
| Erro "Cannot find module" | Verifique as importações e dependências do package.json |
| Erro no TypeScript | Corrija os erros de tipo no código fonte |
| Build muito grande | Reduza dependências ou divida em projetos menores |
| Erro em plugins | Verifique a compatibilidade dos plugins com a versão do Rollup |

### 7.2. Verificando o Build

Para verificar se o build está correto:

```bash
# Ver arquivos gerados
ls -la build/

# Verificar tamanho do build
du -sh build/

# Analisar tamanho detalhado
pnpm gas-builder analyze
```

### 7.3. Limpeza

Para limpar artefatos de builds anteriores:

```bash
pnpm clean
```

## 8. Configurações Avançadas

### 8.1. Builds Condicionais

Para configurar builds condicionais com base em variáveis de ambiente:

```javascript
// rollup.config.js
const config = {
  // configuração básica
};

if (process.env.INCLUDE_ADVANCED === 'true') {
  config.plugins.push(/* plugins adicionais */);
}

export default config;
```

### 8.2. Cache de Build

Para melhorar o desempenho, habilite o cache do Rollup:

```javascript
// rollup.config.js
export default {
  // configuração básica
  cache: true
};
```

### 8.3. Análise de Bundle

Para analisar o tamanho e composição do bundle:

```bash
pnpm analyze
```

Isso executará ferramentas de análise e mostrará:

- Tamanho total do bundle
- Tamanho de cada módulo
- Dependências incluídas
- Sugestões de otimização

## 9. Melhores Práticas

### 9.1. Otimização

- **Tree-shaking**: Importe apenas o que você usa

  ```typescript
  // Bom
  import { debounce } from 'lodash-es';
  
  // Ruim (importa tudo)
  import * as _ from 'lodash';
  ```

- **Code-splitting**: Divida seu código em módulos lógicos

  ```typescript
  // Estrutura recomendada
  src/
    ├── core/      # Funcionalidades básicas
    ├── ui/        # Interface de usuário
    └── utils/     # Utilitários
  ```

- **Lazy loading**: Carregue código sob demanda

  ```typescript
  function onDemandFeature() {
    // Função carregada apenas quando necessário
    const heavyModule = importModule_('HeavyModule');
    return heavyModule.process();
  }
  ```

### 9.2. Compatibilidade

- Use recursos JavaScript compatíveis com o Google Apps Script (ES2019)
- Teste seu código em diferentes ambientes (dev, prod)
- Considere compatibilidade com diferentes navegadores para UI

### 9.3. Desempenho do Build

- Mantenha dependências atualizadas
- Use o modo watch durante o desenvolvimento
- Otimize a configuração do TypeScript
- Configure corretamente o cache

## Próximos Passos

- Consulte a [Referência do Sistema de Build](./21-ref-sistema-build.md) para detalhes técnicos
- Veja o [Guia de Troubleshooting](./19-guia-troubleshooting.md) para solução de problemas
- Explore as [Referências de Configuração YAML](./20-ref-configuracao-yaml.md) para opções avançadas

## Referências

- [Documentação do Rollup](https://rollupjs.org/guide/en/)
- [Plugins do Rollup](https://github.com/rollup/plugins)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Clasp CLI](https://github.com/google/clasp)
