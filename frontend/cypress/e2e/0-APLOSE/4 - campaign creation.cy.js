import {Usage} from "@/types/annotations";
import {CAMPAIGNS_DATA} from "../../globals/campaign";
import {Create} from "@/services/api/annotation-campaign-api.service";


describe('create campaign', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
        cy.contains('New annotation campaign', {matchCase: false}).click()
    })

    it('Create annotations usage', () => {
        const data = CAMPAIGNS_DATA[Usage.create];
        /** @type {Create} */
        const expectedResult = {
            usage: Usage.create,
            name: data.name,
            desc: data.description,
            instructions_url: data.instructionsURL,
            start: data.start + 'T00:00',
            end: data.end + 'T00:00',
            datasets: [data.dataset.id],
            spectro_configs: data.dataset.spectrogramConfigurations.map(c => c.id),
            annotators: data.annotators.map(a => a.id),
            annotation_goal: data.annotators.length,
            annotation_scope: data.annotationScope,
            annotation_set: data.annotationSet.id,
            confidence_indicator_set: data.confidenceSet.id
        }

        // Global info
        cy.contains('Name').parent().type(data.name);
        cy.contains('Description').parent().type(data.description);
        cy.contains('Instruction URL').parent().type(data.instructionsURL);
        cy.contains('Start').parent().type(data.start)
        cy.contains('End').parent().type(data.end)

        // Dataset
        cy.contains('Select a dataset').click();
        cy.get('button').contains(data.dataset.name).click();
        cy.get('ion-alert .alert-button').filter(':visible').contains('OK').click();

        // Annotations
        cy.contains('Select an annotation mode').click();
        cy.get('div.item').contains('Create annotations').click()
        cy.contains('Select an annotation set').click();
        cy.get('button').contains(data.annotationSet.name).click();
        cy.get('ion-alert .alert-button').filter(':visible').contains('OK').click();
        for (const tag of data.annotationSet.tags) {
            cy.contains('Tags:').parent().should('contain', tag)
        }
        cy.contains('Select a confidence set').click();
        cy.get('button').contains(data.confidenceSet.name).click();
        cy.get('ion-alert .alert-button').filter(':visible').contains('OK').click();
        for (const indicator of data.confidenceSet.indicators) {
            cy.contains('Confidence indicator set').parent().should('contain', indicator.label)
            cy.contains('Confidence indicator set').parent().should('contain', indicator.level)
        }

        // Annotators
        for (const annotator of data.annotators) {
            cy.get('#searchbar').type(annotator.displayName);
            cy.contains(annotator.displayName).click();
            cy.get('#searchbar').parent().should('contain', annotator.displayName)
        }

        // Submit
        cy.intercept('POST', '/api/annotation-campaign', (req) => {
            try {
                expect(req.body).to.deep.equal(expectedResult)
            } catch (e) {
                console.warn(e);
                req.destroy()
            }
        }).as('submit')
        cy.get('ion-button').contains('Create campaign').click()
        cy.wait('@submit').then(interception => {
            expect(interception.response.statusCode).to.equal(200)
        })
    })

    it('Check annotations usage', () => {
        const data = CAMPAIGNS_DATA[Usage.check];
        /** @type {Create} */
        const expectedResult = {
            usage: Usage.check,
            name: data.name,
            desc: data.description,
            instructions_url: data.instructionsURL,
            start: data.start + 'T00:00',
            end: data.end + 'T00:00',
            datasets: [data.dataset.id],
            spectro_configs: data.dataset.spectrogramConfigurations.map(c => c.id),
            annotators: data.annotators.map(a => a.id),
            annotation_goal: data.annotators.length,
            annotation_scope: data.annotationScope,
            annotation_set_labels: data.annotationSetLabels,
            confidence_set_indicators: data.confidenceSetIndicators.map(i => [i.label, i.level]),
            detectors: data.detectors.map(d => ({
                detectorName: d.name,
                configuration: d.configuration
            })),
            results: data.results
        }

        // Global info
        cy.contains('Name').parent().type(data.name);
        cy.contains('Description').parent().type(data.description);
        cy.contains('Instruction URL').parent().type(data.instructionsURL);
        cy.contains('Start').parent().type(data.start)
        cy.contains('End').parent().type(data.end)

        // Dataset
        cy.contains('Select a dataset').click();
        cy.get('button').contains(data.dataset.name).click();
        cy.get('ion-alert .alert-button').filter(':visible').contains('OK').click();

        // Annotations
        cy.contains('Select an annotation mode').click();
        cy.get('div.item').contains('Check annotations').click()
        cy.contains('Import annotations').click()
        cy.fixture('annotation_results.csv').as('annotation_results_csv')
        cy.get('#drag-n-drop-zone').selectFile('@annotation_results_csv', { action: 'drag-drop' });
        /// Inconsistent dataset name
        cy.get('ion-modal').should('include.text', 'The selected file contains unrecognized dataset')
        cy.contains('Use selected datasets as').click()
        /// Inconsistent max confidence level
        cy.get('ion-modal').should('include.text', 'Inconsistent confidence indicator max level')
        cy.get('ion-radio').contains('1 (3 occurrences)').click()
        cy.contains('Use 1 as maximum').click()
        /// Detectors
        for (const detector of data.detectors) {
            cy.contains(detector.name).find('ion-checkbox').click();
            cy.contains(detector.name).find('textarea').type(detector.configuration);
        }
        cy.get('ion-modal ion-button').contains('Import').click()
        cy.get('ion-button').should('not.include.text','Import annotations')

        // Annotators
        for (const annotator of data.annotators) {
            cy.get('#searchbar').type(annotator.displayName);
            cy.contains(annotator.displayName).click();
            cy.get('#searchbar').parent().should('contain', annotator.displayName)
        }

        // Submit
        cy.intercept('POST', '/api/annotation-campaign', (req) => {
            console.debug('POST campaign', req)
            expect(req.body).to.deep.equal(expectedResult)
            try {
            } catch (e) {
                console.debug(req.body.results, expectedResult.results)
                req.reply(400, e.message)
                throw e
            }
        }).as('submit')
        cy.get('ion-button').contains('Create campaign').click()
        cy.wait('@submit').then(interception => {
            expect(interception.response.statusCode).to.equal(200)
        })
    })
})

