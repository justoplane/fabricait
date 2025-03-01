import * as fs from 'fs/promises';

interface CustomParameter {
    param_name: string;
    value: number;
    description: string;
}

export async function extractCustomParameters(): Promise<CustomParameter[]> {
    const data = await fs.readFile('./assets/input.scad', 'utf-8');
    const lines = data.split('\n');
    const startIdx = lines.findIndex(line => line.includes("/* START CUSTOM PARAMETERS */"));
    const endIdx = lines.findIndex(line => line.includes("/* END CUSTOM PARAMETERS */"));
    
    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
        console.error("Error: Could not find valid custom parameters section.");
        return [];
    }
    
    const paramLines = lines.slice(startIdx + 1, endIdx);
    const parameters: CustomParameter[] = [];
    
    for (const line of paramLines) {
        const match = line.match(/(\w+)\s*=\s*([0-9.]+);\s*\/\/\s*(.*)/);
        if (match) {
            parameters.push({
                param_name: match[1],
                value: parseFloat(match[2]),
                description: match[3].trim()
            });
        }
    }
    
    return parameters;
}

export async function writeCustomParameters(input: string, parameters: CustomParameter[], outputPath: string): Promise<void> {
    const lines = input.split('\n');
    const startIdx = lines.findIndex(line => line.includes("/* START CUSTOM PARAMETERS */"));
    const endIdx = lines.findIndex(line => line.includes("/* END CUSTOM PARAMETERS */"));
    
    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
        console.error("Error: Could not find valid custom parameters section.");
    }
    
    const paramLines = lines.slice(startIdx + 1, endIdx);
    
    // Remove old parameter lines
    lines.splice(startIdx + 1, paramLines.length);
    
    // Add updated parameters
    parameters.forEach(param => {
        lines.splice(startIdx + 1, 0, `${param.param_name} = ${param.value};  // ${param.description}`);
    });
    
    const output = lines.join('\n');

    await fs.writeFile(outputPath, output, 'utf8');
    console.log(`SCAD content successfully written to ${outputPath}`);
}

export async function extractAndWriteSCAD(content: string, outputPath: string) {
    try {
        // Parse the JSON content
        const parsedContent = JSON.parse(content);
        
        // Extract the 'output' value
        const scadContent = parsedContent.output;
        
        // Write to the output file
        await fs.writeFile(outputPath, scadContent, 'utf8');
        console.log(`SCAD content successfully written to ${outputPath}`);
    } catch (error) {
        console.error("Error parsing JSON content or writing to file:", error);
    }
}