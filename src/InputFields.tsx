import React from 'react'

interface InputFieldsProps {
    inputs: Record<string, string>
    handleInputChange: (name: string, value: string) => void
}

// Function to convert placeholder id to a more readable format
const formatPlaceholder = (id: string): string => {
    return id
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const sanitizeField = (field: string): string => {
    return field.replace(/[^a-zA-Z0-9-_]/g, '')
}

const InputFields: React.FC<InputFieldsProps> = ({
    inputs,
    handleInputChange,
}) => {
    return (
        <>
            {Object.keys(inputs).map((field, index) => (
                <input
                    key={index}
                    type="text"
                    name={sanitizeField(field)}
                    placeholder={formatPlaceholder(field)}
                    value={inputs[field]}
                    onChange={(e) => {
                        handleInputChange(field, e.target.value)
                    }}
                />
            ))}
        </>
    )
}

export default InputFields
