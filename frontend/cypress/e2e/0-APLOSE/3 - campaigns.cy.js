import {DEFAULT_CAMPAIGN_NAME} from "../../globals/campaign";

describe('campaigns page', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
    })

    it('displays 4 open campaigns by default', () => {
        cy.get('.campaign-card').should('have.length', 4)
    })

    it('displays 1 archived campaigns', () => {
        cy.contains("Show archived").click()
        cy.get('.campaign-card').should('have.length', 1)
    })

    it('Has guide link', () => {
        cy.contains('User guide')
    })

    it('Allows campaign creation', () => {
        cy.contains('New annotation campaign')
    })

    it('Can search campaign', () => {
        cy.get('ion-searchbar').type(DEFAULT_CAMPAIGN_NAME)
        cy.get('#campaign-card').should('include.text', DEFAULT_CAMPAIGN_NAME)
    })
})
