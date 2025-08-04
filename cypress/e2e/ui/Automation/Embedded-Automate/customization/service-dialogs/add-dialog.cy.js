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
    describe('Tabs', () => {
      it.only('Ensure 2 tabs are seen initially where one indicates - create a new tab', () => {
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

            // Add a tab
            cy.get('li').last().find('button').contains('Create Tab').click()
              .then(() => {
                cy.get('li').should('have.length', 3);
                cy.get('li').eq(1).find('button').should('have.text', 'New Tab 1');
              });
          });

        // Delete a tab
        cy.get('.dynamic-tab-name').find('#tab-menu-1').click()
          .then(() => {
            cy.get('ul[aria-label="Tab options"]')
              .find('li').find('button[aria-label="Remove Tab"]').click();
          });
        cy.get('#dynamic-tabs ul li').should('have.length', 2);

        // Edit a tab
        cy.get('#dynamic-tabs ul li').first().click()
          .then(() => {
            cy.get('.dynamic-sections-wrapper .dynamic-tab-name #tab-menu-0').click()
              .then(() => {
                cy.get('ul[aria-label="Tab options"]')
                  .find('li').find('button[aria-label="Edit Tab"]').click()
                  .then(() => {
                    cy.get('.edit-tab-modal').should('exist')
                      .within(() => {
                        cy.get('.bx--modal-header__heading').should('contain', 'Edit this New Tab');
                        cy.get('input[name="tab_name"]').should('exist');
                        cy.get('textarea[name="tab_description"]').should('exist');
                        cy.get('button[type="submit"]').should('be.disabled');

                        // Edit the tab and submit
                        cy.get('input[name="tab_name"]').clear().type('T1');
                        cy.get('textarea[name="tab_description"]').clear().type('First tab');
                        cy.get('button[type="submit"]').click();
                      });
                    cy.get('#dynamic-tabs ul li').first()
                      .find('button').should('have.text', 'T1');
                    cy.get('.dynamic-tab-name h2').should('have.text', 'T1');
                  });
              });
            // Edit the tab but cancel
            cy.get('#tab-menu-0').click()
              .then(() => {
                cy.get('ul[aria-label="Tab options"]')
                  .find('li').find('button[aria-label="Edit Tab"]').click()
                  .then(() => {
                    cy.get('.edit-tab-modal')
                      .within(() => {
                        cy.get('input[name="tab_name"]').clear().type('T1 edited');
                        cy.get('button').contains('Cancel').click();
                      });
                    cy.get('#dynamic-tabs ul li').first()
                      .find('button').should('not.have.text', 'T1 edited').should('have.text', 'T1');
                    cy.get('.dynamic-tab-name h2').should('have.text', 'T1');
                  });
              });
          });
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
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-actions')
          .find('button[title="Remove section"]').click()
          .then(() => {
            cy.get('#dynamic-tab-0-section-0').should('not.exist');
          });

        // Add a section
        cy.get('.dynamic-sections-wrapper .add-section-button-wrapper')
          .find('.add-section-button').click()
          .then(() => {
            cy.get('.dynamic-tabs-wrapper')
              .find('.dynamic-sections-wrapper #dynamic-tab-0-section-0')
              .find('.dynamic-section-title').should('have.text', 'New Section');
          });

        // Section edit form
        cy.get('#dynamic-tab-0-section-0 .dynamic-section-actions')
          .find('button[title="Edit section"]').click()
          .then(() => {
            cy.get('.edit-section-modal').should('exist')
              .within(() => {
                cy.get('.bx--modal-header__heading').should('contain', 'Edit this New Section');
                cy.get('input[name="section_name"]').should('exist');
                cy.get('textarea[name="section_description"]').should('exist');
                cy.get('button[type="submit"]').should('be.disabled');

                // Edit the section and submit
                cy.get('input[name="section_name"]').clear().type('S1');
                cy.get('textarea[name="section_description"]').clear().type('First section');
                cy.get('button[type="submit"]').click();
              });
            cy.get('#dynamic-tab-0-section-0')
              .find('.dynamic-section-title').should('have.text', 'S1');
          });
        cy.get('button[title="Edit section"]').click()
          .then(() => {
            cy.get('.edit-section-modal')
              .within(() => {
                // Edit the section but cancel
                cy.get('input[name="section_name"]').clear().type('S1 edited');
                cy.get('button').contains('Cancel').click();
              });
            cy.get('#dynamic-tab-0-section-0')
              .find('.dynamic-section-title')
              .should('not.have.text', 'S1 edited')
              .should('have.text', 'S1');
          });

        // TODO:: Reorder section - drag downwards
        // TODO:: Reorder section - drag upwards
      });
    });
  });
});

