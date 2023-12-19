import { ChangeEvent, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";
import FileUpload from "./FileUpload";
import InputFields from "./InputFields";
import PeerManager from "./PeerManager";
import SessionDisplay from "./SessionDisplay";
import { processTemplateFile } from "./file_processing/txt_files";
import {
  createSpreadsheetData,
  processUploadedFile,
} from "./file_processing/xlsx_files";

type Inputs = {
  [key: string]: string;
};

function App() {
  const [template, setTemplate] = useState("");
  const [templateFields, setTemplateFields] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Inputs>({});
  const [story, setStory] = useState("");
  // sessionId is intended to store the parent session. Current session can be retrieved from peer.id
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  let peerManager: PeerManager | null = null;

  const getSessionIdFromPath = () => {
    let params = new URLSearchParams(document.location.search);
    const newSessionId = params.get("sessionId");
    if (newSessionId) {
      console.log(`Found sessionId ${newSessionId} in path.`);
      setSessionId(newSessionId);
    } else {
      console.log("No sessionId found in path");
    }
  };

  useEffect(() => {
    getSessionIdFromPath();
  }, []);

  const createPeer = (sessionId?: string) => {
    peerManager = PeerManager.getInstance();
    peerManager.createPeer(sessionId);
    setPeerId(peerManager.peer ? peerManager.peer?.id : null);

    return () => {
      peerManager?.destroyPeer();
    };
  };

  useEffect(() => {
    if (sessionId) {
      createPeer(sessionId);
    }
  }, [sessionId]);

  const handleCollaborateClick = async () => {
    try {
      createPeer();
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleTemplateUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length === 1) {
      processTemplateFile(event.target.files[0])
        .then(({ template, fields }) => {
          setTemplate(template); // Update template in state
          setTemplateFields(fields); // Update template fields in state
          // Reset inputs or perform any additional state updates
        })
        .catch((error) => {
          console.error("Error processing file:", error);
        });
    }
  };

  const handlePlayerWordsUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length === 1) {
      processUploadedFile(event.target.files[0])
        .then((data) => {
          const newData = Object.keys(data).reduce<{ [key: string]: string }>(
            (acc, id) => {
              const formattedId = id.replace(/\s+/g, "-").toLowerCase();
              if (templateFields.includes(formattedId)) {
                acc[formattedId] = data[id];
              }
              return acc;
            },
            {}
          );

          setInputs(newData);
        })
        .catch((error) => {
          console.error("Error processing file:", error);
        });
    }
  };

  // Function to convert placeholder id to a more readable format
  const formatPlaceholder = (id: string) => {
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleInputChange = (name: string, value: string) => {
    setInputs({ ...inputs, [name]: value });
  };

  const generateStory = () => {
    let storyTemplate = template; // Use the saved template

    Object.keys(inputs).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g"); // Create a regex to match the placeholder
      storyTemplate = storyTemplate.replace(regex, inputs[key]);
    });

    setStory(storyTemplate);
  };

  const generateSpreadsheet = () => {
    const workbook = createSpreadsheetData(templateFields);

    // Generate Excel file
    XLSX.writeFile(workbook, "madlibs_input.xlsx");
  };

  const sanitizeField = (field: string) => {
    return field.replace(/[^a-zA-Z0-9-_]/g, "");
  };

  // Check conditions for enabling the "Generate Spreadsheet" button
  const canGenerateSpreadsheet = templateFields.length > 0;

  // Check conditions for enabling the "Generate Story" button
  const canGenerateStory =
    templateFields.length > 0 &&
    Object.keys(inputs).length === templateFields.length &&
    Object.values(inputs).every((value) => value.trim() !== "");

  // Check conditions for enabling the "Upload Player Words" input
  const canUploadPlayerWords = templateFields.length > 0;

  return (
    <>
      <h1>Madlibs Generator</h1>
      <SessionDisplay
        sessionId={sessionId}
        peerId={peerId}
        handleCollaborateClick={handleCollaborateClick}
      />
      <div className="upload-container">
        <FileUpload
          label="Upload Story Template"
          onChange={handleTemplateUpload}
          infoText="Use curly braces {} to indicate placeholders in the template. For example, {noun}, {verb}, {adjective}."
        />
        <FileUpload
          label="Upload Player Words"
          onChange={handlePlayerWordsUpload}
          disabled={!canUploadPlayerWords}
        />
      </div>
      <div className="card">
        <div className="button-container">
          <button
            onClick={generateSpreadsheet}
            disabled={!canGenerateSpreadsheet}
          >
            Generate Spreadsheet
          </button>
        </div>
        <InputFields
          templateFields={templateFields}
          inputs={inputs}
          handleInputChange={handleInputChange}
          sanitizeField={sanitizeField}
          formatPlaceholder={formatPlaceholder}
        />
      </div>
      <div className="button-container">
        <button onClick={generateStory} disabled={!canGenerateStory}>
          Generate Story
        </button>
      </div>
      {story && <pre className="story-output">{story}</pre>}
    </>
  );
}

export default App;
