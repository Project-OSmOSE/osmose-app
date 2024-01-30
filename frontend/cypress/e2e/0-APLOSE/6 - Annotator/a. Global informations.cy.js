describe('Check annotator global informations', () => {
    beforeEach(() => {
        cy.login("admin", "osmose29")
        cy.contains(Cypress.env('wholeFileCampaign')).parentsUntil('tr').parent().contains('My tasks').click()
        cy.contains('Task link').click()
    })

    it('spectrogram configuration 4096_4096_90', () => {
        cy.get('select').should('have.text', 'nfft: 4096 / winsize: 4096 / overlap: 90')
    })

    it('filename', () => {
        cy.get('.workbench strong').should('include.text', '50h_0.wav')
    })

    it('sampling rate', () => {
        cy.get('.workbench strong').should('include.text', '32768 Hz')
    })

    it('start date', () => {
        cy.get('.workbench strong').should('include.text', 'Thu, 04 Oct 2012 06:00:00 GMT')
    })

    it('annotation mode', () => {
        cy.get('.card').should('include.text', 'Presence / Absence');
    })

    it('annotation mode', () => {
        cy.get('.card').should('include.text', 'Confidence indicator');
    })
})
