/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Explorer', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Automation', 'Embedded Automate', 'Explorer');
    cy.get('#explorer_title_text');
  });

  afterEach(() => {
    // Remove Domain
    cy.get('[title="Datastore"]').click({force: true});
    cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
    cy.get('[title="Configuration"]').click({force: true});
    cy.get('[title="Remove this Domain"]').click({force: true});

    cy.get('.bx--data-table-content tbody tr').should('not.contain', 'Automate Domain: TestDomain');
  });

  describe('Class Form', () => {

    it('Creates a Domain', () => {
      // creates Domain
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Domain"]').click({force: true});
      cy.get('[name="name"]').type('TestDomain');
      cy.get('[name="description"]').type('This is a test domain');
      cy.get('#enabled').check();
      cy.get('[class="bx--btn bx--btn--primary"]').contains('Add').click({force: true});

      // // check correct data is displaying
      // cy.get('.bx--data-table-content tbody tr')
      // .last()
      // .should('contain', 'Automate Domain: TestDomain');
      // // .and('contain', 'This is a test domain');

      // creates Namespace
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Namespace"]').click({force: true});
      cy.get('[name="name"]').type('TestNS');
      cy.get('[name="description"]').type('This is a test NS');
      cy.get('.bx--btn--primary')
        .contains('Add')
        // .should('be.visible')
        .click();
      
      // // check correct data is displaying
      // cy.get('.bx--data-table-content tbody tr')
      //   .last()
      //   .should('contain', 'Automate Namespace: TestNS');
      //   // .and('contain', 'This is a test NS');

      // creates Class
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
      cy.get('[title="Automate Namespace: TestNS"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Class"]').click({force: true});
      cy.get('[name="name"]').type('TestClass');
      cy.get('[name="display_name"]').type('TC');
      cy.get('[name="description"').type('This is a test class desc');
      cy.get('.bx--btn--primary')
        .contains('Add')
        // .should('be.visible')
        .click();
      
      // // check correct data is displaying
      // cy.get('.bx--data-table-content tbody tr')
      // .last()
      // .should('contain', 'TestClass')
      // .and('contain', 'TC')
      // .and('contain', 'This is a test class desc');

      // edits a class
      cy.get('[title="Automate Class: TC (TestClass)"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Edit this Class"]').click({force: true});
      cy.get('[name="display_name"]').clear({force: true});
      // cy.get('[name="display_name"]').clear({force: true}); // need to clear twice
      cy.get('[name="display_name"]').type('Edited TC', {force: true});
      cy.get('[name="description"').clear({force: true});
      cy.get('[name="description"').type('Edited Test Class Description');
      cy.get('[class="btnRight bx--btn bx--btn--primary"]').contains('Save').click({force: true});

      // check it updated
      // Navigate to the Properties tab
      cy.get('#props_tab a').click();

      cy.get('div.label_header:contains("Name")')
            .siblings('.content_value')
            .should('contain', 'TestClass');
      cy.get('div.label_header:contains("Display Name")')
          .siblings('.content_value')
          .should('contain', 'Edited TC');
      cy.get('div.label_header:contains("Description")')
          .siblings('.content_value')
          .should('contain', 'Edited Test Class Description');

      // Clicks the cancel button during class create
      cy.get('[title="Datastore"]').click({force: true});
      cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
      cy.get('[title="Automate Namespace: TestNS"]').click({force: true});
      cy.get('[title="Configuration"]').click({force: true});
      cy.get('[title="Add a New Class"]').click({force: true});

      cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});
      cy.get('[id="explorer_title_text"]').contains('Automate Namespace "TestNS"');

      // // Remove class
      // cy.get('[title="Datastore"]').click({force: true});
      // cy.get('[title="Automate Domain: TestDomain"]').click({force: true});
      // cy.get('[title="Configuration"]').click({force: true});
      // cy.get('[title="Remove this Domain"]').click({force: true});

      // cy.get('.bx--data-table-content tbody tr').should('not.contain', 'Automate Domain: TestDomain');
    });

    // creates Namespace
    // it('Creates a Namespace', () => {
      
    // });

    // it('Clicks the cancel button', () => {
    //   cy.get('[title="TestNS"]').click({force: true});
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Add a New Class"]').click({force: true});
    //   cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});
    //   cy.get('[id="explorer_title_text"]').contains('Automate Namespace "TestNS"');
    // });

    // creates Class
    // it('Creates a Class', () => {
      
      
    // });

    // // edits a class
    // cy.get('[title="Automate Class: Test class (C1)"]').click({force: true});
    // cy.get('[title="Configuration"]').click({force: true});
    // cy.get('[title="Edit this Class"]').click({force: true});
    // cy.get('[name="display_name"]').clear({force: true});
    // // cy.get('[name="display_name"]').clear({force: true}); // need to clear twice
    // cy.get('[name="display_name"]').type('Edited Test Class', {force: true});
    // cy.get('[name="description"').clear({force: true});
    // cy.get('[name="description"').type('Edited Test Description');
    // cy.get('[class="btnRight bx--btn bx--btn--secondary"]').contains('Reset').click({force: true});

    // // check it was reset
    // cy.get('[name="name"]').should('have.value', 'C2');
    // cy.get('[name="display_name"]').should('have.value', 'Test Class');
    // cy.get('[name="description"]').should('have.value', 'Test Description');
    // cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});

    // it('Clicks on a sample Class', () => {
    //   cy.get('[title="Automate Class: Test class (C1)"]').click({force: true});
    //   cy.get('[id="props_tab"]').click({force: true});
    //   cy.get('.content_value object_item bx--structured-list-td').contains('/ ZiraatTeknoloji / DropDowns / VMware / C1');
    // });

    // it('Resets a class being edited', () => {
    //   // creates a class
    //   cy.get('[title="Automate Namespace: VMware"]').click({force: true});
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Add a New Class"]').click({force: true});
    //   cy.get('[name="name"]').type('C2');
    //   cy.get('[name="display_name"]').type('Test Class');
    //   cy.get('[name="description"').type('Test Description');
    //   cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});

    //   // check correct data is displaying
    //   cy.get('.bx--data-table-content tbody tr')
    //   .last()
    //   .should('contain', 'C2')
    //   .and('contain', 'Test Class')
    //   .and('contain', 'Test Description');

    //   // edits a class
    //   cy.get('[title="Automate Class: Test class (C1)"]').click({force: true});
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Edit this Class"]').click({force: true});
    //   cy.get('[name="display_name"]').clear({force: true});
    //   // cy.get('[name="display_name"]').clear({force: true}); // need to clear twice
    //   cy.get('[name="display_name"]').type('Edited Test Class', {force: true});
    //   cy.get('[name="description"').clear({force: true});
    //   cy.get('[name="description"').type('Edited Test Description');
    //   cy.get('[class="btnRight bx--btn bx--btn--secondary"]').contains('Reset').click({force: true});

    //   // check it was reset
    //   cy.get('[name="name"]').should('have.value', 'C2');
    //   cy.get('[name="display_name"]').should('have.value', 'Test Class');
    //   cy.get('[name="description"]').should('have.value', 'Test Description');
    //   cy.get('[class="bx--btn bx--btn--secondary"]').contains('Cancel').click({force: true});

    //   // Remove class
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Remove this Class"]').click({force: true});
    //   cy.get('.bx--data-table-content tbody tr')
    //   .last()
    //   .should('not.contain', 'C2')
    //   .and('not.contain', 'Test Class')
    //   .and('not.contain', 'Test Description');
    // });

    // it('Creates, edits, deletes a dialog', () => {
    //   // creates a dialog
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Add a new Dialog"]').click({force: true});
    //   cy.get('[name="name"]').type('Test User');
    //   cy.get('[name="description"').type('Test Description');
    //   cy.get('[name="dialog_type"]').select('Configured System Provision');
    //   cy.get('[class="CodeMirror-lines"]').type(':Buttons:');
    //   cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});

    //   // check correct data is displaying
    //   // cy.get('[id="main_div"]').contains('Test Description');
    //   cy.contains('Test Description').click({force: true});
    //   cy.get('.miq_ae_customization_summary').contains('Test User');
    //   cy.get('.miq_ae_customization_summary').contains('Test Description');
    //   cy.get('[class="CodeMirror-code"]').contains('---');
    //   cy.get('[class="CodeMirror-code"]').contains(':Buttons:');

    //   // edits a dialog
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Edit this Dialog"]').click({force: true});
    //   cy.get('[name="name"]').clear({force: true});
    //   cy.get('[name="name"]').clear({force: true}); // need to clear twice
    //   cy.get('[name="name"]').type('Edited Test User', {force: true});
    //   cy.get('[name="description"').clear({force: true});
    //   cy.get('[name="description"').type('Edited Test Description');
    //   cy.get('[name="dialog_type"]').select('Physical Server Provision');
    //   cy.get('[class="CodeMirror-lines"]').type('\n :submit:\n:cancel:');
    //   cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
    //   cy.get('[class="col-md-12"]').contains('Edited Test Description');

    //   // check correct data after editing
    //   cy.contains('Edited Test Description').click({force: true});
    //   cy.get('.miq_ae_customization_summary').contains('Edited Test User');
    //   cy.get('.miq_ae_customization_summary').contains('Edited Test Description');
    //   cy.get('[class="CodeMirror-code"]').contains('---');
    //   cy.get('[class="CodeMirror-code"]').contains(':Buttons:');
    //   cy.get('[class="CodeMirror-code"]').contains(':submit:');
    //   cy.get('[class="CodeMirror-code"]').contains(':cancel:');

    //   // check correct data after copying
    //   cy.contains('Edited Test Description').click({force: true});
    //   cy.get('.miq_ae_customization_summary').contains('Edited Test Description');
    //   cy.get('[class="CodeMirror-code"]').contains('---');
    //   cy.get('[class="CodeMirror-code"]').contains(':Buttons:');
    //   cy.get('[class="CodeMirror-code"]').contains(':submit:');
    //   cy.get('[class="CodeMirror-code"]').contains(':cancel:');

    //   cy.contains('Edited Test Description').click({force: true});
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Remove this Dialog"]').click({force: true});

    //   cy.get('[class="list-group"]').should('not.contain', 'Test Description');
    // });

    // it('Creates, copies, and deletes a dialog', () => {
    //   // creates a dialog
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Add a new Dialog"]').click({force: true});
    //   cy.get('[name="name"]').type('Test User');
    //   cy.get('[name="description"').type('Test Description');
    //   cy.get('[name="dialog_type"]').select('Configured System Provision');
    //   cy.get('[class="CodeMirror-lines"]').type(':Buttons:');
    //   cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
    //   cy.get('[class="col-md-12"]').contains('Test Description');

    //   // check correct data is displaying
    //   cy.contains('Test Description').click({force: true});
    //   cy.get('.miq_ae_customization_summary').contains('Test User');
    //   cy.get('.miq_ae_customization_summary').contains('Test Description');
    //   cy.get('[class="CodeMirror-code"]').contains('---');
    //   cy.get('[class="CodeMirror-code"]').contains(':Buttons:');

    //   // copies a dialog
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Copy this Dialog"]').click({force: true});
    //   cy.get('[class="btnRight bx--btn bx--btn--primary"]').click({force: true});
    //   cy.get('[class="col-md-12"]').contains('Test Description');

    //   cy.contains('Test Description').click({force: true});

    //   // clean up
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Remove this Dialog"]').click({force: true});

    //   cy.get('[id="explorer_title_text"]').contains('Configured System Provision Dialogs');
    //   cy.get('[class="list-group"]').contains('Test Description').should('be.visible').click({force: true});
    //   cy.get('[id="main_div"]').contains('Copy of Test User');
    //   cy.get('[id="main_div"]').contains('Test Description');
    //   cy.get('[class="CodeMirror-code"]').contains('---');
    //   cy.get('[title="Configuration"]').click({force: true});
    //   cy.get('[title="Remove this Dialog"]').click({force: true});

    //   cy.get('[class="list-group"]').should('not.contain', 'Test Description');
    // });
  });
});
