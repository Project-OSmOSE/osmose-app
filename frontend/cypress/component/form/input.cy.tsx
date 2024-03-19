import React from 'react'
import { Input } from '@/components/form/inputs/input'

const label = 'My label';
const placeholder = 'My placeholder';
const value = 'My value';
const note = 'My note';

describe('Input', () => {
  beforeEach(() => {
    cy.mount(<Input label={ label }
                    placeholder={ placeholder }
                    note={ note }/>)
  })

  it('renders', () => {
    cy.get('#aplose-input').should('contain', label)
    cy.get('#aplose-input input').should('have.attr', 'placeholder', placeholder)
    cy.get('#aplose-input ion-note').should('include.text', note)
  })

  it('can be edited', () => {
    cy.get('#aplose-input input').type(value);
    cy.get('#aplose-input input').should('contain.value', value)
  })

  it('can be required', () => {
    cy.mount(<Input label={ label }
                    required={ true }
                    placeholder={ placeholder }
                    note={ note }/>)
    cy.get('#aplose-input').should('contain', `${ label }*`)
    cy.get('#aplose-input input').should('have.attr', 'required')
  })
})
