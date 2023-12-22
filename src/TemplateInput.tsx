import React, { useState } from 'react'
import FileUpload from './FileUpload'

interface TemplateInputProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onManualInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    inputData: string
    infoText?: string
    fileInputLabel: string
    textAreaPlaceholder: string
}

const TemplateInput: React.FC<TemplateInputProps> = ({
    onFileUpload,
    onManualInput,
    inputData,
    infoText,
    fileInputLabel,
    textAreaPlaceholder,
}) => {
    const [useFileUpload, setUseFileUpload] = useState(false)

    const toggleInputMethod = (): void => {
        setUseFileUpload(!useFileUpload)
    }

    const fileUploadComponent = (
        <FileUpload
            label={fileInputLabel}
            onChange={onFileUpload}
            infoText={infoText}
        />
    )
    const textInputComponent = (
        <textarea
            value={inputData}
            onChange={onManualInput}
            placeholder={textAreaPlaceholder}
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
