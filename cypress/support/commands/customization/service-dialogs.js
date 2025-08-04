/* eslint-disable no-undef */

// Login and navigate to add a new service dialog
Cypress.Commands.add('navigateToAddDialog', () => {
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

// Add a tab
Cypress.Commands.add('addTab', () => {
  cy.get('#dynamic-tabs ul li').last().find('button').contains('Create Tab').click();
});

// Delete a tab by index
Cypress.Commands.add('deleteTab', (index) => {
  cy.get('.dynamic-tab-name').find(`#tab-menu-${index}`).click()
    .then(() => {
      cy.get('ul[aria-label="Tab options"]')
        .find('li').find('button[aria-label="Remove Tab"]').click();
    });
});

// Click the nth tab (default = 0)
Cypress.Commands.add('clickTab', (index = 0) => {
  cy.get('#dynamic-tabs ul li').eq(index).click();
});

// Open tab options by tab index
Cypress.Commands.add('openTabMenu', (index = 0) => {
  cy.get(`.dynamic-sections-wrapper .dynamic-tab-name #tab-menu-${index}`).click();
});

// Open the Edit Tab modal
Cypress.Commands.add('openEditTabModal', () => {
  cy.get('ul[aria-label="Tab options"]')
    .find('li').find('button[aria-label="Edit Tab"]').click();
});

// Edit and submit the changes on tab
Cypress.Commands.add('editTabAndSubmit', (tabName, tabDescription) => {
  cy.get('.edit-tab-modal').within(() => {
    cy.get('input[name="tab_name"]').clear().type(tabName);
    cy.get('textarea[name="tab_description"]').clear().type(tabDescription);
    cy.get('button[type="submit"]').click();
  });
});

// Edit but cancel the changes on tab
Cypress.Commands.add('editTabAndCancel', (tabName) => {
  cy.get('.edit-tab-modal').within(() => {
    cy.get('input[name="tab_name"]').clear().type(tabName);
    cy.get('button').contains('Cancel').click();
  });
});

// Delete a section
Cypress.Commands.add('deleteSection', (tabIndex, secIndex) => {
  cy.get(`#dynamic-tab-${tabIndex}-section-${secIndex} .dynamic-section-actions`)
    .find('button[title="Remove section"]').click();
});

// Add a new section
Cypress.Commands.add('addSection', () => {
  cy.get('.dynamic-sections-wrapper .add-section-button-wrapper')
    .find('.add-section-button').click();
});

// Click the edit button on a section
Cypress.Commands.add('openEditSectionModal', (tabIndex, secIndex) => {
  cy.get(`#dynamic-tab-${tabIndex}-section-${secIndex} .dynamic-section-actions`)
    .find('button[title="Edit section"]').click();
});

// Edit and submit the changes on section
Cypress.Commands.add('editSectionAndSubmit', (secName, secDescription) => {
  cy.get('.edit-section-modal').within(() => {
    cy.get('input[name="section_name"]').clear().type(secName);
    cy.get('textarea[name="section_description"]').clear().type(secDescription);
    cy.get('button[type="submit"]').click();
  });
});

// Edit but cancel the changes on section
Cypress.Commands.add('editSectionAndCancel', (name) => {
  cy.get('.edit-section-modal').within(() => {
    cy.get('input[name="section_name"]').clear().type(name);
    cy.contains('button', 'Cancel').click();
  });
});
