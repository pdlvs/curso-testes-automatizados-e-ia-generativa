// emojiMart_missing.cy.ts

describe('Emoji Mart App — Missing Coverage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // ─────────────────────────────────────────────
  // HOMEPAGE
  // ─────────────────────────────────────────────
  describe('Homepage', () => {
    it('should display emoji cards with title, description, price and add to cart button', () => {
      cy.get('[data-testid="emoji-card"]').first().within(() => {
        cy.get('[data-testid="emoji-title"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="emoji-description"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="emoji-price"]').should('be.visible').and('not.be.empty');
        cy.contains('button', 'Add to Cart').should('be.visible');
      });
    });
  });

  // ─────────────────────────────────────────────
  // EMOJI DETAILS PAGE
  // ─────────────────────────────────────────────
  describe('Emoji Details', () => {
    it('should navigate to the details page when an emoji card is clicked', () => {
      cy.get('[data-testid="emoji-card"]').first().click();
      cy.url().should('include', '/emoji/');
      cy.get('[data-testid="emoji-detail"]').should('be.visible');
    });

    it('should display emoji information on the details page', () => {
      cy.get('[data-testid="emoji-card"]').first().click();
      cy.get('[data-testid="emoji-title"]').should('be.visible').and('not.be.empty');
      cy.get('[data-testid="emoji-description"]').should('be.visible').and('not.be.empty');
      cy.get('[data-testid="emoji-price"]').should('be.visible').and('not.be.empty');
    });

    it('should go back to the emoji list when clicking "Back to all emojis"', () => {
      cy.get('[data-testid="emoji-card"]').first().click();
      cy.contains('button', 'Back to all emojis').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-testid="emoji-card"]').should('have.length', 6);
    });

    it('should add an emoji to the cart from the details page', () => {
      cy.get('[data-testid="emoji-card"]').first().click();
      cy.contains('button', 'Add to Cart').click();
      cy.get('.lucide-shopping-cart').click();
      cy.get('[data-testid="cart-item"]').should('have.length', 1);
    });
  });

  // ─────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────
  describe('Search', () => {
    it('should be case-insensitive', () => {
      cy.get('input[placeholder="Search emojis..."]').type('rocket');
      cy.get('[data-testid="emoji-card"]').should('have.length', 1);
      cy.get('[data-testid="emoji-card"]').contains('🚀').should('be.visible');
    });

    it('should update results in real time as the user types', () => {
      cy.get('input[placeholder="Search emojis..."]').type('r');
      cy.get('[data-testid="emoji-card"]').its('length').should('be.gte', 1);

      cy.get('input[placeholder="Search emojis..."]').type('oc');
      cy.get('[data-testid="emoji-card"]').its('length').should('be.lte',
        Cypress.$('[data-testid="emoji-card"]').length
      );
    });

    it('should display a "no results" message when search yields no matches', () => {
      cy.get('input[placeholder="Search emojis..."]').type('xyznotanemoji');
      cy.get('[data-testid="emoji-card"]').should('not.exist');
      cy.get('[data-testid="no-results"]').should('be.visible');
    });

    it('should restore the full list when the search field is cleared', () => {
      cy.get('input[placeholder="Search emojis..."]').type('Rocket');
      cy.get('[data-testid="emoji-card"]').should('have.length', 1);

      cy.get('input[placeholder="Search emojis..."]').clear();
      cy.get('[data-testid="emoji-card"]').should('have.length', 6);
    });
  });

  // ─────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────
  describe('Cart', () => {
    it('should show empty cart message when cart is opened without any items', () => {
      cy.get('.lucide-shopping-cart').click();
      cy.get('[data-testid="empty-cart"]')
        .contains('Your cart is empty')
        .should('be.visible');
    });

    it('should close the cart when close button is clicked', () => {
      cy.get('.lucide-shopping-cart').click();
      cy.get('[data-testid="cart-drawer"]').should('be.visible');
      cy.get('[data-testid="close-cart"]').click();
      cy.get('[data-testid="cart-drawer"]').should('not.be.visible');
    });

    it('should decrease the quantity of an emoji in the cart', () => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();
      cy.contains('button', 'Add to Cart').click();
      cy.get('.lucide-shopping-cart').click();

      cy.get('button svg.lucide-plus-circle').click();
      cy.get('[data-testid="cart-item-counter"]').contains('2').should('be.visible');

      cy.get('button svg.lucide-minus-circle').click();
      cy.get('[data-testid="cart-item-counter"]').contains('1').should('be.visible');
    });

    it('should not decrease quantity below 1', () => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();
      cy.contains('button', 'Add to Cart').click();
      cy.get('.lucide-shopping-cart').click();

      cy.get('[data-testid="cart-item-counter"]').contains('1');
      cy.get('button svg.lucide-minus-circle').click();
      cy.get('[data-testid="cart-item-counter"]').contains('1').should('be.visible');
    });

    it('should persist cart contents after page refresh', () => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();
      cy.contains('button', 'Add to Cart').click();

      cy.reload();
      cy.get('.lucide-shopping-cart').click();
      cy.get('[data-testid="cart-item"]').contains('😊').should('be.visible');
    });

    it('should display the correct total amount in the cart', () => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();

      cy.get('[data-testid="emoji-price"]')
        .invoke('text')
        .then((priceText) => {
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          cy.contains('button', 'Add to Cart').click();
          cy.get('.lucide-shopping-cart').click();

          cy.get('[data-testid="cart-total"]')
            .should('contain', price.toFixed(2));
        });
    });

    it('should navigate to checkout when clicking the checkout button', () => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();
      cy.contains('button', 'Add to Cart').click();
      cy.get('.lucide-shopping-cart').click();
      cy.contains('button', 'Checkout').click();
      cy.url().should('include', '/checkout');
    });
  });

  // ─────────────────────────────────────────────
  // CHECKOUT
  // ─────────────────────────────────────────────
  describe('Checkout', () => {
    beforeEach(() => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();
      cy.contains('button', 'Add to Cart').click();
      cy.get('.lucide-shopping-cart').click();
      cy.contains('button', 'Checkout').click();
    });

    it('should display the total amount on the checkout page', () => {
      cy.get('[data-testid="checkout-total"]').should('be.visible').and('not.be.empty');
    });

    it('should fill in all checkout fields and complete the purchase', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="fullName"]').type('John Doe');
      cy.get('input[name="streetAddress"]').type('123 Main St');
      cy.get('input[name="city"]').type('Springfield');
      cy.get('input[name="country"]').type('Brazil');
      cy.get('input[name="cardNumber"]').type('4111111111111111');
      cy.get('input[name="expiryDate"]').type('12/28');
      cy.get('input[name="cvv"]').type('123');

      cy.contains('button', 'Complete Purchase').click();
      cy.url().should('include', '/thank-you');
    });

    it('should show a validation error for an invalid email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.contains('button', 'Complete Purchase').click();
      cy.get('[data-testid="email-error"]').should('be.visible');
    });

    it('should not submit the form when required fields are empty', () => {
      cy.contains('button', 'Complete Purchase').click();
      cy.url().should('include', '/checkout');
      cy.get('[data-testid="form-error"]').should('be.visible');
    });

    it('should navigate back to the store when clicking "Back to store"', () => {
      cy.contains('button', 'Back to store').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  // ─────────────────────────────────────────────
  // THANK YOU PAGE
  // ─────────────────────────────────────────────
  describe('Thank You Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="emoji-card"]').contains('😊').click();
      cy.contains('button', 'Add to Cart').click();
      cy.get('.lucide-shopping-cart').click();
      cy.contains('button', 'Checkout').click();

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="fullName"]').type('John Doe');
      cy.get('input[name="streetAddress"]').type('123 Main St');
      cy.get('input[name="city"]').type('Springfield');
      cy.get('input[name="country"]').type('Brazil');
      cy.get('input[name="cardNumber"]').type('4111111111111111');
      cy.get('input[name="expiryDate"]').type('12/28');
      cy.get('input[name="cvv"]').type('123');

      cy.contains('button', 'Complete Purchase').click();
    });

    it('should display the thank you heading', () => {
      cy.get('h1').contains('Thank You for Your Purchase!').should('be.visible');
    });

    it('should display the confirmation paragraph', () => {
      cy.contains(
        "Your order has been successfully placed. We've sent a confirmation email with your order details."
      ).should('be.visible');
    });

    it('should display a unique order number', () => {
      cy.get('[data-testid="order-number"]').should('be.visible').and('not.be.empty');
    });

    it('should navigate back to the store when clicking "Back to Store"', () => {
      cy.contains('button', 'Back to Store').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-testid="emoji-card"]').should('have.length', 6);
    });
  });
});