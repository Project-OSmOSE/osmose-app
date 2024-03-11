import React from 'react'
import { Input } from '@/components/form/inputs/input'

const label = 'My label';
const placeholder = 'My placeholder';
const value = 'My value';

describe('Input', () => {
  beforeEach(() => {
    cy.mount(<Input label={ label }
                    placeholder={ placeholder }/>)
  })

  it('renders', () => {
    cy.get('#aplose-input').should('contain', label)
    cy.get('#aplose-input input').should('have.attr', 'placeholder', placeholder)
  })

  it('can be edited', () => {
    cy.get('#aplose-input input').type(value);
    cy.get('#aplose-input input').should('contain.value', value)
  })

  it('can be required', () => {
    cy.mount(<Input label={ label }
                    required={ true }
                    placeholder={ placeholder }/>)
    cy.get('#aplose-input').should('contain', `${label}*`)
    cy.get('#aplose-input input').should('have.attr', 'required')
  })
})
