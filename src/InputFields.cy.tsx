import InputFields from './InputFields'

describe('<InputFields />', () => {
    interface TestData {
        inputs: Record<string, string>
    }
    const testDataArray: TestData[] = [
        {
            inputs: { foo: 'bar' },
        },
        {
            inputs: { foo: 'bar', baz: 'qux' },
        },
        {
            inputs: { foo: 'bar', baz: '' },
        },
    ]
    testDataArray.forEach((testData) => {
        it('renders inputs with a values and placeholders', () => {
            const handleInputChange = cy.stub()
            const sanitizeField = cy
                .stub()
                .callsFake((x: string) => `sanitized-${x}`)
            const formatPlaceholder = cy
                .stub()
                .callsFake((x: string) => `${x}-placeholder`)
            cy.mount(
                <InputFields
                    inputs={testData.inputs}
                    handleInputChange={handleInputChange}
                    sanitizeField={sanitizeField}
                    formatPlaceholder={formatPlaceholder}
                />,
            ).then(() => {
                cy.get('input').should(
                    'have.length',
                    Object.keys(testData.inputs).length,
                )
                Object.keys(testData.inputs).forEach((name, index) => {
                    cy.get('input')
                        .eq(index)
                        .should('have.value', testData.inputs[name])
                })
                Object.keys(testData.inputs).forEach((name, index) => {
                    cy.get('input')
                        .eq(index)
                        .should('have.attr', 'placeholder')
                        .and('equal', `${name}-placeholder`)
                })
            })
        })
        it('sanitizeInput', () => {
            const handleInputChange = cy.stub()
            const sanitizeField = cy
                .stub()
                .callsFake((x: string) => `sanitized-${x}`)
            const formatPlaceholder = cy
                .stub()
                .callsFake((x: string) => `${x}-placeholder`)
            cy.mount(
                <InputFields
                    inputs={testData.inputs}
                    handleInputChange={handleInputChange}
                    sanitizeField={sanitizeField}
                    formatPlaceholder={formatPlaceholder}
                />,
            ).then(() => {
                expect(sanitizeField).to.be.callCount(
                    Object.keys(testData.inputs).length,
                )
                Object.keys(testData.inputs).forEach((name) => {
                    expect(sanitizeField).to.be.calledWith(name)
                })
            })
        })
        it('formatPlaceholder', () => {
            const handleInputChange = cy.stub()
            const sanitizeField = cy
                .stub()
                .callsFake((x: string) => `sanitized-${x}`)
            const formatPlaceholder = cy
                .stub()
                .callsFake((x: string) => `${x}-placeholder`)
            cy.mount(
                <InputFields
                    inputs={testData.inputs}
                    handleInputChange={handleInputChange}
                    sanitizeField={sanitizeField}
                    formatPlaceholder={formatPlaceholder}
                />,
            ).then(() => {
                expect(formatPlaceholder).to.be.callCount(
                    Object.keys(testData.inputs).length,
                )
                Object.keys(testData.inputs).forEach((name) => {
                    expect(formatPlaceholder).to.be.calledWith(name)
                })
                Object.keys(testData.inputs).forEach((name, index) => {
                    cy.get('input')
                        .eq(index)
                        .should('have.attr', 'placeholder')
                        .and('equal', `${name}-placeholder`)
                })
            })
        })
    })
})
