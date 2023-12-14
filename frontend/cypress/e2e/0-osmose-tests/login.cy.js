describe('login page', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:3000/')
  })

  it('logs in with right credentials', () => {
    cy.get("#loginInput").click();
    cy.get("#loginInput").type("admin");
    cy.get("#passwordInput").click();
    cy.get("#passwordInput").type("osmose29");
    cy.get("form > input").click();
    cy.get("h1").should('have.text', 'APLOSEDatasets')
  })
})
