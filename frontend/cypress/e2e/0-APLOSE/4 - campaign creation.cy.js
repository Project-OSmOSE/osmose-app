describe('create campaign', () => {
    beforeEach(() => {
        cy.login("admin", "osmose29")
        cy.contains('New annotation campaign', {matchCase: false}).click()
    })

    it('cannot submit empty form', () => {
        cy.get('input[type=submit]').click(); // cy.contains('submit', {matchCase: false}).click()
        cy.get('.error-message')
            .should('include.text', 'field')
            .should('include.text', 'required')
    })
})