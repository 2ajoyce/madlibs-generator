import React from 'react'

interface SessionDisplayProps {
  sessionId: string | null
  peerId: string | null
  handleCollaborateClick: () => void
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({
  sessionId,
  peerId,
  handleCollaborateClick
}) => {
  const getId = () => sessionId || peerId

  return (
    <>
      {getId()
        ? (
        <div className="button-container">
          Session:{' '}
          <a href={`${window.location.href}?sessionId=${getId()}`}>{getId()}</a>
        </div>
          )
        : (
        <div className="button-container">
          <button onClick={handleCollaborateClick}>Collaborate</button>
        </div>
          )}
    </>
  )
}

export default SessionDisplay
