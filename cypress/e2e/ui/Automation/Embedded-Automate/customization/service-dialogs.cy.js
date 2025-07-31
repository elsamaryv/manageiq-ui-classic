/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Customization > Service Dialogs', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Customization');

    // Look for notification popups and disable them if present
    cy.get('body').then(($body) => {
      const $link = $body.find(
        '.miq-toast-wrapper .row .alert a:contains("Disable notifications")'
      );
      if ($link.length && $link.is(':visible')) {
        cy.wrap($link).click({ force: true });
      }
    });

    // Select Service Dialogs for configuration
    cy.accordion('Service Dialogs');
    // cy.accordionItem('All Dialogs');
    cy.get('#dialogs_accord')
      .find('.list-group .list-group-item').contains('All Dialogs').click();

    cy.toolbar('Configuration', 'Add a new Dialog');
  });

  // General checks on the Service Dialog editor page
  describe('Dialog - editor page', () => {
    it('Should display the editor page properly', () => {
      cy.url().should('include', 'miq_ae_customization/editor');
    });

    it('Ensure there are fields to enter dialog name and description and verify their type', () => {
      cy.get('#dialogName')
        .should('be.visible')
        .should('have.prop', 'tagName').should('eq', 'INPUT');

      cy.get('#dialogDescription')
        .should('be.visible')
        .should('have.prop', 'tagName').should('eq', 'TEXTAREA');
    });

    it('Ensure there is a component list with allowed types', () => {
      const allowedValues = ['Text Box', 'Text Area', 'Check Box', 'Dropdown',
        'Radio Button', 'Datepicker', 'Timepicker', 'Tag Control'];

      cy.get('.component-item').each(($el) => {
        cy.wrap($el)
          .invoke('text')
          .then((text) => {
            expect(allowedValues).to.include(text.trim());
          });
      });
    });

    it('Ensure 2 tabs are seen initially where one indicates - create a new tab', () => {
      cy.get('#dynamic-tabs')
        .find('ul[role = "tablist"]').should('exist')
        .within(() => {
          // Ensure there are exactly 2 <li>
          cy.get('li')
            .should('have.length', 2);
          // First li contains button with text "New Tab"
          cy.get('li').first().find('button').invoke('text').should('eq', 'New Tab');
          // Last li has button with "create"
          cy.get('li').last().find('button').invoke('text').should('eq', 'Create Tab');
        });
    });
  });
});

