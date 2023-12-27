import { v4 as uuidv4 } from 'uuid'
import SessionDisplay from './SessionDisplay'

describe('<SessionDisplay />', () => {
    const testCases = [
        { sessionId: uuidv4(), expectLink: true },
        { sessionId: null, expectLink: false },
    ]

    testCases.forEach(({ sessionId, expectLink }) => {
        it(`should ${
            expectLink ? '' : 'not '
        }render session link when sessionId is ${sessionId}`, () => {
            const handleCollaborateClick = cy.stub().as('collaborateClick')
            cy.mount(
                <SessionDisplay
                    sessionId={sessionId}
                    handleCollaborateClick={handleCollaborateClick}
                />,
            )

            if (expectLink) {
                cy.get('.button-container a').should('have.text', sessionId)
            } else {
                cy.get('.button-container button')
                    .should('exist')
                    .and('have.text', 'Collaborate')
                cy.get('.button-container button').click()
                cy.get('@collaborateClick').should('have.been.calledOnce')
            }
        })
    })
})
