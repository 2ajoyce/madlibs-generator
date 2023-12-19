import React from "react";

type InputFieldsProps = {
  templateFields: string[];
  inputs: { [key: string]: string };
  handleInputChange: (name: string, value: string) => void;
  sanitizeField: (field: string) => string;
  formatPlaceholder: (id: string) => string;
};

const InputFields: React.FC<InputFieldsProps> = ({
  templateFields,
  inputs,
  handleInputChange,
  sanitizeField,
  formatPlaceholder,
}) => {
  return (
    <>
      {templateFields.map((field, index) => (
        <input
          key={index}
          type="text"
          name={sanitizeField(field)}
          placeholder={formatPlaceholder(field)}
          value={inputs[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
        />
      ))}
    </>
  );
};

export default InputFields;
