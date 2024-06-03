describe('login page', () => {

    it('logs in with admin credentials', () => {
        cy.login('admin', 'osmose29')

        cy.get('h1').eq(1).should('have.text', 'Annotation Campaigns')
    });

    it('logs in with invalid credentials', () => {
        cy.login('admin', 'osmose')

        cy.get('.error-message').should('have.text', 'No active account found with the given credentials')
    });

    it('logs out', () => {
        cy.login('admin', 'osmose29')

        cy.get('h1').eq(1).should('have.text', 'Annotation Campaigns')
        cy.get('button').contains('logout', {matchCase: false}).click();

        cy.get('h1').should('have.text', 'Login')
    })
})
