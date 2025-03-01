/* Water Bottle with Screw-On Lid - Parametric OpenSCAD Model */

/* START CUSTOM PARAMETERS */
thread_spacing = 5;  // Spacing between thread turns (mm)
thread_height = 2;  // Height of the thread on the lid (mm)
lid_inner_diameter = 65;  // Inner diameter of the lid (mm)
lid_outer_diameter = 32;  // Outer diameter of the lid (mm)
lid_height = 30;  // Height of the lid (mm)
bottle_thickness = 5;  // Wall thickness of the bottle (mm)
bottle_diameter = 70;  // Diameter of the bottle (mm)
bottle_height = 44;  // Height of the bottle (mm)
/* END CUSTOM PARAMETERS */

$fn = 100; // Set resolution for smooth curves

/* Module: Bottle */
module bottle() {
    // Main bottle body
    difference() {
        // Outer cylinder (full bottle)
        cylinder(h = bottle_height, r = bottle_diameter / 2);
        // Inner cylinder (hollow part)
        translate([0, 0, 0])
            cylinder(h = bottle_height, r = (bottle_diameter / 2) - bottle_thickness);
    }
}

/* Module: Lid */
module lid() {
    difference() {
        // Outer lid
        cylinder(h = lid_height, r = lid_outer_diameter / 2);
        // Inner part of the lid where it fits over the bottle
        translate([0, 0, -thread_height]) // Adjust position for thread height
            cylinder(h = lid_height + thread_height, r = lid_inner_diameter / 2);
        // Thread notches
        for (i = [0 : 360/thread_spacing : 360 - thread_spacing]) {
            rotate([0, 0, i])
                translate([0, lid_outer_diameter / 2, -thread_height])
                    cube([thread_height, thread_height, lid_height], center = true);
        }
    }
}

/* Module: Complete Water Bottle Assembly */
module water_bottle() {
    // Create the bottle
    bottle();
    // Create the lid and position it on top of the bottle
    translate([0, 0, bottle_height])
        lid();
}

/* Render the complete water bottle */
water_bottle();