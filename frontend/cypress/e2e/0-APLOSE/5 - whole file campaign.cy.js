describe('Whole file', () => {
    beforeEach(() => {
        cy.login("admin", "osmose29")
        cy.visit(Cypress.env('aploseURL'))
        cy.contains("Annotation campaigns").click()
    })

    // it('create', () => {
    //     cy.contains('New annotation campaign', {matchCase: false}).click()
    //     cy.get('#cac-name').type(Cypress.env('wholeFileCampaign'))
    //     cy.get("#cac-desc").type("Testing campaign creation");
    //     cy.get("#cac-dataset").select("New Test Dataset");
    //     cy.get("#cac-spectro").select("4096_4096_90");
    //     cy.get("#cac-annotation-set").select("Test SPM campaign");
    //     cy.get("#cac-confidence-indicator-set").select("Confident/NotConfident");
    //     cy.get("#cac-annotation-mode").select("Whole file");
    //     cy.get("#cac-user").select("admin");
    //     cy.get("#cac-user").select("dc");
    //     cy.get("#cac-user").select("ek");
    //     cy.get("#cac-annotation-method").select("Sequential");
    //     cy.get('input[type=submit]').click(); // cy.contains('submit', {matchCase: false}).click()
    // })

    describe('should be as created', () => {
        // it('name', () => {
        //     cy.contains(Cypress.env('wholeFileCampaign')).click();
        //     cy.get("h1").should('include.text', Cypress.env('wholeFileCampaign'))
        // })
        //
        // it('description', () => {
        //     cy.contains(Cypress.env('wholeFileCampaign')).click();
        //     cy.contains('Description').parentsUntil('div').parent().should('include.text', "Testing campaign creation")
        // })

        it('dataset', () => {
            // TODO: check dataset = "New Test Dataset"
        })

        it('spectro', () => {
            // TODO: check available spectro = "4096_4096_90"
        })

        // it('annotation set', () => {
        //     cy.contains(Cypress.env('wholeFileCampaign')).parentsUntil('tr').parent()
        //         .contains("Test SPM campaign")
        // })
        //
        // it('confidence set', () => {
        //     cy.contains(Cypress.env('wholeFileCampaign')).parentsUntil('tr').parent()
        //         .contains("Confident/NotConfident")
        // })

        it('annotation mode', () => {
            // TODO: check annotation mode = "Whole file"
        })

        it('annotation method', () => {
            // TODO: check annotation method = "Sequential"
        })

        it('has 3 annotators', () => {
            cy.contains(Cypress.env('wholeFileCampaign')).click();

            cy.get("h1").should('include.text', Cypress.env('wholeFileCampaign'))
            cy.get("tbody").within(() => {
                cy.get('tr').should('have.length', 3)
            })

            cy.get('tr').should('include.text', 'admin@osmose.xyz')
            cy.get('tr').should('include.text', 'dc@osmose.xyz')
            cy.get('tr').should('include.text', 'ek@osmose.xyz')
        })
    })

})