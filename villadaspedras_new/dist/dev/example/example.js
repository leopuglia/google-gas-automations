// Função que será exposta ao GAS
global.onOpen = () => {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Villa das Pedras')
        .addItem('Executar Exemplo', 'executarExemplo')
        .addToUi();
};
// Função de exemplo que será exposta ao GAS
global.executarExemplo = () => {
    SpreadsheetApp.getUi().alert('Exemplo executado com sucesso!');
};
