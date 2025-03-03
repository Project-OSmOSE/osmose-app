import { setupIonicReact } from '@ionic/react';
import { DragNDropFileInput, DragNDropState } from '@/components/form'
import { ACCEPT_CSV_MIME_TYPE } from "@/consts/csv.ts";

setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

const label = 'My label';
const filename = "My file.csv";

describe('Drag-n-drop file input', () => {

  describe('Available state', () => {
    beforeEach(() => {
      const stub = cy.stub().as('onFileImported')
      cy.mount(<DragNDropFileInput state={ DragNDropState.available }
                                   accept={ ACCEPT_CSV_MIME_TYPE }
                                   onFileImported={ stub }
                                   label={ label }/>)
    })


    it('renders', () => {
      cy.get('#drag-n-drop-zone').should('contain', label)
    })

    it('imports CSV', () => {
      cy.get('#drag-n-drop-zone').selectFile('cypress/utils/annotation_results.csv', { force: true, action: 'drag-drop' });
      cy.get('@onFileImported').should('have.been.called')
    })

    it('doesn\'t imports other files types', () => {
      cy.get('#drag-n-drop-zone').selectFile('cypress/utils/example.json', { force: true, action: 'drag-drop' });
      cy.get('@onFileImported').should('not.have.been.called')
    })
  })

  describe('Loading state', () => {
    beforeEach(() => {
      cy.mount(<DragNDropFileInput state={ DragNDropState.loading }/>)
    })


    it('renders', () => {
      cy.get('#drag-n-drop-zone').should('have.descendants', 'ion-spinner')
    })
  })

  describe('Loaded state', () => {
    beforeEach(() => {
      const stub = cy.stub().as('onReset')
      cy.mount(<DragNDropFileInput state={ DragNDropState.fileLoaded }
                                   filename={ filename }
                                   onReset={ stub }/>)
    })

    it('renders', () => {
      cy.get('#drag-n-drop-zone').should('contain', filename)
    })

    it('can reset', () => {
      cy.get('#drag-n-drop-zone').contains('Import another file', { matchCase: false }).click()
      cy.get('@onReset').should('have.been.called')
    })
  })
})
