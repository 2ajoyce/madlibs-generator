import { type ChangeEvent } from 'react'
import FileUpload from './FileUpload'

describe('<FileUpload />', () => {
    const testCases = [
        {
            description: 'label and no info text',
            label: 'Upload File',
            infoText: undefined,
            disabled: false,
        },
        {
            description: 'label and info text',
            label: 'Profile Picture',
            infoText: 'Please upload an image file',
            disabled: false,
        },
        {
            description: 'label and disabled state',
            label: 'Document',
            infoText: undefined,
            disabled: true,
        },
        {
            description: 'label, info text, and disabled state',
            label: 'Resume',
            infoText: 'Supported formats: PDF, DOCX',
            disabled: true,
        },
    ]

    testCases.forEach((testCase) => {
        it(`renders with ${testCase.description}`, () => {
            cy.mount(
                <FileUpload
                    label={testCase.label}
                    onChange={cy.stub()}
                    disabled={testCase.disabled}
                    infoText={testCase.infoText}
                />,
            ).then(() => {
                // Verify the label text
                cy.get('.upload-box label').should(
                    'have.text',
                    `${testCase.label}:`,
                )
                // Verify label is correctly associated with file input
                cy.get('.upload-box label').should(
                    'have.attr',
                    'for',
                    testCase.label.toLowerCase().replace(/\s+/g, '-'),
                )

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

                // Verify the presence of info text if applicable
                if (testCase.infoText != null) {
                    cy.get('.info-icon').should(
                        'have.attr',
                        'title',
                        testCase.infoText,
                    )
                } else {
                    cy.get('.info-icon').should('not.exist')
                }
            })
        })
    })
    it('calls onChange handler with file data on file upload', () => {
        const onChangeStub = cy.stub()
        cy.mount(
            <FileUpload
                label="Test File Upload"
                onChange={onChangeStub}
                disabled={false}
                infoText="Upload a file"
            />,
        ).then(() => {
            // Simulate file upload process
            const dummyFile = new File(['content'], 'testfile.txt', {
                type: 'text/plain',
            })
            cy.get('input[type="file"]')
                .selectFile({ contents: dummyFile, fileName: 'testfile.txt' })
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
        })
    })
})
