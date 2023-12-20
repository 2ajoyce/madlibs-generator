import React, { useState } from "react";
import FileUpload from "./FileUpload";

type TemplateInputProps = {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManualInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inputData: string;
  infoText?: string;
  fileInputLabel: string;
  textAreaPlaceholder: string;
};

const TemplateInput: React.FC<TemplateInputProps> = ({
  onFileUpload,
  onManualInput,
  inputData,
  infoText,
  fileInputLabel,
  textAreaPlaceholder,
}) => {
  const [useFileUpload, setUseFileUpload] = useState(false);

  const toggleInputMethod = () => {
    setUseFileUpload(!useFileUpload);
  };

  return (
    <div className="upload-container">
      <div className="button-container">
        <button onClick={toggleInputMethod}>
          {useFileUpload ? "Type Manually" : "Upload File"}
        </button>
      </div>
      {useFileUpload ? (
        <FileUpload
          label={fileInputLabel}
          onChange={onFileUpload}
          infoText={infoText}
        />
      ) : (
        <textarea
          value={inputData}
          onChange={onManualInput}
          placeholder={textAreaPlaceholder}
        />
      )}
    </div>
  );
};

export default TemplateInput;
