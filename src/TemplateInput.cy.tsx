import { type ChangeEvent } from 'react'
import TemplateInput from './TemplateInput'
interface TestCase {
    description: string
    inputData: string
    expectFileUpload: boolean
}
describe('<TemplateInput />', () => {
    const testCases: TestCase[] = [
        {
            description: 'File upload mode, no input',
            expectFileUpload: true,
            inputData: '',
        },
        {
            description: 'Text input mode, no input',
            expectFileUpload: false,
            inputData: '',
        },
        {
            description: 'File upload mode, with input',
            expectFileUpload: true,
            inputData: 'Sample text',
        },
        {
            description: 'Text input mode, with input',
            expectFileUpload: false,
            inputData: 'Sample text',
        },
    ]

    testCases.forEach((testCase) => {
        it(`renders correctly for ${testCase.description}`, () => {
            cy.mount(
                <TemplateInput
                    onFileUpload={cy.stub()}
                    onManualInput={cy.stub()}
                    inputData={testCase.inputData}
                />,
            ).then(() => {
                if (testCase.expectFileUpload) {
                    // Click the toggle button to switch to the FileUpload component
                    cy.get('.button-container button')
                        .click()
                        .then(() => {
                            // Verify the button text
                            cy.get('.button-container button').should(
                                'have.text',
                                'Type Manually',
                            )
                            // Verify that the FileUpload component is present after the click
                            cy.get('.upload-box').should('exist')
                        })
                } else {
                    // Verify the button text
                    cy.get('.button-container button').should(
                        'have.text',
                        'Upload File',
                    )
                    // Verify that the text area is present
                    cy.get('textarea')
                        .should('exist')
                        .should('have.attr', 'placeholder')

                    // Verify that the text area has expected value
                    cy.get('textarea')
                        .should('exist')
                        .and('have.value', testCase.inputData)
                }
            })
        })
    })
    it('switches between FileUpload and TextArea on button click', () => {
        cy.mount(
            <TemplateInput
                onFileUpload={cy.stub()}
                onManualInput={cy.stub()}
                inputData=""
            />,
        ).then(() => {
            // Initially, the TextArea should be visible
            cy.get('textarea').should('exist')

            // Click the button to switch to FileUpload
            cy.get('.button-container button')
                .click()
                .then(() => {
                    // Now, FileUpload should be visible
                    cy.get('.upload-box').should('exist')

                    // Click the button again to switch back to TextArea
                    cy.get('.button-container button')
                        .click()
                        .then(() => {
                            // Verify that TextArea is visible again
                            cy.get('textarea').should('exist')
                        })
                })
        })
    })

    it('handles file upload correctly', () => {
        const fileUploadStub = cy.stub()
        cy.mount(
            <TemplateInput
                onFileUpload={fileUploadStub}
                onManualInput={cy.stub()}
                inputData=""
            />,
        ).then(() => {
            // Initially switch to FileUpload component
            cy.get('.button-container button')
                .click()
                .then(() => {
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
                            // Check if the onFileUpload function is called with the correct file
                            expect(fileUploadStub).to.be.calledWithMatch(
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

    it('handles manual text input correctly', () => {
        const manualInputStub = cy.stub()
        cy.mount(
            <TemplateInput
                onFileUpload={cy.stub()}
                onManualInput={manualInputStub}
                inputData=""
            />,
        ).then(() => {
            // Type some text into the textarea
            const sampleText =
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            cy.get('textarea')
                .type(sampleText)
                .then(() => {
                    expect(manualInputStub.callCount).to.equal(
                        sampleText.length,
                    )
                })
        })
    })
})
