/* eslint-disable no-undef */

describe('Automate > Customization > Service Dialogs > Add Dialog > TextBox Tests', () => {
  beforeEach(() => {
    cy.navigateToAddDialog();
    cy.dragAndDropComponent('Text Box');
  });

  it('should verify default properties of the textbox', () => {
    // Verify the textbox exists
    cy.get('.dynamic-form-field')
      .should('exist');
    // Verify the textbox has default label "Text Box"
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Text Box');
    // Verify the textbox has a placeholder
    cy.get('.dynamic-form-field .bx--text-input')
      .should('have.attr', 'placeholder', 'Default value');
    // Verify the textbox is not read-only by default
    cy.get('.dynamic-form-field .bx--text-input')
      .should('not.have.attr', 'readonly');
  });

  it('should have edit and remove buttons', () => {
    // Force display of the action buttons and check they exist
    cy.get('.dynamic-form-field')
      .find('.dynamic-form-field-actions')
      .invoke('attr', 'style', 'display: flex !important');
    
    // Verify the edit button exists
    cy.get('.dynamic-form-field-actions button')
      .first()
      .should('have.attr', 'title', 'Edit field')
      .find('svg')
      .should('exist');
    
    // Verify the remove button exists
    cy.get('.dynamic-form-field-actions button')
      .last()
      .should('have.attr', 'title', 'Remove field')
      .find('svg')
      .should('exist');
  });

  it('should open the modal when clicking the edit button', () => {
    cy.openFieldEditModal(0, 0, 0);
    
    // Verify the modal title
    cy.get('.edit-field-modal .bx--modal-header__heading')
      .should('contain', 'Edit this Text Box');
    
    cy.closeFieldEditModal()
  });

  it('should have 3 tabs in the edit modal initially', () => {
    cy.openFieldEditModal(0, 0, 0);
    
    // Verify there are 3 tabs in the modal
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist]')
      .find('li')
      .should('have.length', 3);
    
    // Verify the tab names
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist]')
      .eq(0)
      .should('contain', 'Field Information');
    
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .should('contain', 'Options');
    
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(2)
      .should('contain', 'Advanced');
    
    cy.closeFieldEditModal();
  });

  it('should add a fourth tab when dynamic option is enabled', () => {
    cy.openFieldEditModal(0, 0, 0);
    
    // Enable dynamic option
    cy.get('.edit-field-modal input[name="dynamic"]')
      .check({ force: true });
    
    // Verify there are now 4 tabs in the modal
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist]')
      .find('li')
      .should('have.length', 4);
    
    // Verify the fourth tab name
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(3)
      .should('contain', 'Overridable Options');
    
    cy.closeFieldEditModal();
  });

  it('should disable save button when label or name is not entered', () => {
    cy.openFieldEditModal(0, 0, 0);
    // Find the submit button and scroll it into view - should be disabled initially
    cy.get('.edit-field-modal button[type="submit"]')
      .scrollIntoView()
      .should('be.visible')
      .should('be.disabled');
    // Click on Options tab to make some changes
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();
    // Make a change to the default value field to trigger form changes
    cy.get('.edit-field-modal input[name="value"]')
      .clear()
      .type('Test Value');
    // Save button should be enabled now because we have modified a field
    cy.get('.edit-field-modal button[type="submit"]')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.disabled');
    // Go back to Field Information tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(0)
      .click();
    // Clear the label field and verify save button is disabled
    cy.get('.edit-field-modal input[name="label"]')
      .clear();
    cy.get('.edit-field-modal button[type="submit"]')
      .scrollIntoView()
      .should('be.visible')
      .should('be.disabled');
    // Add label back and verify that save button is enabled
    cy.get('.edit-field-modal input[name="label"]')
      .type('Modified Label');
    cy.get('.edit-field-modal button[type="submit"]')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.disabled');
    // Clear the name field and verify save button is disabled
    cy.get('.edit-field-modal input[name="name"]')
      .clear();
    cy.get('.edit-field-modal button[type="submit"]')
      .scrollIntoView()
      .should('be.visible')
      .should('be.disabled');
    cy.closeFieldEditModal();
  });

  // Test to check fields in Field Information tab
  it('should verify fields in Field Information tab', () => {
    cy.openFieldEditModal(0, 0, 0);
    // Verify Field Information tab is selected by default
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(0)
      .should('have.class', 'bx--tabs__nav-item--selected');
    // Verify Label field exists and is a text input
    cy.get('.edit-field-modal input[name="label"]')
      .should('exist')
      .should('have.attr', 'type', 'text');
    // Verify Name field exists and is a text input
    cy.get('.edit-field-modal input[name="name"]')
      .should('exist')
      .should('have.attr', 'type', 'text');
    // Verify Dynamic checkbox exists
    cy.get('.edit-field-modal input[name="dynamic"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    cy.closeFieldEditModal();
  });

  // Test to check fields in Options tab when dynamic is off
  it('should verify fields in Options tab when dynamic is off', () => {
    cy.openFieldEditModal(0, 0, 0);
    // Click on Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();
    // Verify Default Value field exists and is a text input
    cy.get('.edit-field-modal input[name="value"]')
      .should('exist')
      .should('have.attr', 'type', 'text');
    // Verify Protected switch exists
    cy.get('.edit-field-modal input[name="protected"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Required switch exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Read Only switch exists
    cy.get('.edit-field-modal input[name="readOnly"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Visible switch exists
    cy.get('.edit-field-modal input[name="visible"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Value Type dropdown exists
    cy.get('.edit-field-modal select[name="dataType"]')
      .should('exist');
    // Verify Validation switch exists
    cy.get('.edit-field-modal input[name="validation"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    cy.get('.edit-field-modal select[name="fieldsToRefresh"]')
      .should('exist');
    cy.closeFieldEditModal();
  });

  // Test to check fields in Options tab when dynamic is on
  it('should verify fields in Options tab when dynamic is on', () => {
    cy.openFieldEditModal(0, 0, 0);
    // Enable dynamic option
    cy.get('.edit-field-modal input[name="dynamic"]')
      .check({ force: true });
    // Click on Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();
    // Verify Entry Point field exists
    cy.get('.edit-field-modal input[id="automateEntryPoint"')
      .should('exist');
    // Verify Show Refresh checkbox exists
    cy.get('.edit-field-modal input[name="showRefresh"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Load Values on Init checkbox exists
    cy.get('.edit-field-modal input[name="loadOnInit"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Required checkbox exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    // Verify Protected checkbox exists
    cy.get('.edit-field-modal input[name="protected"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');
    cy.closeFieldEditModal();
  });
});
