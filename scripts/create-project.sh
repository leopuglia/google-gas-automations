#!/bin/bash
# Script para criar um novo projeto no monorepo google-apps-scripts-automacoes
# Autor: Leonardo Puglia

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório raiz do monorepo
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES_DIR="$ROOT_DIR/templates"

# Função para mostrar ajuda
show_help() {
  echo -e "${BLUE}Criador de Projetos para Google Apps Script${NC}"
  echo ""
  echo "Este script cria um novo projeto no monorepo com toda a estrutura necessária."
  echo ""
  echo "Uso:"
  echo "  $0 [opções]"
  echo ""
  echo "Opções:"
  echo "  -t, --type        Tipo de projeto (salario ou consumo)"
  echo "  -y, --year        Ano do projeto (ex: 2025)"
  echo "  -p, --pdv         PDV (apenas para tipo consumo: cafeteria, saara, castelo, stones)"
  echo "  -i, --id          ID do script no Google Apps Script"
  echo "  -h, --help        Mostra esta ajuda"
  echo ""
  echo "Exemplos:"
  echo "  $0 --type salario --year 2025 --id script_id_123456"
  echo "  $0 --type consumo --year 2025 --pdv cafeteria --id script_id_123456"
  echo ""
}

# Função para validar argumentos
validate_args() {
  # Verificar se o tipo é válido
  if [[ "$TYPE" != "salario" && "$TYPE" != "consumo" ]]; then
    echo -e "${RED}Erro: Tipo de projeto inválido. Use 'salario' ou 'consumo'.${NC}"
    exit 1
  fi

  # Verificar se o ano é válido
  if ! [[ "$YEAR" =~ ^[0-9]{4}$ ]]; then
    echo -e "${RED}Erro: Ano inválido. Use um formato de 4 dígitos (ex: 2025).${NC}"
    exit 1
  fi

  # Verificar se o PDV é válido para projetos de consumo
  if [[ "$TYPE" == "consumo" ]]; then
    if [[ "$PDV" != "cafeteria" && "$PDV" != "saara" && "$PDV" != "castelo" && "$PDV" != "stones" ]]; then
      echo -e "${RED}Erro: PDV inválido. Use 'cafeteria', 'saara', 'castelo' ou 'stones'.${NC}"
      exit 1
    fi
  fi

  # Verificar se o ID do script foi fornecido
  if [[ -z "$SCRIPT_ID" ]]; then
    echo -e "${RED}Erro: ID do script não fornecido.${NC}"
    exit 1
  fi
}

# Função para criar diretório do projeto
create_project_dir() {
  if [[ "$TYPE" == "salario" ]]; then
    PROJECT_DIR="$ROOT_DIR/modules/salario/anos/$YEAR"
    PROJECT_NAME="Macros Salários $YEAR"
    PROJECT_DESCRIPTION="Automações para a planilha de salário do ano $YEAR"
  else
    PROJECT_DIR="$ROOT_DIR/modules/consumo/pdvs/$PDV/$YEAR"
    PROJECT_NAME="Macros ${PDV^} $YEAR"
    PROJECT_DESCRIPTION="Automações para a planilha de consumo da unidade ${PDV^} do ano $YEAR"
  fi

  # Criar diretório do projeto
  mkdir -p "$PROJECT_DIR/src" "$PROJECT_DIR/build"
  
  echo -e "${GREEN}Diretório do projeto criado: $PROJECT_DIR${NC}"
}

# Função para copiar e configurar arquivos de template
setup_project_files() {
  # Copiar arquivos de configuração
  cp "$TEMPLATES_DIR/config/tsconfig.json" "$PROJECT_DIR/"
  cp "$TEMPLATES_DIR/config/.eslintrc.json" "$PROJECT_DIR/"
  cp "$TEMPLATES_DIR/config/.prettierrc" "$PROJECT_DIR/"
  
  # Configurar package.json
  CURRENT_DATE=$(date +"%d/%m/%Y")
  sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
      -e "s/{{PROJECT_DESCRIPTION}}/$PROJECT_DESCRIPTION/g" \
      "$TEMPLATES_DIR/config/package.json.template" > "$PROJECT_DIR/package.json"
  
  # Configurar .clasp.json
  sed -e "s/{{SCRIPT_ID}}/$SCRIPT_ID/g" \
      "$TEMPLATES_DIR/config/.clasp.json.template" > "$PROJECT_DIR/.clasp.json"
  
  # Configurar appsscript.json
  cp "$TEMPLATES_DIR/src/appsscript.json.template" "$PROJECT_DIR/src/appsscript.json"
  
  # Configurar arquivo TypeScript principal
  if [[ "$TYPE" == "salario" ]]; then
    sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
        -e "s/{{YEAR}}/$YEAR/g" \
        -e "s/{{DATE}}/$CURRENT_DATE/g" \
        "$TEMPLATES_DIR/src/salario.ts.template" > "$PROJECT_DIR/src/Main.ts"
  else
    sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
        -e "s/{{PDV}}/${PDV^}/g" \
        -e "s/{{YEAR}}/$YEAR/g" \
        -e "s/{{DATE}}/$CURRENT_DATE/g" \
        "$TEMPLATES_DIR/src/consumo.ts.template" > "$PROJECT_DIR/src/Main.ts"
  fi
  
  echo -e "${GREEN}Arquivos de configuração criados com sucesso.${NC}"
}

# Função para instalar dependências
install_dependencies() {
  echo -e "${YELLOW}Instalando dependências...${NC}"
  cd "$PROJECT_DIR" && pnpm install
  echo -e "${GREEN}Dependências instaladas com sucesso.${NC}"
}

# Função para compilar o projeto
build_project() {
  echo -e "${YELLOW}Compilando o projeto...${NC}"
  cd "$PROJECT_DIR" && pnpm build
  echo -e "${GREEN}Projeto compilado com sucesso.${NC}"
}

# Função para mostrar instruções finais
show_final_instructions() {
  echo -e "\n${BLUE}Projeto criado com sucesso!${NC}"
  echo -e "${YELLOW}Próximos passos:${NC}"
  echo "1. Revise o código em $PROJECT_DIR/src/Main.ts"
  echo "2. Execute 'cd $PROJECT_DIR && pnpm push' para enviar o código para o Google Apps Script"
  echo "3. Verifique se a biblioteca VilladasPedrasLib está adicionada como dependência no editor do GAS"
  echo ""
  echo -e "${BLUE}Comandos disponíveis:${NC}"
  echo "- pnpm build: Compila o código TypeScript"
  echo "- pnpm push: Compila e envia para o Google Apps Script"
  echo "- pnpm pull: Baixa o código do Google Apps Script"
  echo "- pnpm deploy: Compila e faz deploy de uma nova versão"
  echo "- pnpm watch: Compila automaticamente quando houver alterações"
  echo "- pnpm lint: Verifica erros de linting"
  echo "- pnpm lint:fix: Corrige erros de linting automaticamente"
  echo "- pnpm format: Formata o código com Prettier"
  echo ""
}

# Processar argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      TYPE="$2"
      shift 2
      ;;
    -y|--year)
      YEAR="$2"
      shift 2
      ;;
    -p|--pdv)
      PDV="$2"
      shift 2
      ;;
    -i|--id)
      SCRIPT_ID="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Argumento desconhecido: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Validar argumentos
validate_args

# Criar projeto
echo -e "${BLUE}Criando novo projeto $TYPE para o ano $YEAR...${NC}"
create_project_dir
setup_project_files
install_dependencies
build_project
show_final_instructions
