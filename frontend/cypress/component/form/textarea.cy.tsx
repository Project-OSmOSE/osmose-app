import { OldTextarea } from '@/components/form'

const label = 'My label';
const placeholder = 'My placeholder';
const value = 'My value';

describe('Textarea', () => {
  beforeEach(() => {
    cy.mount(<OldTextarea label={ label }
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
    cy.mount(<OldTextarea label={ label }
                          required={ true }
                          placeholder={ placeholder }/>)
    cy.get('#aplose-input').should('contain', `${ label }*`)
    cy.get('#aplose-input textarea').should('have.attr', 'required')
  })

  //TODO: test with error, error should be removed after input update - for now: cannot use hook inside a test
  // it('can have an error', () => {
  //   const ref = useRef<InputRef<TextareaValue>>(null);
  //   cy.mount(<Textarea label={ label }
  //                      ref={ ref }
  //                      placeholder={ placeholder }/>)
  //   ref.current?.setError("My custom error")
  //   cy.get('#aplose-input').should('contain', "My custom error")
  // })
})
