from PromptManager import PromptManager
from PrepromptGenerator import preprompt

PM = PromptManager(preprompt)
out = PM.userAction("Create a basketball hoop")

print(out)