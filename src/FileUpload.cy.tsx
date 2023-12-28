import { type ChangeEvent } from 'react'
import FileUpload from './FileUpload'

describe('<FileUpload />', () => {
    const testCases = [
        {
            description: 'active state',
            disabled: false,
        },

        {
            description: 'disabled state',
            disabled: true,
        },
    ]

    testCases.forEach((testCase) => {
        it(`renders with ${testCase.description}`, () => {
            cy.mount(
                <FileUpload
                    onChange={cy.stub()}
                    disabled={testCase.disabled}
                />,
            ).then(() => {
                // Verify the label text
                cy.get('.upload-box label').should('exist')

                cy.get('input').invoke('attr', 'id').as('input_id')
                cy.get('label').invoke('attr', 'for').as('label_id')
                cy.get('@input_id').then((inputId) => {
                    cy.get('@label_id').then((labelId) => {
                        expect(inputId).equal(labelId)
                    })
                })

                // Verify the presence of the file input
                cy.get('.upload-box input[type="file"]').should('exist')

                // Verify the disabled state
                if (testCase.disabled) {
                    cy.get('.upload-box input[type="file"]').should(
                        'be.disabled',
                    )
                } else {
                    cy.get('.upload-box input[type="file"]').should(
                        'not.be.disabled',
                    )
                }

                // Verify the presence of info text
                cy.get('.info-icon')
                    .should('exist')
                    .should('have.attr', 'title')
            })
        })
    })
    it('calls onChange handler with file data on file upload', () => {
        const onChangeStub = cy.stub()
        cy.mount(<FileUpload onChange={onChangeStub} disabled={false} />).then(
            () => {
                // Simulate file upload process
                const dummyFile = new File(['content'], 'testfile.txt', {
                    type: 'text/plain',
                })
                cy.get('input[type="file"]')
                    .selectFile({
                        contents: dummyFile,
                        fileName: 'testfile.txt',
                    })
                    .then(() => {
                        // Check if the onChange function is called with the correct file
                        expect(onChangeStub).to.be.calledWithMatch(
                            (event: ChangeEvent<HTMLInputElement>) => {
                                if (
                                    event.target.files !== null &&
                                    event.target.files?.length > 0
                                ) {
                                    return (
                                        event.target.files[0].name ===
                                        'testfile.txt'
                                    )
                                }
                            },
                        )
                    })
            },
        )
    })
})
