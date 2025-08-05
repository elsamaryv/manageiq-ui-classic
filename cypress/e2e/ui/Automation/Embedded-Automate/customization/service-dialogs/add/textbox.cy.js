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
});