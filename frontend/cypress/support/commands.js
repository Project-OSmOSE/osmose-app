// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (username, password) => {
  cy.visit(Cypress.env('aploseURL'))
  cy.contains('login', {matchCase: false}).click();
  cy.get("#loginInput").type(username);
  cy.get("#passwordInput").type(password);
  cy.contains("Submit").click()
})

// https://docs.cypress.io/api/commands/session#Updating-an-existing-login-helper-function
Cypress.Commands.add('session_login', (username, password) => {
  cy.session([username, password], () => {
    cy.login(username, password)
  }, {
    // https://www.cypress.io/blog/2023/02/08/mistake-when-using-cy-session-and-how-to-solve-it
    validate() {
      cy.document().its('cookie').should('contain', 'token')
    }
  })
  cy.visit(Cypress.env('aploseURL'))
  cy.contains('access APLOSE', {matchCase: false}).click();
})
