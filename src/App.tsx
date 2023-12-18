import { Peer } from "peerjs";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
  // sessionId is intended to store the parent session. Current session can be retrieved from peer.id
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);

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

  useEffect(() => {
    if (sessionId) {
      console.log(`Creating peer for sessionId ${sessionId}`);
      createPeer();
    }
  }, [sessionId]);

  useEffect(() => {
    if (peer?.id) {
      console.log("Session created with ID:", peer.id);
      if (sessionId) {
        console.log(`Connecting to session ${sessionId}`);
        const conn = peer.connect(sessionId);
        conn.on("open", () => {
          console.log("Connection Established!");
          conn.on("data", function (data) {
            console.log("Received", data);
          });

          conn.send("Hello!");
        });

        conn.on("error", (err) => {
          console.log("Connection Error: ", err);
        });
      }
    }
  }, [peer]);

  const createPeer = () => {
    if (peer) return peer;
    const newSessionId = uuidv4();
    const SERVER_URI = "https://madlibs-server-xxnwdd2lpq-uc.a.run.app";
    const SERVER_KEY = "d41d8cd98f00b204e9800998ecf8427e";
    const SERVER_CONNECTION = {
      host: SERVER_URI,
      port: 443,
      ping: 1000 * 15, // 15s ping
      secure: true,
      debug: 2,
      key: SERVER_KEY,
    };
    const newPeer = new Peer(newSessionId, SERVER_CONNECTION);
    newPeer.on("open", (id) => {
      console.log(`My peer ID is ${id}`);
    });
    newPeer.on("connection", (conn) => {
      console.log(`Incoming connection with ${conn.connectionId}`);
      conn.send("Hello!");
    });
    setPeer(newPeer);
  };

  const handleCollaborateClick = async () => {
    try {
      createPeer();
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

  const getId = (): string | undefined => {
    return sessionId ? sessionId : peer?.id;
  };

  return (
    <>
      <h1>Madlibs Generator</h1>
      {getId() ? (
        <div>
          Session:{" "}
          <a href={`${window.location.href}?sessionId=${getId()}`}>{getId()}</a>
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
