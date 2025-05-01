import { execSync } from 'child_process';

/**
 * Executa o comando clasp push para um projeto
 * @param {string} projectDir Diretório do projeto
 */
export function pushProject(projectDir) {
  try {
    console.log(`Executando clasp push para: ${projectDir}`);
    execSync('clasp push', { cwd: projectDir, stdio: 'inherit' });
    console.log(`Push concluído com sucesso para: ${projectDir}`);
    return true;
  } catch (error) {
    console.error(`Erro ao executar clasp push para ${projectDir}: ${error.message}`);
    return false;
  }
}
