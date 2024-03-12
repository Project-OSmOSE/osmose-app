import React from 'react'
import { Textarea } from '@/components/form'

const label = 'My label';
const placeholder = 'My placeholder';
const value = 'My value';

describe('Input', () => {
  beforeEach(() => {
    cy.mount(<Textarea label={ label }
                       placeholder={ placeholder }/>)
  })

  it('renders', () => {
    cy.get('#aplose-input').should('contain', label)
    cy.get('#aplose-input textarea').should('have.attr', 'placeholder', placeholder)
  })

  it('can be edited', () => {
    cy.get('#aplose-input textarea').type(value);
    cy.get('#aplose-input textarea').should('contain.value', value)
  })

  it('can be required', () => {
    cy.mount(<Textarea label={ label }
                       required={ true }
                       placeholder={ placeholder }/>)
    cy.get('#aplose-input').should('contain', `${ label }*`)
    cy.get('#aplose-input textarea').should('have.attr', 'required')
  })
})
