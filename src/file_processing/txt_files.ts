export const processTemplateFile = (
  file: File
): Promise<{ template: string; fields: string[] }> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const result = e.target!.result;
      if (typeof result === "string") {
        const fields = result.match(/{(.*?)}/g) || [];
        const uniqueFields = Array.from(
          new Set(fields.map((field) => field.replace(/[{}]/g, "")))
        );
        resolve({ template: result, fields: uniqueFields });
      } else {
        reject("File content is not a string.");
      }
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsText(file);
  });
};

export const extractTemplateFields = (template: string): string[] => {
  const fieldPattern = /{(.*?)}/g;
  const fields = new Set<string>();
  let match;

  while ((match = fieldPattern.exec(template)) !== null) {
    fields.add(match[1]);
  }

  return Array.from(fields);
};
