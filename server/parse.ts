import * as fs from 'fs/promises';

interface CustomParameter {
    param_name: string;
    value: number;
    description: string;
}

export async function extractCustomParameters(input: string): Promise<CustomParameter[]> {
    const lines = input.split('\n');
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

export async function extractAndWriteSCAD(input: string, outputPath: string) {
    // Split the input string into lines
    const lines = input.split('\n');
    
    // Find the index of the line containing "### BEGIN SCAD"
    const startIndex = lines.findIndex(line => line.includes("### BEGIN SCAD"));
    
    if (startIndex === -1) {
        console.error("Error: '### BEGIN SCAD' not found in input.");
        return;
    }
    
    // Extract everything below "### BEGIN SCAD"
    const scadContent = lines.slice(startIndex + 1).join('\n');
    
    // Write to the output file
    await fs.writeFile(outputPath, scadContent, 'utf8');
    console.log(`SCAD content successfully written to ${outputPath}`);
}