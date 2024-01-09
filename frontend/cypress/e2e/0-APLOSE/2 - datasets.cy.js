describe('datasets page', () => {
    beforeEach(() => {
        cy.login("admin", "osmose29")
        cy.visit(Cypress.env('aploseURL'))
        cy.contains("Datasets").click()
    })

    it('displays 2 datasets by default', () => {
        cy.get('tr').should('have.length', 3) // Includes table head
    })

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
    
    describe('after import', () => {
        it('after importing all, import should be disabled', () => {
            cy.contains('Import').should('be.disabled')
        })
    })
})