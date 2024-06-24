import React from 'react'
import { setupIonicReact } from '@ionic/react';
import { Select } from "../../../src/components/form";
import { Item } from "../../../src/types/item";

const label = 'My label';
const placeholder = 'My placeholder';
const options: Array<Item> = [
  { label: 'First', value: 1 },
  { label: 'Second', value: 2 },
];
const noneLabel = "My none label";


setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

describe('Select', () => {

  it('renders', () => {
    cy.mount(<Select label={ label }
                     options={ options }
                     placeholder={ placeholder }/>)
    cy.get('#aplose-input').should('contain', label)
  })

  describe('popover mode', () => {
    beforeEach(() => {
      const onValueSelected = cy.stub().as('onValueSelected');
      cy.mount(<Select label={ label }
                       options={ options }
                       optionsContainer="popover"
                       onValueSelected={ onValueSelected }
                       noneLabel={ noneLabel }
                       placeholder={ placeholder }/>)
    })

    it('should display options', () => {
      cy.contains(placeholder).click();
      for (const option of options) {
        cy.get('#aplose-input').should('contain.text', option.label)
      }
    })

    it('should select option', () => {
      cy.contains(placeholder).click();
      const selectedOption = options[1];

      cy.get('div.item').contains(selectedOption.label).click()
        .then(() => {
          cy.get('@onValueSelected').should('have.been.calledWithMatch', selectedOption.value);
        })
    })

    it('should select none', () => {
      cy.contains(placeholder).click();

      cy.get('div.item').contains(noneLabel).click()
        .then(() => {
          cy.get('@onValueSelected').should('have.been.calledWithMatch', undefined);
        })
    })

    it('can be required', () => {
      cy.mount(<Select label={ label }
                       options={ options }
                       optionsContainer="popover"
                       required={ true }
                       noneLabel={ noneLabel }
                       placeholder={ placeholder }/>)

      cy.get('#aplose-input').should('contain', `${ label }*`)
      cy.contains(placeholder).click();
      cy.get('div.item').should('not.contain', noneLabel);
    })
  })

  describe('alert mode', () => {
    beforeEach(() => {
      const onValueSelected = cy.stub().as('onValueSelected');
      cy.mount(<Select label={ label }
                       options={ options }
                       optionsContainer="alert"
                       onValueSelected={ onValueSelected }
                       noneLabel={ noneLabel }
                       placeholder={ placeholder }/>)
    })

    it('should display options', () => {
      cy.contains(placeholder).click();
      for (const option of options) {
        cy.get('button').should('contain.text', option.label)
      }
    })

    it('should select option', () => {
      cy.contains(placeholder).click();
      const selectedOption = options[1];

      cy.get('button').contains(selectedOption.label).click()
      cy.contains('Ok', { matchCase: false }).click()
        .then(() => {
          cy.get('@onValueSelected').should('have.been.calledWithMatch', selectedOption.value);
        })
    })

    it('should select none', () => {
      cy.contains(placeholder).click();

      cy.get('button').contains(noneLabel).click()
      cy.contains('Ok', { matchCase: false }).click()
        .then(() => {
          cy.get('@onValueSelected').should('have.been.calledWithMatch', undefined);
        })
    })

    it('can be required', () => {
      cy.mount(<Select label={ label }
                       options={ options }
                       optionsContainer="alert"
                       required={ true }
                       noneLabel={ noneLabel }
                       placeholder={ placeholder }/>)

      cy.get('#aplose-input').should('contain', `${ label }*`)
    })
  })
})
