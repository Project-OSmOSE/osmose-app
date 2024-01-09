describe('campaigns page', () => {
    beforeEach(() => {
        cy.login("admin", "osmose29")
        cy.visit(Cypress.env('aploseURL'))
        cy.contains("Annotation campaigns").click()
    })

    it('displays 2 campaigns by default', () => {
        cy.get('tr').should('have.length', 5) // Includes table head
    })

    it('open guide', () => {
        cy.contains('Annotator user guide', {matchCase: false})
            .should('have.attr', 'target', '_blank')
    })
})