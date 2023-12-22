import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react'
import './App.css'
import InputFields from './InputFields'
import PeerManager from './PeerManager'
import SessionDisplay from './SessionDisplay'
import TemplateInput from './TemplateInput'
import {
    extractTemplateFields,
    processTemplateFile,
} from './file_processing/txt_files'

type Inputs = Record<string, string>

function App(): ReactElement {
    const [template, setTemplate] = useState('')
    const [templateFields, setTemplateFields] = useState<string[]>([])
    const [inputs, setInputs] = useState<Inputs>({})
    const [story, setStory] = useState('')
    // sessionId is intended to store the parent session. Current session can be retrieved from peer.id
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [peerId, setPeerId] = useState<string | null>(null)

    const peerManager: PeerManager = PeerManager.getInstance()

    const getSessionIdFromPath = (): void => {
        const params = new URLSearchParams(document.location.search)
        const newSessionId = params.get('sessionId')
        if (newSessionId != null) {
            console.log(`Found sessionId ${newSessionId} in path.`)
            setSessionId(newSessionId)
        } else {
            console.log('No sessionId found in path')
        }
    }

    useEffect(() => {
        getSessionIdFromPath()
    }, [])

    const createPeer = async (sessionId?: string): Promise<() => void> => {
        await peerManager.createPeer().then(async () => {
            if (peerManager.peer != null) {
                setPeerId(peerManager.peer?.id)
                if (sessionId != null) {
                    await peerManager.connectToPeer(sessionId).then(() => {
                        peerManager
                            .sendToPeer(sessionId, 'Hello, peer!')
                            .catch((reason): void => {
                                console.log(
                                    'sendToPeer failed with reason: ',
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
        window.alert('This feature is still under active development')
        createPeer().catch(console.error)
    }

    const handleTemplateUpload = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        if (event.target.files?.length === 1) {
            processTemplateFile(event.target.files[0])
                .then(({ template, fields }) => {
                    setTemplate(template) // Update template in state
                    setTemplateFields(fields) // Update template fields in state
                    // Reset inputs or perform any additional state updates
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
        const fields = extractTemplateFields(newTemplate)
        setTemplateFields(fields)
    }

    // Function to convert placeholder id to a more readable format
    const formatPlaceholder = (id: string): string => {
        return id
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const handleInputChange = (name: string, value: string): void => {
        setInputs({ ...inputs, [name]: value })
    }

    const generateStory = (): void => {
        let storyTemplate = template // Use the saved template

        Object.keys(inputs).forEach((key) => {
            const regex = new RegExp(`{${key}}`, 'g') // Create a regex to match the placeholder
            storyTemplate = storyTemplate.replace(regex, inputs[key])
        })

        setStory(storyTemplate)
    }

    const sanitizeField = (field: string): string => {
        return field.replace(/[^a-zA-Z0-9-_]/g, '')
    }

    // Check conditions for enabling the "Generate Story" button
    const canGenerateStory =
        templateFields.length > 0 &&
        Object.keys(inputs).length === templateFields.length &&
        Object.values(inputs).every((value) => value.trim() !== '')

    return (
        <>
            <h1>Madlibs Generator</h1>
            <SessionDisplay
                sessionId={sessionId}
                peerId={peerId}
                handleCollaborateClick={handleCollaborateClick}
            />
            <div className="upload-container">
                <TemplateInput
                    onFileUpload={handleTemplateUpload}
                    onManualInput={handleManualTemplateInput}
                    inputData={template}
                    fileInputLabel="Upload Story Template"
                    textAreaPlaceholder="Type your template here..."
                    infoText="Use curly braces {} to indicate placeholders in the template. For example, {noun}, {verb}, {adjective}."
                />
            </div>
            <div className="card">
                <InputFields
                    templateFields={templateFields}
                    inputs={inputs}
                    handleInputChange={handleInputChange}
                    sanitizeField={sanitizeField}
                    formatPlaceholder={formatPlaceholder}
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
