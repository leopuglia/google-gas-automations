import { execSync } from 'child_process';
import logger from './logger.js';

/**
 * Executa o comando clasp push para um projeto
 * @param {string} projectDir Diretório do projeto
 */
export function pushProject(projectDir) {
  try {
    logger.info(`Executando clasp push para: ${projectDir}`);
    execSync('clasp push', { cwd: projectDir, stdio: 'inherit' });
    logger.info(`Push concluído com sucesso para: ${projectDir}`);
    return true;
  } catch (error) {
    logger.error(`Erro ao executar clasp push para ${projectDir}: ${error.message}`, error);
    return false;
  }
}
