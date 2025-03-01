#### ChatGPT Pre-prompt ####

# Moonsweeper
# HackUSU 2024

# Andrew Tolton, Elijah Tolton, Allan Torres, Alesandro Rodriguez

example1 = """
{
    "reasoning": "\nThe user wants a high-quality OpenSCAD model for an ornate dining chair with customizable parameters.\n\nI'll start by thinking through the design: legs, seat, back, arms, and ornate detailing. Key parameters will include seat width, height, backrest height, leg dimensions, and arm design.\n\nI'll implement these in OpenSCAD with variables that allow easy adjustments \u2014 things like seat thickness, backrest angle, and armrest height. I'll provide a code snippet with these customizable parameters for non-CAD users to compile.\n\nI'll set up the steps for generating each component using the customizable inputs.\n\nFor an ornate dining chair, I'll aim for detailed carvings, but since OpenSCAD has limitations with curved surfaces, I can create ornamental details through shape differences, fillets, or custom modules. I'll use \u201cbent extrusions\u201d for patterns too!\n\nA modular design seems best, incorporating pieces like the legs, seat, backrest, and arms if applicable. Parameters like dimensions for seat width, depth, backrest height, and leg thickness will help with customization.\n\nI'll build the code using modules like \"chairLeg\", \"seat\", \"backrest\", and \"armrest\", including a \"ornate_detail\" toggle for decorative patterns.\n\nI'll start by defining some adjustable parameters, like seat width, depth, height, leg thickness, and backrest height.\n\nNext, I'll break the design into logical modules: seat, legs, backrest, and armrest. I'll also include a simple ornamental pattern for the backrest, achieved by subtracting wave-like shapes using a custom \"ornamental_arc\" module.\n\nTo keep it simple for the user, I'll provide clear comments in the code, highlighting where customization options exist (seat dimensions, backrest height, and armrest options). This should allow them to tweak the design for their needs!\n",
    "output": "\n/* Ornate Dining Chair - Parametric OpenSCAD Model with Backrest Position Control */\n\n/* START CUSTOM PARAMETERS */\nchair_seat_width     = 400;   // Overall seat width (mm)\nchair_seat_depth     = 400;   // Overall seat depth (mm)\nchair_seat_thickness = 40;    // Seat thickness (mm)\nchair_leg_height     = 200;   // Leg height (mm)\nchair_leg_thickness  = 30;    // Leg cross-section (mm)\nleg_margin           = 30;    // Inset of legs from the seat edge (mm)\n\nbackrest_height      = 300;   // Backrest height above the seat (mm)\nbackrest_thickness   = 20;    // Backrest panel thickness (mm)\nbackrest_offset      = 0;     // (mm) When When backrest_offset = 0, the backrest is mounted flush to the seat; positive values move it further back.\nornate_pattern_depth = 5;     // Depth of the carved ornamental pattern (mm)\n\narmrest_length       = 200;   // Vertical armrest extension from the seat (mm)\narmrest_thickness    = 15;    // Armrest thickness (mm)\n\npattern_width        = 20;    // Width of each ornamental arc carving (mm)\npattern_spacing      = 30;    // Horizontal spacing between arcs (mm)\n/* END CUSTOM PARAMETERS */\n\n$fn = 50; // Set resolution for smooth curves\n\n/* Module: Seat */\nmodule seat() {\n    // The seat is a simple rectangular block\n    translate([-chair_seat_width/2, -chair_seat_depth/2, chair_leg_height])\n        cube([chair_seat_width, chair_seat_depth, chair_seat_thickness]);\n}\n\n/* Module: Leg */\nmodule leg() {\n    // Each leg is modeled as a square prism\n    cube([chair_leg_thickness, chair_leg_thickness, chair_leg_height]);\n}\n\n/* Module: Ornamental Arc Carving\n   Generates a half-circle shape (arch) that will be subtracted from the backrest */\nmodule ornamental_arc(width, depth) {\n    resolution = 30;\n    // Create a half circle from 0 to 180\u00b0 (in radians)\n    points = [ for (i = [0:resolution]) [ (width/2)*cos(i*PI/resolution), (width/2)*sin(i*PI/resolution) ] ];\n    // Linear extrude the 2D arch to the specified depth\n    linear_extrude(height = depth)\n        polygon(points);\n}\n\n/* Module: Backrest with Ornate Carvings */\nmodule backrest() {\n    difference() {\n        // Main backrest panel.\n        // The panel is positioned so that its front face (facing the seat) is flush with the seat\u2019s back edge\n        // when backrest_offset = 0. Increasing backrest_offset moves the panel further back.\n        translate([-chair_seat_width/2, -chair_seat_depth/2 - backrest_offset - backrest_thickness, chair_leg_height + chair_seat_thickness])\n            cube([chair_seat_width, backrest_thickness, backrest_height]);\n        // Subtract ornamental carvings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thickness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create the seat\n    seat();\n    \n    // Position legs at each corner with an inset (leg_margin)\n    // Front Left Leg\n    translate([-chair_seat_width/2vings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thickness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create tvings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thickness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create tvings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrestvings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   vings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thickness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create the seat\n    seat();\n    \n    // Position legs at each corner with an inset (leg_margin)\n    // Front Left Leg\n    translate([-chair_seat_width/2vings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thickness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create the seat\n    seat();\n    \n    // Position legs at each corner with an inset (leg_margin)\n    // Front Left Leg\n    translate([-chair_seat_width/2vings: a horizontal row of arcs on the front face.\n        // The carvings are positioned relative to the front face of the panel.\n        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {\n            translate([x, -chair_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrestr_seat_depth/2 - backrest_offset - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])\n                rotate([90,0,0])\n                    ornamental_arc(pattern_width, ornate_pattern_depth + 0.5);\n        }\n    }\n}\n\n/* Module: Armrest\n   \"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thic\"left\" parameter determines which side the armrest is placed */\nmodule armrest(left = true) {\n    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thic_thickness : chair_seat_width/2;\n    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])\n        cube([armrest_thickness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create the seat\n    seat();\n    \n    // Position legs at each corner with an inset (leg_margin)\n    // Front Left Leg\n    translate([-chair_seat_width/2 + leg_margin, -chair_seat_depth/2 + leg_margin, 0])\n        leg();\n    // Front Right Leg\n    translate([chair_seat_width/2 - leg_margin - chair_kness, chair_seat_depth, armrest_length]);\n}\n\n/* Module: Complete Ornate Dining Chair Assembly */\nmodule ornate_dining_chair() {\n    // Create the seat\n    seat();\n    \n    // Position legs at each corner with an inset (leg_margin)\n    // Front Left Leg\n    translate([-chair_seat_width/2 + leg_margin, -chair_seat_depth/2 + leg_margin, 0])\n        leg();\n    // Front Right Leg\n    translate([chair_seat_width/2 - leg_margin - chair_he seat\n    seat();\n    \n    // Position legs at each corner with an inset (leg_margin)\n    // Front Left Leg\n    translate([-chair_seat_width/2 + leg_margin, -chair_seat_depth/2 + leg_margin, 0])\n        leg();\n    // Front Right Leg\n    translate([chair_seat_width/2 - leg_margin - chair_leg_thickness, -chair_seat_depth/2 + leg_margin, 0])\n        leg();\n    // Back Left Leg\n    translate([-chair_seat_width/2 + leg_margin, chair_seat_depth/2 - leg_margin - chair_leg_thickness, 0])\n        leg();\n    // Back Right Leg\n    translate([chair_seat_width/2 - leg_margin - chair_leg_thickness, chair_seat_depth/2 - leg_margin - chair_leg_thickness, 0])\n        leg();\n    \n    // Add the backrest with its ornate carving and conat_depth/2 - leg_margin - chair_leg_thickness, 0])\n        leg();\n    // Back Right Leg\n    translate([chair_seat_width/2 - leg_margin - chair_leg_thickness, chair_seat_depth/2 - leg_margin - chair_leg_thickness, 0])\n        leg();\n    \n    // Add the backrest with its ornate carving and con_thickness, chair_seat_depth/2 - leg_margin - chair_leg_thickness, 0])\n        leg();\n    \n    // Add the backrest with its ornate carving and controllable position\n    backrest();\n    \n    // Attach armrests on both sides (optional)\n    armrest(left = true);\n    armrest(left = false);\n}\n\n/* Render the complete ornate dining chair */\nornate_dining_chair();\n"
}
"""

preprompt = f"""
    You are a OpenSCAD expert, and your goal is to make high-quality CAD models for non-CAD users with some simple customizable parameters.
    
    # Guidelines
    - Understand the Task: If the user asks for an object, they are asking for an OpenSCAD script defining that object. 
    - Complexity: If the user gives a simple prompt, generate new editable specification parameters to give a detailed model. For complex prompts, include exact user specifications.
    - Reason for a complete model: Take time to think through all elements needed to generate a complete model from the requests. "
    - Flag customizable parameters: Write "/* START CUSTOM PARAMETERS */" before custom parameter variable definitions. Write "/* END CUSTOM PARAMETERS */" after completing custom parameter variable definitions.
    - Output Format: JSON string containing reasoning and OutputSCAD strings 
      -Begin output with a JSON argument where you will reason through all the steps necessary to create a complete and customizable CAD model
      -After reasoning, output a JSON argument containing the OpenSCAD script.
      -Do not include any additional commentary, only output the completed system prompt.
      -SPECIFICALLY, do not include any additional messages at the start or end of the prompt. (e.g. no '---')
    
    # Examples of User/Assistant Exchanges:
      -Example 1:
        -User: "Generate a model of an ornate dining chair"
        -Assistant: {example1}
      
    """.strip()
    
feedback_prompt = f"""
    This is what your model looks like. Would you like to make any changes? If so, create a new output. If not, throw a refusal.
    """
    
def getPreprompt():
    return preprompt

def getFeedbackPrompt():
    return feedback_prompt

