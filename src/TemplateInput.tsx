import React, { useState } from 'react'
import FileUpload from './FileUpload'

interface TemplateInputProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onManualInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    inputData: string
}

const TEXT_AREA_PLACEHOLDER =
    'Type your {awesome} template here! Use curly braces to indicate placeholders.'

const TemplateInput: React.FC<TemplateInputProps> = ({
    onFileUpload,
    onManualInput,
    inputData,
}) => {
    const [useFileUpload, setUseFileUpload] = useState(false)

    const toggleInputMethod = (): void => {
        setUseFileUpload(!useFileUpload)
    }

    const fileUploadComponent = (
        <FileUpload
            onChange={onFileUpload}
        />
    )
    const textInputComponent = (
        <textarea
            value={inputData}
            onChange={onManualInput}
            placeholder={TEXT_AREA_PLACEHOLDER}
        />
    )

    return (
        <div className="upload-container">
            <div className="button-container">
                <button onClick={toggleInputMethod}>
                    {useFileUpload ? 'Type Manually' : 'Upload File'}
                </button>
            </div>
            {useFileUpload ? fileUploadComponent : textInputComponent}
        </div>
    )
}

export default TemplateInput
