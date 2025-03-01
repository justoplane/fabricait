import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Define the structure for the response format
const defaultStructure = {
  type: "json_schema" as const, // Ensure it's exactly "json_schema"
  json_schema: {
    name: "output",
    schema: {
      type: "object",
      properties: {
        reasoning: { type: "string" },
        output: { type: "string" }
      },
      required: ["reasoning", "output"],
      additionalProperties: false
    },
    strict: true
  }
};

// Define message types for OpenAI
type MessageRole = "system" | "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string | { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[];
}

export class PromptManager {
  private dialog: Message[];

  constructor(preprompt: string) {
    this.dialog = [{ role: "system", content: preprompt }];
  }

  public createMessage(role: MessageRole, content: string): Message {
    return { role, content };
  }

  public addQuoteToDialog(message: string, author: MessageRole) {
    this.dialog.push(this.createMessage(author, message));
  }

  public async stringAction(quote: Message) {
    this.dialog.push(quote);

    const client = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.dialog as any, // Ensure messages align with OpenAI API expectations
      response_format: defaultStructure as any
    });

    const outStruct = response.choices[0].message;
    this.addQuoteToDialog(outStruct.content as string, "assistant");

    return outStruct;
  }

  public async imageAction(promptStr: string) {
    const base64Image = this.encodeImage("./assets/image.png");

    const quote: Message = {
      role: "user",
      content: [
        { type: "text", text: promptStr },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
      ]
    };

    this.dialog.push(quote);

    const client = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.dialog as any,
      response_format: defaultStructure as any
    });

    const outStruct = response.choices[0].message;
    if (!outStruct.refusal) {
      this.addQuoteToDialog(outStruct.content as string, "assistant");
    }

    return outStruct;
  }

  private encodeImage(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString("base64");
  }
}
