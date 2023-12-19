import React from "react";

type FileUploadProps = {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  infoText?: string;
};

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onChange,
  disabled = false,
  infoText,
}) => {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="upload-box">
      <label htmlFor={id}>{label}:</label>
      {infoText && (
        <span
          className="info-icon"
          title={infoText}
        >
          &#9432;
        </span>
      )}
      <input
        type="file"
        id={id}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload;
