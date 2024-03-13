import React from 'react'
import { setupIonicReact } from '@ionic/react';
import { DragNDropFileInput, DragNDropState } from '../../src/components/form'
import { ACCEPT_CSV_MIME_TYPE } from "../../src/consts/csv";

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
      cy.get('input[type=file]').selectFile('cypress/fixtures/annotation_results.csv', { force: true });
      cy.get('@onFileImported').should('have.been.called')
    })

    it('doesn\'t imports other files types', () => {
      cy.get('input[type=file]').selectFile('cypress/fixtures/example.json', { force: true });
      cy.get('@onFileImported').should('not.have.been.called')
    })

    // TODO: add tests
    //  - Check loading non csv files
    //  - Check loading csv files
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
