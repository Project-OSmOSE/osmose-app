describe('login page', () => {
  beforeEach(() => {
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
