describe('login page', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('aploseURL'))
    });

    it('logs in with admin credentials', () => {
        cy.get("#loginInput").click();
        cy.get("#loginInput").type("admin");
        cy.get("#passwordInput").click();
        cy.get("#passwordInput").type("osmose29");

        cy.contains("Submit").click()

        cy.get("h1").eq(1).should('have.text', 'Annotation Campaigns')
    });

    it('logs in with invalid credentials', () => {
        cy.get("#loginInput").click();
        cy.get("#loginInput").type("admin");
        cy.get("#passwordInput").click();
        cy.get("#passwordInput").type("osmose");

        cy.contains("Submit").click();

        cy.get('.error-message').should('have.text', 'No active account found with the given credentials')
    });
})
