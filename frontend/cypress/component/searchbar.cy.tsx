import React from 'react'
import { setupIonicReact } from '@ionic/react';
import { Item } from "../../src/types/item";
import { Searchbar } from "../../src/components/form";

setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

const placeholder = 'My placeholder';
const options: Array<Item> = [
  { label: 'First', value: 1 },
  { label: 'Second', value: 2 },
];

describe('Searchbar', () => {
  beforeEach(() => {
    const stub = cy.stub().as('onValueSelected')
    cy.mount(<Searchbar values={ options }
                        placeholder={ placeholder }
                        onValueSelected={ stub }/>)
  })

  it('renders', () => {
    cy.get('#searchbar ion-searchbar').should('have.attr', 'placeholder', placeholder)
  })

  it('search existing item', () => {
    cy.get('#searchbar ion-searchbar').type('f');
    cy.contains('First').click()
    cy.get('@onValueSelected').should('have.been.calledWithMatch', options.find(i => i.label === 'First'))
  })

  it('search inexistant item', () => {
    cy.get('#searchbar ion-searchbar').type('abc');
    cy.get('#searchbar').should('contain', 'No results')
  })

  it('clear search', () => {
    cy.get('#searchbar ion-searchbar').type('abc');
    cy.get('#searchbar ion-searchbar').should('have.value', 'abc');
    cy.get('#searchbar ion-searchbar button[aria-label=reset]').click();
    cy.get('#searchbar ion-searchbar').should('not.have.value', 'abc');
  })
})
