import React from 'react'

interface SessionDisplayProps {
    sessionId: string | null
    handleCollaborateClick: () => void
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({
    sessionId,
    handleCollaborateClick,
}) => {
    const sessionIdComponent = (
        <div className="button-container">
            Session:{' '}
            <a href={`${window.location.href}?sessionId=${sessionId}`}>
                {sessionId}
            </a>
        </div>
    )

    const collaborationBttnComponent = (
        <div className="button-container">
            <button onClick={handleCollaborateClick}>Collaborate</button>
        </div>
    )

    return (
        <>
            {sessionId !== null
                ? sessionIdComponent
                : collaborationBttnComponent}
        </>
    )
}

export default SessionDisplay
