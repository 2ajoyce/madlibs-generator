import InputFields from './InputFields'

describe('<InputFields />', () => {
    interface TestCase {
        inputs: Record<string, string>
        placeholders: string[]
    }
    const testCases: TestCase[] = [
        {
            inputs: { foo: 'bar' },
            placeholders: ['Foo'],
        },
        {
            inputs: { foo: 'bar', baz: 'qux' },
            placeholders: ['Foo', 'Baz'],
        },
        {
            inputs: { foo: 'bar', baz: '' },
            placeholders: ['Foo'],
        },
    ]
    testCases.forEach((testCase) => {
        it('renders inputs with a values and placeholders', () => {
            const handleInputChange = cy.stub()
            const sanitizeField = cy
                .stub()
                .callsFake((x: string) => `sanitized-${x}`)
            cy.mount(
                <InputFields
                    inputs={testCase.inputs}
                    handleInputChange={handleInputChange}
                    sanitizeField={sanitizeField}
                />,
            ).then(() => {
                cy.get('input').should(
                    'have.length',
                    Object.keys(testCase.inputs).length,
                )
                Object.keys(testCase.inputs).forEach((name, index) => {
                    cy.get('input')
                        .eq(index)
                        .should('have.value', testCase.inputs[name])
                })
                testCase.placeholders.forEach(
                    (placeholder, index) => {
                        cy.get('input')
                            .eq(index)
                            .should('have.attr', 'placeholder')
                            .and('equal', placeholder)
                    },
                )
            })
        })
        it('sanitizeInput', () => {
            const handleInputChange = cy.stub()
            const sanitizeField = cy
                .stub()
                .callsFake((x: string) => `sanitized-${x}`)
            cy.mount(
                <InputFields
                    inputs={testCase.inputs}
                    handleInputChange={handleInputChange}
                    sanitizeField={sanitizeField}
                />,
            ).then(() => {
                expect(sanitizeField).to.be.callCount(
                    Object.keys(testCase.inputs).length,
                )
                Object.keys(testCase.inputs).forEach((name) => {
                    expect(sanitizeField).to.be.calledWith(name)
                })
            })
        })
    })
})
