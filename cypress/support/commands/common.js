/* eslint-disable no-undef */

// Look for notification popups and disable them if present
Cypress.Commands.add('closeNotificationsIfVisible', () => {
  cy.get('body').then(($body) => {
    const $link = $body.find(
      '.miq-toast-wrapper .row .alert a:contains("Disable notifications")'
    );
    if ($link.length && $link.is(':visible')) {
      cy.wrap($link).click({ force: true });
    }
  });
});

// Look for a server error pop up and close if visible .. TODO:: check if working
Cypress.Commands.add('closeErrorPopupIfVisible', () => {
  cy.get('body').then(($body) => {
    const $popup = $body.find('#errorModal:visible .error-modal-miq .modal-body .error-icon');
    if ($popup.length) {
      cy.wrap($popup).click({ force: true });
    }
    // else: do nothing
  });
});
