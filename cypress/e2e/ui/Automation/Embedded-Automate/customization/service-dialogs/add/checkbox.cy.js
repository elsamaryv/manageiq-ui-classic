/* eslint-disable no-undef */

describe('Automate > Customization > Service Dialogs > Add Dialog > Add TextArea', () => {
  beforeEach(() => {
    cy.navigateToAddDialog();
  });

  it('should add a check box component to the dialog', () => {
    // Find the Check Box component in the component list
    cy.get('.components-list-wrapper .component-item-wrapper')
      .contains('Check Box')
      .as('checkBoxComponent');
    
    // Find the target section
    cy.get('.dynamic-section')
      .first()
      .as('targetSection');
    
    // Perform drag and drop operation
    cy.get('@checkBoxComponent')
      .trigger('dragstart');
    
    cy.get('@targetSection')
      .trigger('dragover')
      .trigger('drop');
    
    // Verify the component was added to the section
    cy.get('@targetSection')
      .find('.dynamic-form-field-wrapper')
      .should('exist');
  });
});