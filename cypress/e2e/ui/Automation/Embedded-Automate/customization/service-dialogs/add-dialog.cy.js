/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Customization > Service Dialogs', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Customization');

    cy.closeNotificationsIfVisible();
    cy.closeErrorPopupIfVisible();

    // Select Service Dialogs for configuration
    cy.accordion('Service Dialogs');
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
    describe('Tabs', () => {
      it.only('performs tab lifecycle actions', () => {
        cy.get('#dynamic-tabs ul[role="tablist"]')
          .within(() => {
            cy.get('li').should('have.length', 2);
            cy.get('li').first().find('button').invoke('text').should('eq', 'New Tab');
            cy.get('li').last().find('button').invoke('text').should('eq', 'Create Tab');
          });

        // Add tab
        cy.addTab();
        cy.get('#dynamic-tabs ul li').should('have.length', 3);
        cy.get('#dynamic-tabs ul li').eq(1).find('button').should('have.text', 'New Tab 1');

        // Delete a tab
        cy.deleteTab(1);
        cy.get('#dynamic-tabs ul li').should('have.length', 2);

        // Edit tab
        cy.clickTab(0);
        cy.openTabMenu(0);
        cy.openEditTabModal();
        cy.editTabAndSubmit('New Tab', 'T1', 'T1 desc');
        cy.get('#dynamic-tabs ul li').eq(0).find('button').should('have.text', 'T1');
        cy.get('.dynamic-tab-name h2').should('have.text', 'T1');

        // Cancel edit
        cy.openTabMenu(0);
        cy.openEditTabModal();
        cy.editTabAndCancel('T1 edited');
        cy.get('#dynamic-tabs ul li').eq(0).find('button').should('have.text', 'T1');

        // Reorder tab - drag downwards
        // Reorder tab - drag upwards
      });
    });

    // Sections
    describe('Sections', () => {
      it('tests complete lifecycle of a dynamic section in first tab', () => {
        cy.get('.dynamic-tabs-wrapper')
          .find('div[role="tabpanel"]').should('exist')
          .find('.dynamic-sections-wrapper #dynamic-tab-0-section-0')
          .find('.dynamic-section-title').should('have.text', 'New Section');

        // Checks text on the action buttons
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-actions')
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

        // Checks for the message inside empty section
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-contents')
          .invoke('text')
          .should('eq', 'Drag items here to add to the dialog. At least one item is required before saving');

        // Collapse a section
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-actions')
          .find('button[title="Minimize"]').click()
          .then(() => {
            cy.get('#dynamic-tab-0-section-0 .dynamic-section-contents').should('not.exist');
          });
        // Expand again
        cy.get('button[title="Maximize"]').click()
          .then(() => {
            cy.get('#dynamic-tab-0-section-0 .dynamic-section-contents').should('exist');
          });

        // Delete a section
        cy.deleteSection(0, 0)
          .then(() => {
            cy.get('#dynamic-tab-0-section-0').should('not.exist');
          });

        // Add a section
        cy.addSection()
          .then(() => {
            cy.get('.dynamic-tabs-wrapper')
              .find('.dynamic-sections-wrapper #dynamic-tab-0-section-0')
              .find('.dynamic-section-title').should('have.text', 'New Section');
          });

        // Section edit form
        cy.openEditSectionModal(0, 0)
          .then(() => {
            cy.submitEditSection('New Section', 'S1', 'S1 desc')
            cy.get('#dynamic-tab-0-section-0')
              .find('.dynamic-section-title').should('have.text', 'S1');
          });
        cy.openEditSectionModal(0, 0)
          .then(() => {
            cy.cancelEditSection('S1 edited')
              .then(() => {
                cy.get('#dynamic-tab-0-section-0')
                  .find('.dynamic-section-title')
                  .should('not.have.text', 'S1 edited')
                  .should('have.text', 'S1');
              });
          });

        // TODO:: Reorder section - drag downwards
        // TODO:: Reorder section - drag upwards
      });
    });
  });
});

