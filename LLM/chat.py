from pydantic import BaseModel
from openai import OpenAI
import os

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

client = OpenAI(api_key = os.getenv("OPEN_API_KEY"))
response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
                {"role": "user", "content": "how can I solve 8x + 7 = -23"}
            ],
            response_format = {
                "type": "json_schema",
                "json_schema": {
                    "name": "math_reasoning",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "steps": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "explanation": {"type": "string"},
                                        "output": {"type": "string"}
                                    },
                                    "required": ["explanation", "output"],
                                    "additionalProperties": False
                                }
                            },
                            "final_answer": {"type": "string"}
                        },
                        "required": ["steps", "final_answer"],
                        "additionalProperties": False
                    },
                    "strict": True
                }
            }
)

math_reasoning = response.choices[0].message.content
print(math_reasoning)
