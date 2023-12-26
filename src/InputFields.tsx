import React from 'react'

interface InputFieldsProps {
    inputs: Record<string, string>
    handleInputChange: (name: string, value: string) => void
    sanitizeField: (field: string) => string
    formatPlaceholder: (id: string) => string
}

const InputFields: React.FC<InputFieldsProps> = ({
    inputs,
    handleInputChange,
    sanitizeField,
    formatPlaceholder,
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
