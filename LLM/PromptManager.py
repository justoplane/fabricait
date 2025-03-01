import os
from openai import OpenAI

class PromptManager:
    
    def __init__(self, preprompt):
        instructions = ""
        instructions += preprompt
        
        self.dialog = [{"role": "system", "content": instructions}]
            
    def addChatResponse(self, response):
        self.dialog.append({"role": "assistant", "content": response})
        
    def addUserString(self, s):
        self.dialog.append({"role": "user", "content": s})
        
    def userAction(self, usr_prompt, structure = None):
        self.addUserString(usr_prompt)
        
        client = OpenAI(api_key = os.getenv("OPEN_API_KEY"))
        response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages = self.dialog,
                    # response_format = structure 
        )
        data_out = response.choices[0].message.content
        self.addChatResponse(data_out)        
        return data_out
