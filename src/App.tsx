import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

type Inputs = {
  [key: string]: string;
};

function App() {
  const [template, setTemplate] = useState("");
  const [templateFields, setTemplateFields] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Inputs>({});
  const [story, setStory] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [webrtcDetails, setWebrtcDetails] = useState<any | null>(null);
  const REGISTER_SESSION_URL =
    "https://us-central1-madlibs-408303.cloudfunctions.net/register-session";

  // Function to register a new session
  async function registerSession(webrtcDetails: any): Promise<string> {
    try {
      const response = await fetch(REGISTER_SESSION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webrtcDetails),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error("Error registering session:", error);
      throw error;
    }
  }

  // Function to get session details
  async function getSession(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${REGISTER_SESSION_URL}/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  }

  const handleCollaborateClick = async () => {
    try {
      const newSessionId = await registerSession(webrtcDetails);
      setSessionId(newSessionId);
      console.log("Session created with ID:", newSessionId);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleTemplateUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length === 1) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        // Parse the file content to extract the placeholders and save the template
        const result = e.target!.result;
        if (typeof result === "string") {
          setTemplate(result); // Save the entire template content
          const fields = result.match(/{(.*?)}/g);
          if (fields) {
            // Remove duplicates by converting the list to a Set and then back to an array
            const uniqueFields = Array.from(
              new Set(fields.map((field: string) => field.replace(/[{}]/g, "")))
            );
            setTemplateFields(uniqueFields);
          }
          // Reset inputs
        }
      };
      fileReader.readAsText(event.target.files[0]);
    }
  };

  const handlePlayerWordsUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length === 1) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const arrayBuffer = e.target!.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Explicitly declare that each row is an array of any type
        const data: Array<any[]> = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
          defval: null,
        });

        // Skip the header row and start processing from the second row
        const newData = data
          .slice(1)
          .reduce<{ [key: string]: string }>((acc, row) => {
            const [id, , playerInput] = row.map(String); // Convert all elements to strings
            // Convert ID back to the format used in templateFields if necessary
            const formattedId = id.replace(/\s+/g, "-").toLowerCase();
            if (templateFields.includes(formattedId)) {
              acc[formattedId] = playerInput;
            }
            return acc;
          }, {});

        setInputs(newData);
      };

      fileReader.readAsArrayBuffer(event.target.files[0]);
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
    const workbook = XLSX.utils.book_new();
    const sheetName = "Madlibs Input";
    const ws_data = [["ID", "Type of Word", "Input"]];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    templateFields.forEach((field) => {
      const id = field;
      const typeOfWord = field
        .split("-")
        .slice(0, -1)
        .join(" ")
        .replace(/^\w/, (c) => c.toUpperCase());
      const newRow = [id, typeOfWord, ""];
      XLSX.utils.sheet_add_aoa(ws, [newRow], { origin: -1 });
    });

    XLSX.utils.book_append_sheet(workbook, ws, sheetName);

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
      {sessionId ? (
        <div>
          Session:{" "}
          <a href="https://2ajoyce.github.io/madlibs-generator/{sessionId}">
            2ajoyce.github.io/madlibs-generator/{sessionId}
          </a>
        </div>
      ) : (
        <button onClick={handleCollaborateClick}>Collaborate</button>
      )}
      <div className="upload-container">
        <div className="upload-box">
          <label htmlFor="template-upload">Upload Story Template:</label>
          <span
            className="info-icon"
            title="Use curly braces {} to indicate placeholders in the template. For example, {noun}, {verb}, {adjective}."
          >
            &#9432;
          </span>
          <input
            type="file"
            id="template-upload"
            onChange={handleTemplateUpload}
          />
        </div>
        <div className="upload-box">
          <label htmlFor="words-upload">Upload Player Words:</label>
          <input
            type="file"
            id="words-upload"
            onChange={handlePlayerWordsUpload}
            disabled={!canUploadPlayerWords}
          />
        </div>
      </div>
      <div className="card">
        <div className="generate-spreadsheet-container">
          <button
            onClick={generateSpreadsheet}
            disabled={!canGenerateSpreadsheet}
          >
            Generate Spreadsheet
          </button>
        </div>
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
