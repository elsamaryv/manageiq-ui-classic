/* eslint-disable no-undef */

describe('Automate > Customization > Service Dialogs > Add Dialog > Add TextArea', () => {
  beforeEach(() => {
    cy.navigateToAddDialog();
  });

  it('should add a text area component to the dialog', () => {
    // Find the Text Area component in the component list
    cy.get('.components-list-wrapper .component-item-wrapper')
      .contains('Text Area')
      .as('textAreaComponent');
    
    // Find the target section
    cy.get('.dynamic-section')
      .first()
      .as('targetSection');
    
    // Perform drag and drop operation
    cy.get('@textAreaComponent')
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