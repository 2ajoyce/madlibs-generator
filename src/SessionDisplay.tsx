import React from 'react'

interface SessionDisplayProps {
    sessionId: string | null
    peerId: string | null
    handleCollaborateClick: () => void
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({
    sessionId,
    peerId,
    handleCollaborateClick,
}) => {
    const getId = (): string => {
        if (sessionId != null) return sessionId
        else if (peerId != null) return peerId
        else return ''
    }

    const sessionIdComponent = (
        <div className="button-container">
            Session:{' '}
            <a href={`${window.location.href}?sessionId=${getId()}`}>
                {getId()}
            </a>
        </div>
    )

    const collaborationBttnComponent = (
        <div className="button-container">
            <button onClick={handleCollaborateClick}>Collaborate</button>
        </div>
    )

    return (
        <>{getId() !== '' ? sessionIdComponent : collaborationBttnComponent}</>
    )
}

export default SessionDisplay
