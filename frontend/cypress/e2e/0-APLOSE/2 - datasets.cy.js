describe('datasets page', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
        cy.contains('Datasets').click()
    })

    it('displays 5 datasets by default', () => {
        cy.get('tr').should('have.length', 6) // Includes table head
    })

    // This depends on a proper datawork folder setup
    // TODO : make it so there is one on CI
    if(!Cypress.env("CI_ENV")) {
        describe('import', () => {
            beforeEach(() => {
                cy.contains('Import').click()
            })

            it('should have 1 available dataset', () => {
                cy.get('li.checkbox').should('have.length', 2); // Includes "all checkbox"
            })

            it('"test" search should have 0 result', () => {
                cy.get('input[type=search]').type('test')
                cy.get('li.checkbox').should('have.length', 1); // Includes "all checkbox"
            })

            it('"glider" search should have 1 result', () => {
                cy.get('input[type=search]').clear().type('glider')
                cy.get('li.checkbox').should('have.length', 2); // Includes "all checkbox"
            })

            it('cancel should not import', () => {
                cy.contains('glider').click()
                cy.contains('Close').click()
                cy.get('tr').should('have.length', 3) // Includes table head
            })

            it('import should import', () => {
                cy.contains('All').click()
                cy.contains('Save changes').click()
                cy.get('tr').should('have.length', 4) // Includes table head
            })
        })
    }
    
    describe.skip('after import', () => {
        it('after importing all, import should be disabled', () => {
            cy.contains('Import').should('be.disabled')
        })
    })
})
