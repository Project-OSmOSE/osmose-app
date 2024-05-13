import {CAMPAIGNS_DATA} from "../../globals/campaign";
import {USER_COMMON_2} from "../../globals/users";
import {Usage} from "@/types/annotations";

const Campaign = CAMPAIGNS_DATA[Usage.create]

describe('Edit campaign', () => {
    beforeEach(() => {
        cy.session_login('admin', 'osmose29')
        cy.contains(Campaign.name).parent().parent().contains('Manage').click()
    })

    it('Add annotator', () => {
        cy.contains('Add annotators').click();
        cy.url().then(url => {
            const split = url?.split('/')
            split.pop()
            let ID = split.pop();

            console.debug(">>> ID", ID)
            cy.intercept('POST', `/api/annotation-campaign/${ID}/add_annotators`, (req) => {
                console.debug('IN')
                try {
                    expect(req.body).to.deep.equal({
                        annotators: [USER_COMMON_2.id],
                        annotation_goal: 30
                    })
                } catch (e) {
                    console.warn(e);
                    req.destroy()
                }
            }).as('submit')
        });

        // Annotators
        cy.get('#searchbar').type(USER_COMMON_2.displayName);
        cy.contains(USER_COMMON_2.displayName).click();
        cy.get('#searchbar').parent().should('contain', USER_COMMON_2.displayName)

        // Nb of files to annotate
        cy.contains('files to annotate').parent().find('input').clear().type(3)

        // Submit
        cy.get('ion-button').contains('Update campaign').click()
        cy.wait('@submit').then(interception => {
            expect(interception.response.statusCode).to.equal(200);
            expect(interception.response.body.tasks.find(t => t.annotator_id === USER_COMMON_2.id)?.count).to.equal(30)
        })
    })
})
