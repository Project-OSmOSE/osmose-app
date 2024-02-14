describe('campaigns page', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
    })

    it('displays 5 campaigns by default', () => {
        cy.get('tr').should('have.length', 6) // Includes table head
    })

    it('open guide', () => {
        cy.contains('Annotator user guide', {matchCase: false})
            .should('have.attr', 'target', '_blank')
    })
})
