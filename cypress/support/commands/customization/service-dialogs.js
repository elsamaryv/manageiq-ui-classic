/* eslint-disable no-undef */

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
Cypress.Commands.add('editTabAndSubmit', (currentTabName, newTabName, newTabDescription) => {
  cy.get('.edit-tab-modal').should('exist').within(() => {
    cy.get('.bx--modal-header__heading').should('contain', `Edit this ${currentTabName}`);
    cy.get('input[name="tab_name"]').should('exist');
    cy.get('textarea[name="tab_description"]').should('exist');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('input[name="tab_name"]').clear().type(newTabName);
    cy.get('textarea[name="tab_description"]').clear().type(newTabDescription);
    cy.get('button[type="submit"]').should('not.be.disabled').click();
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

// Submit the section edit modal with name and description
Cypress.Commands.add('submitEditSection', (currentSecName, newSecName, newSecDescription) => {
  cy.get('.edit-section-modal').within(() => {
    cy.get('.bx--modal-header__heading').should('contain', `Edit this ${currentSecName}`);
    cy.get('input[name="section_name"]').should('exist');
    cy.get('textarea[name="section_description"]').should('exist');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('input[name="section_name"]').clear().type(newSecName);
    cy.get('textarea[name="section_description"]').clear().type(newSecDescription);
    cy.get('button[type="submit"]').click();
  });
});

// Cancel the section edit modal after changing the name
Cypress.Commands.add('cancelEditSection', (name) => {
  cy.get('.edit-section-modal').within(() => {
    cy.get('input[name="section_name"]').clear().type(name);
    cy.contains('button', 'Cancel').click();
  });
});
