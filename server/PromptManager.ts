import { config } from "dotenv";
import { OpenAI } from "openai";

config();

interface ChatMessage {
    role: "system" | "assistant" | "user";
    content: string;
}

export class PromptManager {
    private dialog: ChatMessage[];
    private client: OpenAI;

    constructor(preprompt: string) {
        this.dialog = [{ role: "system", content: preprompt }];
        this.client = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
    }

    addChatResponse(response: string): void {
        this.dialog.push({ role: "assistant", content: response });
    }

    addUserString(s: string): void {
        this.dialog.push({ role: "user", content: s });
    }

    async userAction(usrPrompt: string, structure?: any): Promise<string> {
        this.addUserString(usrPrompt);

        const response = await this.client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: this.dialog,
            // response_format: structure,
        });

        const dataOut = response.choices[0].message.content;
        if (dataOut !== null) {
            this.addChatResponse(dataOut);
        }
        console.log("Received AI response.");
        return dataOut ?? "";
    }
}
