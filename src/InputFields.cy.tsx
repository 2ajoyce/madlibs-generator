import InputFields from './InputFields'

describe('<InputFields />', () => {
    interface TestCase {
        inputs: Record<string, string>
        placeholders: string[]
        names: string[]
    }
    const testCases: TestCase[] = [
        {
            inputs: { 'foo-1': 'bar' }, // this checks formatPlaceholder
            placeholders: ['Foo 1'],
            names: ['foo-1'],
        },
        {
            inputs: { foo: 'bar', baz: 'qux' },
            placeholders: ['Foo', 'Baz'],
            names: ['foo', 'baz'],
        },
        {
            inputs: { foo: 'bar', baz: '' },
            placeholders: ['Foo'],
            names: ['foo'],
        },
        {
            inputs: { foo$: 'bar', baz: '' }, // this checks sanitizeField
            placeholders: ['Foo$'],
            names: ['foo', 'baz'],
        },
    ]
    testCases.forEach((testCase) => {
        it('renders inputs with a values and placeholders', () => {
            const handleInputChange = cy.stub()
            cy.mount(
                <InputFields
                    inputs={testCase.inputs}
                    handleInputChange={handleInputChange}
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
                testCase.placeholders.forEach((placeholder, index) => {
                    cy.get('input')
                        .eq(index)
                        .should('have.attr', 'placeholder')
                        .and('equal', placeholder)
                })
                testCase.names.forEach((name, index) => {
                    cy.get('input')
                        .eq(index)
                        .should('have.attr', 'name')
                        .and('equal', name)
                })
            })
        })
    })
})
