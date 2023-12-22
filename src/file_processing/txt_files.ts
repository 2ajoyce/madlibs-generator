const getFields = (result: string): RegExpMatchArray | [] => {
    const fields = result.match(/{(.*?)}/g)
    if (fields != null) {
        return fields
    } else {
        return []
    }
}

export const processTemplateFile = async (
    file: File,
): Promise<{ template: string; fields: string[] }> => {
    return await new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            const result = e.target?.result
            if (typeof result === 'string') {
                const fields = getFields(result)
                const uniqueFields = Array.from(
                    new Set(fields.map((field) => field.replace(/[{}]/g, ''))),
                )
                resolve({ template: result, fields: uniqueFields })
            } else {
                reject(new Error('File content is not a string.'))
            }
        }
        fileReader.onerror = (error) => {
            reject(error)
        }
        fileReader.readAsText(file)
    })
}

export const extractTemplateFields = (template: string): string[] => {
    const fieldPattern = /{(.*?)}/g
    const fields = new Set<string>()
    let match

    while ((match = fieldPattern.exec(template)) !== null) {
        fields.add(match[1])
    }

    return Array.from(fields)
}
