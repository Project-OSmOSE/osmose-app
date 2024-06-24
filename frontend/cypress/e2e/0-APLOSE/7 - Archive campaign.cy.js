import {DEFAULT_CAMPAIGN_NAME} from "../../globals/campaign";


describe('Archive campaign', () => {

    describe('Non admin', () => {
        beforeEach(() => {
            cy.session_login('TestUser1', 'osmose29')
        })

        it('Can\'t archive', () => {
            cy.contains(DEFAULT_CAMPAIGN_NAME).parent().parent().contains('Manage').click()
            cy.get("#content").should('not.include.text', 'Archive');
        })

        it('Can\'t see archived campaigns', () => {
            cy.get("#content").should('not.include.text', 'Show archive');
        })
    })

    describe('Non admin', () => {
        beforeEach(() => {
            cy.session_login('admin', 'osmose29')
        })

        it('Can archive', () => {
            cy.contains(DEFAULT_CAMPAIGN_NAME).parent().parent().contains('Manage').click()
            cy.get("#content").contains('Archive').click()
            cy.get("ion-alert button").contains('Archive').click()
        })

        it('Can see archived campaigns', () => {
            cy.get("#content").should('include.text', 'Show archive');
        })

        it('Is archived', () => {
            cy.get("#content").contains('Show archive').click();
            cy.contains(DEFAULT_CAMPAIGN_NAME).parent().parent().contains('Info').click()
            cy.get("#content").should('include.text', `Archived on ${new Date().toLocaleDateString()} by admin`);
        })
    })
})
