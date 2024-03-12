import React from 'react'
import { setupIonicReact } from '@ionic/react';
import { ChipsInput } from '@/components/form';
import { Item } from "@/types/item";

const label = 'My label';
const options: Array<Item> = [
  { label: 'First', value: 1 },
  { label: 'Second', value: 2 },
];
const activeItems = [1];

setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

describe('Input', () => {
  beforeEach(() => {
    const setActiveItemsValues = cy.stub().as('setActiveItemsValues')
    cy.mount(<ChipsInput label={ label }
                         items={ options }
                         activeItemsValues={ activeItems }
                         setActiveItemsValues={ setActiveItemsValues }/>)
  })

  it('renders', () => {
    cy.get('#aplose-input').should('contain', label)
    for (const item of options) {
      cy.get('#aplose-input ion-chip').should('contain', item.label)
      if (activeItems.includes(item.value)) {
        cy.get('#aplose-input ion-chip').contains(item.label).should('have.descendants', 'ion-icon')
      }
    }
  })

  it('can select new item', () => {
    const selectItem = options[1];
    cy.get('#aplose-input ion-chip').contains(selectItem.label).click()
    cy.get('@setActiveItemsValues').should('have.been.calledWithMatch', [...activeItems, selectItem.value])
  })

  it('can unselect item', () => {
    const selectItem = options[0];
    cy.get('#aplose-input ion-chip').contains(selectItem.label).click()
    cy.get('@setActiveItemsValues').should('have.been.calledWithMatch', activeItems.filter(i => i !== selectItem.value))
  })

  it('can be required', () => {
    cy.mount(<ChipsInput label={ label }
                         required={ true }
                         items={ options }
                         activeItemsValues={ activeItems }/>)
    cy.get('#aplose-input').should('contain', `${ label }*`)
  })
})
