import { ThankYouPage } from './ThankYouPage';

describe('ThankYouPage', () => {
  const orderNumber = 'ORD-12345';

  it('displays the thank you message and order number', () => {
    cy.mount(<ThankYouPage orderNumber={orderNumber} onBackToStore={cy.stub()} />);

    cy.contains('h1', 'Thank You for Your Purchase!').should('be.visible');
    cy.contains('Your order has been successfully placed').should('be.visible');
    cy.contains('Order Number').should('be.visible');
    cy.contains(orderNumber).should('be.visible');
  });

  it('calls onBackToStore when the Back to Store button is clicked', () => {
    const onBackToStore = cy.stub().as('onBackToStore');

    cy.mount(<ThankYouPage orderNumber={orderNumber} onBackToStore={onBackToStore} />);

    cy.contains('button', 'Back to Store').click();
    cy.get('@onBackToStore').should('have.been.calledOnce');
  });
});
