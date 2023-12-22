import React from 'react'

interface FileUploadProps {
    label: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
    infoText?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    onChange,
    disabled = false,
    infoText,
}) => {
    const id = label.toLowerCase().replace(/\s+/g, '-')
    const infoIconComponent = (
        <span className="info-icon" title={infoText}>
            &#9432;
        </span>
    )

    return (
        <div className="upload-box">
            <label htmlFor={id}>{label}:</label>
            {infoText != null && infoIconComponent}
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
