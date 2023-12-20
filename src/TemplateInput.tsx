import React, { useState } from "react";
import FileUpload from "./FileUpload";

type TemplateInputProps = {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManualInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  template: string;
  infoText?: string;
};

const TemplateInput: React.FC<TemplateInputProps> = ({
  onFileUpload,
  onManualInput,
  template,
  infoText,
}) => {
  const [useFileUpload, setUseFileUpload] = useState(false);

  const toggleInputMethod = () => {
    setUseFileUpload(!useFileUpload);
  };

  return (
    <div className="upload-container">
      <div className="button-container">
        <button onClick={toggleInputMethod}>
          {useFileUpload ? "Type Template Manually" : "Upload Template File"}
        </button>
      </div>
      {useFileUpload ? (
        <FileUpload
          label="Upload Story Template"
          onChange={onFileUpload}
          infoText={infoText}
        />
      ) : (
        <textarea
          value={template}
          onChange={onManualInput}
          placeholder="Type your template here..."
        />
      )}
    </div>
  );
};

export default TemplateInput;
