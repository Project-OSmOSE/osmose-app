describe('login page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  it('logs in with admin credentials', () => {
    cy.get("#loginInput").click();
    cy.get("#loginInput").type("admin");
    cy.get("#passwordInput").click();
    cy.get("#passwordInput").type("osmose29");
    cy.get("form > input").click();
    cy.get("h1").should('have.text', 'APLOSEDatasets')
  })
})
