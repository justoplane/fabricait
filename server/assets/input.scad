/* Dining Room Chair with Centered Circular Hole in Backrest - Parametric OpenSCAD Model */

/* START CUSTOM PARAMETERS */
hole_offset = 195;  // Offset from the bottom of the backrest to center the hole (mm)
hole_diameter = 64;  // Diameter of the hole in the backrest (mm)
backrest_thickness = 20;  // Backrest thickness (mm)
backrest_height = 400;  // Height of the backrest from the seat (mm)
chair_leg_thickness = 30;  // Leg width/ thickness (mm)
chair_leg_height = 400;  // Leg height (mm)
chair_seat_height = 40;  // Seat height (mm)
chair_seat_depth = 400;  // Overall seat depth (mm)
chair_seat_width = 400;  // Overall seat width (mm)
/* END CUSTOM PARAMETERS */

$fn = 50; // Set resolution for smooth curves

/* Module: Seat */
module seat() {
    translate([-chair_seat_width/2, -chair_seat_depth/2, 0])
        cube([chair_seat_width, chair_seat_depth, chair_seat_height]);
}

/* Module: Leg */
module leg() {
    translate([-chair_seat_width/2 + chair_leg_thickness/2, -chair_seat_depth/2 + chair_leg_thickness/2, -chair_leg_height])
        cube([chair_leg_thickness, chair_leg_thickness, chair_leg_height]);
}

/* Module: Backrest with Centered Circular Hole */
module backrest() {
    difference() {
        translate([-chair_seat_width/2, -chair_seat_depth/2 - backrest_thickness, chair_seat_height])
            cube([chair_seat_width, backrest_thickness, backrest_height]);
        // Create the hole centered in the backrest
        translate([-hole_diameter/2, -chair_seat_depth/2 - backrest_thickness, hole_offset])
            cylinder(h = backrest_thickness + 1, r = hole_diameter/2);
    }
}

/* Module: Complete Dining Room Chair Assembly */
module dining_room_chair() {
    // Seat
    seat();
    // Legs
    leg(); // Back Left Leg
    translate([chair_seat_width - chair_leg_thickness, 0, 0]) leg(); // Back Right Leg
    translate([0, chair_seat_depth - chair_leg_thickness, 0]) leg(); // Front Left Leg
    translate([chair_seat_width - chair_leg_thickness, chair_seat_depth - chair_leg_thickness, 0]) leg(); // Front Right Leg
    // Backrest
    backrest();
}

/* Render the complete dining room chair */
dining_room_chair();