import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
// import path from 'path';

// Importar o módulo de carregamento de configuração
import * as configHelper from './scripts/build-system/config-helper.js';
import logger from './scripts/build-system/logger.js';

/** Plugin para remover todas as linhas de import estático */
function removeImports() {
  return {
    name: 'remove-imports',
    renderChunk(code) {
      // Regex que captura linhas com `import ... from '...'` ou `import '...'`;
      const stripped = code
        .split('\n')
        .filter(line => !/^import\s.*?;/.test(line))
        .filter(line => !/^export\s.*?;/.test(line))
        .join('\n');
      return { code: stripped, map: null };
    }
  };
}

/**
 * Determina a extensão principal do arquivo com base na linguagem configurada
 * @param {string} language - 'javascript' ou 'typescript'
 * @returns {string} - Extensão do arquivo principal (.js ou .ts)
 */
function getMainFileExtension(language) {
  return language === 'javascript' ? '.js' : '.ts';
}

/**
 * Gera a configuração do Rollup com base no arquivo YAML
 * @param {Object} configData - Objeto com a configuração
 * @returns {Array} - Array com as configurações do Rollup
 */
function generateRollupConfig(configData) {
  const rollupConfig = [];
  const defaultRollupConfig = configData.defaults?.rollup || {};
  
  // Para cada projeto definido na configuração
  for (const projectKey in configData.projects) {
    const projectConfig = configData.projects[projectKey];
    const projectSrc = projectConfig.src;
    const projectRollupConfig = projectConfig.rollup || {};
    
    // Pular projetos sem configuração de Rollup
    if (!projectSrc) continue;
    
    // Determinar a linguagem a ser usada (typescript é o padrão se não especificado)
    const projectLanguage = projectConfig.language || 'typescript';
    logger.info(`Projeto ${projectKey} usando linguagem: ${projectLanguage}`);
    
    // Definir o caminho do arquivo principal com base na linguagem
    const defaultExt = getMainFileExtension(projectLanguage);
    const mainFile = projectRollupConfig.main || `main${defaultExt}`;
    const mainPath = `${configData.defaults.paths.src}/${projectSrc}/${mainFile}`;
    
    // Definir as entradas (input)
    const input = {
      [projectKey]: mainPath
    };
    
    // Adicionar bibliotecas comuns do projeto
    const commonLibs = projectRollupConfig['common-libs'] || [];
    commonLibs.forEach(lib => {
      input[lib.name] = lib.path;
    });
    
    // Adicionar bibliotecas específicas do projeto
    const projectLibs = projectRollupConfig['project-libs'] || [];
    projectLibs.forEach(lib => {
      input[lib.name] = lib.path;
    });
    
    // Definir as bibliotecas externas do projeto
    const externals = projectRollupConfig.externals || [];
    
    // Criar a configuração do projeto
    const projectOutput = projectConfig.output || projectKey;
    
    // Configurar os plugins
    const plugins = [];
    
    // Adicionar plugins padrão com suas configurações
    const defaultPlugins = defaultRollupConfig.plugins || [];
    defaultPlugins.forEach(pluginConfig => {
      // Pular plugin de typescript se o projeto for javascript
      if (pluginConfig.name === 'typescript' && projectLanguage === 'javascript') {
        return;
      }
      
      switch (pluginConfig.name) {
        case 'nodeResolve':
          plugins.push(nodeResolve(pluginConfig.config || {}));
          break;
        case 'typescript':
          // Adicionar apenas se o projeto for TypeScript
          if (projectLanguage === 'typescript') {
            // Mesclar configurações padrão com configurações específicas
            const tsConfig = {
              ...(pluginConfig.config || {}),
              outDir: `${configData.defaults.paths.build}/${projectOutput}`
            };
            plugins.push(typescript(tsConfig));
          }
          break;
        case 'commonjs':
          plugins.push(commonjs(pluginConfig.config || {}));
          break;
        case 'babel':
          // Adicionar babel para projetos JavaScript para transformações necessárias
          if (projectLanguage === 'javascript') {
            plugins.push(babel({
              babelHelpers: 'bundled',
              presets: [['@babel/preset-env', { targets: { node: '12' } }]],
              ...(pluginConfig.config || {})
            }));
          }
          break;
        case 'removeImports':
          plugins.push(removeImports());
          break;
        case 'terser':
          plugins.push(terser(pluginConfig.config || {}));
          break;
        // Adicionar outros plugins conforme necessário
      }
    });
    
    // Adicionar plugins específicos do projeto (se houver)
    const projectPlugins = projectRollupConfig.plugins || [];
    projectPlugins.forEach(pluginConfig => {
      // Pular plugin de typescript se o projeto for javascript
      if (pluginConfig.name === 'typescript' && projectLanguage === 'javascript') {
        return;
      }
      
      switch (pluginConfig.name) {
        case 'nodeResolve':
          plugins.push(nodeResolve(pluginConfig.config || {}));
          break;
        case 'typescript':
          // Adicionar apenas se o projeto for TypeScript
          if (projectLanguage === 'typescript') {
            // Mesclar configurações específicas com configurações padrão
            const tsConfig = {
              ...(pluginConfig.config || {}),
              outDir: `${configData.defaults.paths.build}/${projectOutput}`
            };
            plugins.push(typescript(tsConfig));
          }
          break;
        case 'commonjs':
          plugins.push(commonjs(pluginConfig.config || {}));
          break;
        case 'babel':
          // Adicionar babel para projetos JavaScript para transformações necessárias
          if (projectLanguage === 'javascript') {
            plugins.push(babel({
              babelHelpers: 'bundled',
              presets: [['@babel/preset-env', { targets: { node: '12' } }]],
              ...(pluginConfig.config || {})
            }));
          }
          break;
        case 'removeImports':
          plugins.push(removeImports(pluginConfig.config || {}));
          break;
        case 'terser':
          plugins.push(terser(pluginConfig.config || {}));
          break;
        // Adicionar outros plugins conforme necessário
      }
    });
    
    // Adicionar plugins específicos para cada linguagem, caso não estejam configurados
    // Para JavaScript, garantimos que temos babel e commonjs
    if (projectLanguage === 'javascript') {
      const hasBabel = plugins.some(p => p.name === 'babel');
      const hasCommonjs = plugins.some(p => p.name === 'rollup-plugin-commonjs');
      
      if (!hasBabel) {
        plugins.push(babel({
          babelHelpers: 'bundled',
          presets: [['@babel/preset-env', { targets: { node: '12' } }]]
        }));
      }
      
      if (!hasCommonjs) {
        plugins.push(commonjs());
      }
    }
    
    // Criar a configuração do projeto
    const projectRollupConf = {
      input,
      output: {
        dir: `${configData.defaults.paths.build}/${projectOutput}`,
        format: defaultRollupConfig.output?.format || 'esm',
        inlineDynamicImports: defaultRollupConfig.output?.inlineDynamicImports !== undefined 
          ? defaultRollupConfig.output.inlineDynamicImports 
          : false,
        name: projectRollupConfig.name || `VilladasPedras.${projectKey.charAt(0).toUpperCase() + projectKey.slice(1)}`
      },
      plugins
    };
    
    // Adicionar externals se existirem
    if (externals.length > 0) {
      projectRollupConf.external = externals;
    }
    
    rollupConfig.push(projectRollupConf);
  }
  
  return rollupConfig;
}

// Carregar a configuração usando o módulo compartilhado
const config = configHelper.loadConfig();

// Gerar a configuração do Rollup
const rollupConfig = generateRollupConfig(config);

// Exibir informações sobre a configuração gerada
logger.info(`Configuração do Rollup gerada para ${rollupConfig.length} projetos:`);
rollupConfig.forEach((config, index) => {
  logger.info(`  Projeto ${index + 1}: ${Object.keys(config.input).join(', ')}`);
});

export default rollupConfig;
