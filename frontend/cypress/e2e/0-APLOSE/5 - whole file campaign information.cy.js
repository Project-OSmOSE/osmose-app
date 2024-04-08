import {CAMPAIGNS_DATA} from "../../globals/campaign";
import {Usage} from "@/types/annotations";

const Campaign = CAMPAIGNS_DATA[Usage.create]

describe('Whole file campaign information', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
    })

    describe('should be as created', () => {
        it('name', () => {
            cy.get(".campaign-card").should('include.text', Campaign.name)
        })

        it('description', () => {
            cy.contains(Campaign.name).parent().parent().contains("Manage").click()
            cy.contains('Description')
                .parentsUntil('div').parent().parent()
                .should('include.text', Campaign.description)
        })

        it('dataset', () => {
            cy.contains(Campaign.name).parent().parent().contains("Annotate").click()
            cy.get("tbody").should('include.text', Campaign.dataset.name);
        })

        it('spectro', () => {
            cy.contains(Campaign.name).parent().parent().contains("Annotate").click()
            cy.contains('Task link').click()
            const config = Campaign.dataset.spectrogramConfigurations[0]
            cy.get('select').should('include.text', `nfft: ${config.nfft} / winsize: ${config.winsize} / overlap: ${config.overlap}`)
        })

        it('label set', () => {
            cy.contains(Campaign.name).parent().parent().contains("Manage").click()
            cy.contains('Label set')
                .parent().should('include.text', Campaign.labelSet.name)
        })

        it('confidence set', () => {
            cy.contains(Campaign.name).parent().parent().contains("Manage").click()
            cy.contains('Confidence indicator set', {matchCase: false})
                .parent().should('include.text', Campaign.confidenceSet.name)
        })

        describe('annotation mode', () => {
            it('Create annotations', () => {
                cy.contains(Campaign.name).parent().parent().contains("Annotate").click()
                cy.contains('Task link').click()
                cy.get('.card').should('include.text', 'Presence / Absence');
            })

            it('Check annotations', () => {
                cy.contains(Campaign.name).parent().parent().contains("Annotate").click()
                cy.contains('Task link').click()
                cy.get('.card').should('not.include.text', 'Presence / Absence');
            })
        })

        it('has 3 annotators', () => {
            cy.contains(Campaign.name).parent().parent().contains("Manage").click()

            cy.get("tbody").within(() => {
                cy.get('tr').should('have.length', Campaign.annotators.length)
            })

            for (let user of Campaign.annotators) {
                cy.get('tr').should('include.text', user.email)
            }
        })
    })
})
