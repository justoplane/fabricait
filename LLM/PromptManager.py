import base64
import os
from openai import OpenAI

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
    
# default structure
default_structure = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "output",
                        "schema": {
                        "type": "string",
                        "required": ["reasoning", "output"],
                        "additionalProperties": False
                        },
                        "strict": True
                    }
}

class PromptManager:
    
    def __init__(self, preprompt):
        instructions = ""
        instructions += preprompt
        
        self.dialog = [{"role": "system", "content": instructions}]
            
    def systemQuote(self, message):
        return {"role": "system", "content": message}

    def assistantQuote(self, message):
        return {"role": "assistant", "content": message}

    def userQuote(self, message):
        return {"role": "user", "content": message}

    def addQuoteToDialog(self, message, author):        
        match author.strip().lower():
            case "system":
                quote =  self.systemQuote(message)
            case "assistant":
                quote =  self.assistantQuote(message)
            case "user":
                quote = self.userQuote(message)
            case _:
                raise ValueError("Invalid author. Expected 'system', 'assistant', or 'user'.")
            
        self.dialog.append(quote)
        
    def stringAction(self, quote, structure = default_structure):
        self.dialog.append(quote)
        
        client = OpenAI(api_key = os.getenv("OPEN_API_KEY"))
        response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages = self.dialog,
                    response_format = structure 
        )
        out_struct = response.choices[0].message
        self.addQuoteToDialog(out_struct.content, "assistant")        
        return out_struct
    
    def imageAction(self, image_path, prompt_str, structure = default_structure):
        quote = self.userQuote(prompt_str)
        
        base64_image = encode_image(image_path)
        quote["content"] = [{"type": "text","text": quote["content"]},{"type": "image_url","image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]
        self.dialog.append(quote)
        
        client = OpenAI(api_key = os.getenv("OPEN_API_KEY"))
        response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages = self.dialog,
                    response_format = structure
        )
        
        out_struct = response.choices[0].message
        if(not out_struct.refusal):
            self.addQuoteToDialog(out_struct.content, "assistant")        
            
        return out_struct
    
