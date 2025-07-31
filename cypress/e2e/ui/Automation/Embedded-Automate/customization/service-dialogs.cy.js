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

    // Tabs
    it('Ensure 2 tabs are seen initially where one indicates - create a new tab', () => {
      cy.get('#dynamic-tabs')
        .find('ul[role="tablist"]').should('exist')
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

    // Sections
    it.only('Ensure first tab has a section with 3 action buttons', () => {
      cy.get('.dynamic-tabs-wrapper')
        .find('div[role="tabpanel"]').should('exist')
        .find('.dynamic-sections-wrapper .dynamic-section')
        .should('have.attr', 'id', 'dynamic-tab-0-section-0')
        .find('.dynamic-section-title').should('have.text', 'New Section');

      // checks text on the action buttons
      cy.get('.dynamic-section .dynamic-section-actions')
        .within(() => {
          cy.get('button').should('have.length', 3)
            .each(($el) => {
              cy.wrap($el)
                .invoke('attr', 'title')
                .then((text) => {
                  expect(['Minimize', 'Edit section', 'Remove section']).to.include(text.trim());
                });
            });
        });

      // checks for the message inside empty section
      cy.get('.dynamic-section .dynamic-section-contents')
        .invoke('text')
        .should('eq', 'Drag items here to add to the dialog. At least one item is required before saving');

      // collapse a section
      cy.get('.dynamic-section-actions')
        .find('button[title="Minimize"]').click()
        .then(() => {
          cy.get('.dynamic-section-contents').should('not.exist');
        });
      // Expand again
      cy.get('button[title="Maximize"]').click()
        .then(() => {
          cy.get('.dynamic-section-contents').should('exist');
        });
    });
  });
});

