import * as XLSX from 'xlsx';

export const processUploadedFile = (file: File): Promise<{ [key: string]: string }> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const arrayBuffer = e.target!.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: Array<any[]> = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        blankrows: false,
        defval: null,
      });

      // Process data and return it
      const processedData = data
        .slice(1)
        .reduce<{ [key: string]: string }>((acc, row) => {
          const [id, , playerInput] = row.map(String);
          acc[id] = playerInput;
          return acc;
        }, {});
      
      resolve(processedData);
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsArrayBuffer(file);
  });
};

export const createSpreadsheetData = (templateFields: string[]): XLSX.WorkBook => {
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
  return workbook;
};
