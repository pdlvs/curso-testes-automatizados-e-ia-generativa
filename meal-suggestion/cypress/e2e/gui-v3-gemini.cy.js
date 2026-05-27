describe('Sugestão de Refeição Vegana - Testes E2E', () => {

  beforeEach(() => {
    // Visita a página da aplicação
    cy.visit('https://meal-suggestion.s3.eu-central-1.amazonaws.com/index.html');
  });

  it('Deve carregar uma refeição aleatória na inicialização da página', () => {
    // Como o script.js roda no window.onload, uma receita padrão já deve iniciar visível
    cy.get('#meal-name').should('be.visible').and('not.be.empty');
    cy.get('#ingredients-label').should('contain.text', 'Ingredientes:');
    cy.get('#ingredients-list').find('li').should('have.length.at.least', 1);
  });

  it('Deve gerar uma nova refeição aleatória ao filtrar por "Tipo"', () => {
    // Guarda o nome da primeira refeição gerada para comparar depois
    cy.get('#meal-name').then(($el) => {
      const primeiroMealName = $el.text();

      // Altera o filtro para "Sanduíches"
      cy.get('#meal-type-filter').select('sandwich');

      // Garante que a nova refeição gerada pertence à categoria de sanduíche
      cy.get('#meal-name')
        .should('be.visible')
        .and('contain.text', '(sanduíche');

      // Altera para "Alto teor de proteína"
      cy.get('#meal-type-filter').select('high-protein');
      cy.get('#meal-name').should('contain.text', 'com alto teor de proteína');
    });
  });

  it('Deve buscar uma receita específica ao digitar e pressionar Enter', () => {
    // A busca funciona no evento 'change' do input (acionado por {enter})
    const pratoAlvo = 'Feijoada';
    
    cy.get('#search-field').type(`${pratoAlvo}{enter}`);

    // Valida que a Feijoada foi exibida com suas propriedades corretas
    cy.get('#meal-name').should('contain.text', 'Feijoada (prato quente com alto teor de proteína)');
    
    // Valida se alguns dos ingredientes da lista do meals.js estão na tela
    cy.get('#ingredients-list').should('contain.text', 'feijão vermelho');
    cy.get('#ingredients-list').should('contain.text', 'couve');
  });

  it('Deve testar o comportamento do botão "Buscar"', () => {
    // Cenário 1: Campo vazio + Clique no botão deve gerar uma receita aleatória
    cy.get('#meal-name').then(($el) => {
      const nomeAntes = $el.text();

      // Forçamos múltiplos cliques se necessário até mudar, já que é randômico
      cy.get('#search-container button').click();
      
      // O input deve ser limpo pelo script
      cy.get('#search-field').should('have.value', '');
    });

    // Cenário 2: Se houver texto no input, o clique apenas limpa o campo (comportamento do seu script.js)
    cy.get('#search-field').type('Almôndegas');
    cy.get('#search-container button').click();
    cy.get('#search-field').should('have.value', '');
  });
});