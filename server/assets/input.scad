/* Ornate Dining Room Chair - Parametric OpenSCAD Model with Correct Leg Placement */

/* START CUSTOM PARAMETERS */
chair_seat_width     = 400;   // Overall seat width (mm)
chair_seat_depth     = 400;   // Overall seat depth (mm)
chair_seat_thickness = 40;    // Seat thickness (mm)
chair_leg_height     = 200;   // Leg height (mm)
chair_leg_thickness  = 30;    // Leg thickness (mm)
leg_margin           = 30;    // Inset of legs from the seat edge (mm)

backrest_height      = 300;   // Backrest height above the seat (mm)
backrest_thickness   = 20;    // Backrest thickness (mm)
backrest_offset      = 0;     // Offset for backrest positioning (mm)
ornate_pattern_depth = 5;     // Depth of the ornate pattern (mm)

armrest_length       = 150;   // Length of the armrest (mm)
armrest_thickness    = 15;    // Armrest thickness (mm)

pattern_width        = 20;    // Width of each ornamental arc (mm)
pattern_spacing      = 30;    // Spacing between ornamental arcs (mm)
/* END CUSTOM PARAMETERS */

$fn = 50; // Set resolution for smooth curves

/* Module: Seat */
module seat() {
    translate([-chair_seat_width/2, -chair_seat_depth/2, chair_leg_height])
        cube([chair_seat_width, chair_seat_depth, chair_seat_thickness]);
}

/* Module: Leg */
module leg() {
    cube([chair_leg_thickness, chair_leg_thickness, chair_leg_height]);
}

/* Module: Ornamental Arc Carving */
module ornamental_arc(width, depth) {
    points = [ for (i = [0:30]) [ (width/2)*cos(i*PI/30), (width/2)*sin(i*PI/30) ] ];
    linear_extrude(height = depth)
        polygon(points);
}

/* Module: Backrest with Ornate Carvings */
module backrest() {
    difference() {
        translate([-chair_seat_width/2, -backrest_thickness, chair_leg_height + chair_seat_thickness])
            cube([chair_seat_width, backrest_thickness, backrest_height]);
        for (x = [-chair_seat_width/2 + pattern_spacing : pattern_spacing : chair_seat_width/2 - pattern_spacing - pattern_width]) {
            translate([x, -backrest_thickness - ornate_pattern_depth, chair_leg_height + chair_seat_thickness + backrest_height/2 - pattern_width/2])
                rotate([90,0,0])
                    ornamental_arc(pattern_width, ornate_pattern_depth);
        }
    }
}

/* Module: Armrest */
module armrest(left = true) {
    x_offset = left ? -chair_seat_width/2 - armrest_thickness : chair_seat_width/2;
    translate([x_offset, -chair_seat_depth/2, chair_leg_height + chair_seat_thickness])
        cube([armrest_thickness, chair_seat_depth, armrest_length]);
}

/* Module: Complete Ornate Dining Room Chair Assembly */
module ornate_dining_chair() {
    seat();
    // Position legs at each corner of the seat
    translate([-chair_seat_width/2 + leg_margin, -chair_seat_depth/2 + leg_margin, 0]) leg();
    translate([chair_seat_width/2 - leg_margin - chair_leg_thickness, -chair_seat_depth/2 + leg_margin, 0]) leg();
    translate([-chair_seat_width/2 + leg_margin, chair_seat_depth/2 - leg_margin - chair_leg_thickness, 0]) leg();
    translate([chair_seat_width/2 - leg_margin - chair_leg_thickness, chair_seat_depth/2 - leg_margin - chair_leg_thickness, 0]) leg();
    backrest();
    armrest(left = true);
    armrest(left = false);
}

/* Render the complete ornate dining room chair */
ornate_dining_chair();