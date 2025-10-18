import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react'
import './App.css'
import InputFields from './InputFields'
import PeerManager, {
    MadlibsMessageType,
    type MadlibsMessage,
} from './PeerManager'
import SessionDisplay from './SessionDisplay'
import TemplateInput from './TemplateInput'
import {
    extractTemplateFields,
    processTemplateFile,
} from './file_processing/txt_files'

const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function App(): ReactElement {
    const [template, setTemplate] = useState('')
    const [inputs, setInputs] = useState<Record<string, string>>({})
    const [story, setStory] = useState('')
    // sessionId is intended to store the parent session. Current peer can be retrieved from peer.id
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [peerId, setPeerId] = useState<string | null>(null)
    const [collaborators, setCollaborators] = useState<string[]>([])

    const peerManager: PeerManager = PeerManager.getInstance()

    const getSessionIdFromPath = (): void => {
        const params = new URLSearchParams(document.location.search)
        const newSessionId = params.get('sessionId')
        if (newSessionId != null) {
            console.debug(`Found sessionId ${newSessionId} in path.`)
            setSessionId(newSessionId)
        } else {
            console.debug('No sessionId found in path')
        }
    }

    useEffect(() => {
        getSessionIdFromPath()
    }, [])

    useEffect(() => {
        const fields = extractTemplateFields(template)
        const newInputs: Record<string, string> = {}
        for (const field of fields) {
            newInputs[field] = Object.keys(inputs).includes(field)
                ? inputs[field]
                : ''
        }
        setInputs(newInputs)
    }, [template])

    useEffect(() => {
        const sendInitialState = async (): Promise<void> => {
            const mostRecentPeerId =
                collaborators.length > 0
                    ? collaborators[collaborators.length - 1]
                    : undefined
            if (mostRecentPeerId !== undefined) {
                await peerManager.sendMessage(mostRecentPeerId, {
                    type: MadlibsMessageType.InitialState,
                    peerId: peerId ?? '',
                    data: {
                        template,
                        inputs,
                    },
                })
            }
        }

        if (collaborators.length > 0) {
            sendInitialState().catch(console.error)
        }
    }, [collaborators])

    const setPeerCallbacks = (): void => {
        console.debug('Setting Peer Callbacks')
        peerManager.setDataReceivedCallback(
            [MadlibsMessageType.InputChange],
            handleInputMessage,
        )
        peerManager.setDataReceivedCallback(
            [MadlibsMessageType.TemplateChange],
            handleTemplateMessage,
        )
        peerManager.setDataReceivedCallback(
            [MadlibsMessageType.RequestState],
            handleRequestStateMessage,
        )
        peerManager.setDataReceivedCallback(
            [MadlibsMessageType.InitialState],
            handleInitialStateMessage,
        )
    }

    const handleRequestStateMessage = async (
        msg: MadlibsMessage,
    ): Promise<void> => {
        const requestingPeerId = msg.data.peerId as string
        peerManager.setDataReceivedCallback(
            [MadlibsMessageType.InitialState],
            handleInitialStateMessage,
        )
        setCollaborators((collaborators) => [
            ...collaborators,
            requestingPeerId,
        ])
    }
    const handleInitialStateMessage = async (
        msg: MadlibsMessage,
    ): Promise<void> => {
        const initialTemplate = msg.data.template as string
        const initialInputs = msg.data.inputs as Record<string, string>
        setTemplate(initialTemplate)
        setInputs(initialInputs)
    }

    const createPeer = async (sessionId?: string): Promise<() => void> => {
        await peerManager.createPeer().then(async () => {
            if (peerManager.peer != null) {
                setPeerId(peerManager.peer.id)
                setPeerCallbacks()
                // When the new peer is created it
                // - checks if it should connect to a session
                // - tries to connect to the session
                // - requests the current session state once successfully connected
                if (sessionId != null) {
                    await peerManager.connectToPeer(sessionId).then(() => {
                        peerManager
                            .sendMessage(sessionId, {
                                peerId: peerId ?? '',
                                type: MadlibsMessageType.RequestState,
                                data: { peerId: peerManager.peer?.id },
                            })
                            .catch((reason): void => {
                                console.debug(
                                    'sendMessage failed with reason: ',
                                    reason,
                                )
                            })
                    })
                }
            }
        })
        return () => {
            peerManager.destroyPeer().catch(console.error)
        }
    }

    useEffect(() => {
        const createPeerWithSessionId = async (
            sessionId: string,
        ): Promise<void> => {
            await createPeer(sessionId)
        }

        if (sessionId != null) {
            createPeerWithSessionId(sessionId).catch(console.error)
        }
    }, [sessionId])

    const handleCollaborateClick = (): void => {
        createPeer().catch(console.error)
    }

    const handleTemplateUpload = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        if (event.target.files?.length === 1) {
            processTemplateFile(event.target.files[0])
                .then(({ template }) => {
                    setTemplate(template)
                    sendTemplateMessage(template)
                })
                .catch((error) => {
                    console.error('Error processing file:', error)
                })
        }
    }

    const handleManualTemplateInput = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ): void => {
        const newTemplate = event.target.value
        setTemplate(newTemplate)
        sendTemplateMessage(newTemplate)
    }

    const handleInputChange = (name: string, value: string): void => {
        setInputs((inputs) => ({ ...inputs, [name]: value }))
        sendInputMessage(name, value)
    }
    const sendInputMessage = (name: string, value: string): void => {
        peerManager
            .sendMessageToAll({
                peerId: peerId ?? '',
                type: MadlibsMessageType.InputChange,
                data: { name, value },
            })
            .then(() => {
                console.debug('Message sent to all peers')
            })
            .catch((error) => {
                console.error('Error sending message to all peers:', error)
            })
    }

    const handleInputMessage = (msg: MadlibsMessage): void => {
        setInputs((inputs) => ({ ...inputs, [msg.data.name]: msg.data.value }))
        if (sessionId == null) {
            sendInputMessage(msg.data.name as string, msg.data.value as string)
        }
    }

    const sendTemplateMessage = (newTemplate: string): void => {
        peerManager
            .sendMessageToAll({
                peerId: peerId ?? '',
                type: MadlibsMessageType.TemplateChange,
                data: { template: newTemplate },
            })
            .then(() => {
                console.debug('Message sent to all peers')
            })
            .catch((error) => {
                console.error('Error sending message to all peers:', error)
            })
    }

    const handleTemplateMessage = (msg: MadlibsMessage): void => {
        const newTemplate = msg.data.template as string
        setTemplate(newTemplate)
        if (sessionId == null) {
            sendTemplateMessage(newTemplate)
        }
    }

    const generateStory = (): void => {
        let storyTemplate = template // Use the saved template

        Object.keys(inputs).forEach((key) => {
            const escapedKey = escapeRegExp(key)
            const regex = new RegExp(`{${escapedKey}}`, 'g') // Create a regex to match the placeholder
            storyTemplate = storyTemplate.replace(regex, inputs[key])
        })

        setStory(storyTemplate)
    }

    // Check conditions for enabling the "Generate Story" button
    const canViewTemplate = sessionId === null

    // Check conditions for enabling the "Generate Story" button
    const canGenerateStory =
        Object.keys(inputs).length > 0 &&
        Object.values(inputs).every((value) => value.trim() !== '')

    return (
        <>
            <h1>Madlibs Generator</h1>
            <SessionDisplay
                sessionId={sessionId ?? peerId}
                handleCollaborateClick={handleCollaborateClick}
            />
            {canViewTemplate && (
                <div className="upload-container">
                    <TemplateInput
                        onFileUpload={handleTemplateUpload}
                        onManualInput={handleManualTemplateInput}
                        inputData={template}
                    />
                </div>
            )}
            <div className="card">
                <InputFields
                    inputs={inputs}
                    handleInputChange={handleInputChange}
                />
            </div>
            <div className="button-container">
                <button onClick={generateStory} disabled={!canGenerateStory}>
                    Generate Story
                </button>
            </div>
            {story !== '' && <pre className="story-output">{story}</pre>}
        </>
    )
}

export default App
