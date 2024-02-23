describe('create campaign', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
        cy.contains('New annotation campaign', {matchCase: false}).click()
    })

    it('cannot submit empty form', () => {
        cy.contains('Create campaign').click(); // cy.contains('submit', {matchCase: false}).click()
        cy.get('.error-message')
            .should('include.text', 'field')
            .should('include.text', 'required')
    })
})
