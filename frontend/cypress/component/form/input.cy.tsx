import { OldInput } from '../../../src/components/form/inputs/input'

const label = 'My label';
const placeholder = 'My placeholder';
const value = 'My value';
const note = 'My note';

describe('Input', () => {
  beforeEach(() => {
    cy.mount(<OldInput label={ label }
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
    cy.mount(<OldInput label={ label }
                       required={ true }
                       placeholder={ placeholder }/>)
    cy.get('#aplose-input').should('contain', `${ label }*`)
    cy.get('#aplose-input input').should('have.attr', 'required')
  })

  //TODO: test with error, error should be removed after input update - for now: cannot use hook inside a test
  // it('can have an error', () => {
  //   const ref = useRef<InputRef<InputValue>>(null);
  //   cy.mount(<Input label={ label }
  //                   ref={ ref }
  //                   placeholder={ placeholder }/>)
  //   ref.current?.setError("My custom error")
  //   cy.get('#aplose-input').should('contain', "My custom error")
  // })
})
