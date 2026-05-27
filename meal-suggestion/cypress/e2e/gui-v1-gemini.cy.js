describe('Aplicação Meal Suggestion - Testes E2E', () => {

  beforeEach(() => {
    cy.visit('https://meal-suggestion.s3.eu-central-1.amazonaws.com/index.html');
  });

  it('Deve carregar os elementos principais da interface corretamente', () => {
    cy.get('h1').should('contain', 'Refeição vegana 🌱');
    cy.get('input[type="text"]').should('be.visible');
    cy.get('button').should('contain', 'Buscar'); 
  });

  it('Deve buscar e exibir uma receita aleatória com sucesso', () => {
    cy.get('#meal-type-filter').should('contain', 'Todos');
    cy.contains('button', 'Buscar').click();
    cy.get('#meal-container').should('be.visible');
  });
});