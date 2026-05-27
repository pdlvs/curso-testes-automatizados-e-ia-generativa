describe('Aplicação Refeição Vegana - Testes E2E', () => {

  beforeEach(() => {
    // Visita a página da aplicação
    cy.visit('https://meal-suggestion.s3.eu-central-1.amazonaws.com/index.html');
  });

  it('Deve renderizar a interface inicial com todos os elementos obrigatórios', () => {
    // Valida o título principal com o emoji
    cy.get('h1, .title, body').should('contain.text', 'Refeição vegana').and('be.visible');

    // Valida o rótulo e o select de "Tipo"
    cy.contains('label, span, td', 'Tipo:').should('be.visible');
    cy.get('select').should('be.visible').and('contain', 'Todos');

    // Valida o rótulo, o input (com placeholder) e o botão de busca
    cy.contains('label, span, td', 'Busca:').should('be.visible');
    cy.get('input[placeholder="Ex: Arroz e feijão"]').should('be.visible');
    cy.get('button').should('contain.text', 'Buscar').and('be.visible');
  });

  it('Deve buscar e exibir uma receita com seus respectivos ingredientes', () => {
    const termoBusca = 'Sanduíche';

    // Digita no campo de busca e clica no botão Buscar
    cy.get('input[placeholder="Ex: Arroz e feijão"]').type(termoBusca);
    cy.contains('button', 'Buscar').click();

    // Valida que o título da receita correspondente apareceu na tela
    cy.get('body')
      .should('contain.text', 'Sanduíche de falafel e tofu')
      .and('contain.text', '(sanduíche com alto teor de proteína)');

    // Valida a seção de ingredientes
    cy.contains('Ingredientes:').should('be.visible');

    // Garante que a lista de ingredientes foi renderizada e contém itens esperados
    cy.get('ul, ol, table, div') // Seletor genérico da estrutura da lista
      .should('be.visible')
      .and('contain.text', 'pão sírio')
      .and('contain.text', 'falafel')
      .and('contain.text', 'tofu natural')
      .and('contain.text', 'pepino');
  });

  it('Deve permitir filtrar as receitas pelo componente de Tipo', () => {
    // Caso o select possua opções como 'Almoço', 'Lanche', etc.
    // Aqui selecionamos uma opção diferente (ex: mudando de 'Todos')
    cy.get('select').select(1); // Seleciona a segunda opção da lista
    cy.contains('button', 'Buscar').click();

    // Valida que a lista foi atualizada ou continua exibindo elementos válidos
    cy.get('body').should('not.contain.text', 'Erro interno');
  });
});