import {DEFAULT_CAMPAIGN_NAME} from "../../globals/campaign";

describe('campaigns page', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
    })

    it('displays 5 campaigns by default', () => {
        cy.get('tr').should('have.length', 6) // Includes table head
    })

    it('Has guide link', () => {
        cy.contains('Annotator user guide')
    })

    it('Allows campaign creation', () => {
        cy.contains('New annotation campaign')
    })

    it('Can search campaign', () => {
        cy.get('ion-searchbar').type(DEFAULT_CAMPAIGN_NAME)
        cy.get('#content table').should('include.text', DEFAULT_CAMPAIGN_NAME)
    })
})
