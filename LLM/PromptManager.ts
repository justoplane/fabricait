import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

/**
 * Encodes an image file to a Base64 string.
 * @param imagePath Path to the image file.
 * @returns Base64 encoded string of the image.
 */
function encodeImage(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
}

/**
 * Default JSON schema structure for response formatting.
 */
const defaultStructure = {
    type: "json_schema",
    json_schema: {
        name: "output",
        schema: {
            type: "string",
            required: ["reasoning", "output"],
            additionalProperties: false
        },
        strict: true
    }
};

/**
 * Represents a single message in the conversation.
 */
type Message = {
    role: 'system' | 'assistant' | 'user';
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
};

/**
 * Manages chat prompts and responses using OpenAI.
 */
class PromptManager {
    private dialog: Message[];
    private client: OpenAI;

    constructor(preprompt: string) {
        this.dialog = [{ role: "system", content: preprompt }];
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    /**
     * Creates a system message object.
     */
    private systemQuote(message: string): Message {
        return { role: "system", content: message };
    }

    /**
     * Creates an assistant message object.
     */
    private assistantQuote(message: string): Message {
        return { role: "assistant", content: message };
    }

    /**
     * Creates a user message object.
     */
    private userQuote(message: string): Message {
        return { role: "user", content: message };
    }

    /**
     * Adds a message to the conversation history.
     * @param message The message content.
     * @param author The role of the message sender.
     */
    addQuoteToDialog(message: string, author: 'system' | 'assistant' | 'user'): void {
        const quoteMap = {
            system: this.systemQuote,
            assistant: this.assistantQuote,
            user: this.userQuote
        };

        if (!quoteMap[author]) {
            throw new Error("Invalid author. Expected 'system', 'assistant', or 'user'.");
        }

        this.dialog.push(quoteMap[author](message));
    }

    /**
     * Sends a text-based prompt to OpenAI and updates the dialog.
     * @param quote The user’s message.
     * @param structure Optional response format (default is JSON schema).
     * @returns The assistant's response.
     */
    async stringAction(quote: Message, structure = defaultStructure): Promise<Message> {
        this.dialog.push(quote);

        const response = await this.client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: this.dialog,
            response_format: structure
        });

        const outStruct = response.choices[0].message as Message;
        this.addQuoteToDialog(outStruct.content as string, "assistant");
        return outStruct;
    }

    /**
     * Sends an image and text prompt to OpenAI and updates the dialog.
     * @param imagePath Path to the image file.
     * @param promptStr The user’s text prompt.
     * @param structure Optional response format (default is JSON schema).
     * @returns The assistant's response.
     */
    async imageAction(imagePath: string, promptStr: string, structure = defaultStructure): Promise<Message> {
        const base64Image = encodeImage(imagePath);
        const quote: Message = {
            role: "user",
            content: [
                { type: "text", text: promptStr },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
        };

        this.dialog.push(quote);

        const response = await this.client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: this.dialog,
            response_format: structure
        });

        const outStruct = response.choices[0].message as Message;
        if (!(outStruct as any).refusal) {
            this.addQuoteToDialog(outStruct.content as string, "assistant");
        }

        return outStruct;
    }
}

export { PromptManager };
