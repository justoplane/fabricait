import json
from PromptManager import PromptManager
import PrepromptGenerator 
import os

OpenSCAD_structure = {
                "type": "json_schema",
                "json_schema": {
                    "name": "openscad_reasoning",
                    "schema": {
                    "type": "object",
                    "properties": {
                        "reasoning": { "type": "string" },
                        "output": { "type": "string" }
                    },
                    "required": ["reasoning", "output"],
                    "additionalProperties": False
                    },
                    "strict": True
                }
}

PM = PromptManager(PrepromptGenerator.getPreprompt())
usrString = input()
out = PM.stringAction(PM.userQuote(usrString), OpenSCAD_structure)

# Deserialize the JSON string and print output
data = json.loads(out.content)
output_scad = data["output"]
print(output_scad)

## FEEDBACK
# Construct the correct file path
current_dir = os.path.dirname(__file__)
image_path = os.path.join(current_dir, "output.png")

# Generate new output
out = PM.imageAction(image_path, PrepromptGenerator.getFeedbackPrompt(), OpenSCAD_structure)
if (not out.refusal):
    data = json.loads(out.content)
    output_scad = data["output"]
    print(output_scad)
else:
    print(out.refusal)


