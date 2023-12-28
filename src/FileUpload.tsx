import React from 'react'

const FILE_INPUT_LABEL = 'Upload Story Template'
const INFO_TEXT =
    'Use curly braces {} to indicate placeholders in the template. For example, {noun}, {verb}, {adjective}.'

interface FileUploadProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
    onChange,
    disabled = false,
}) => {
    const id = FILE_INPUT_LABEL.toLowerCase().replace(/\s+/g, '-')
    const infoIconComponent = (
        <span className="info-icon" title={INFO_TEXT}>
            &#9432;
        </span>
    )

    return (
        <div className="upload-box">
            <label htmlFor={id}>{FILE_INPUT_LABEL}:</label>
            {infoIconComponent}
            <input
                type="file"
                id={id}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    )
}

export default FileUpload
