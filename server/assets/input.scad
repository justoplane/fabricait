// D5: Disturbing Dirt Discarding Desktop Dustpan 
// Now dimensioned as keychain tool
version = "v0.0.1";

// -- pan vars --
width = 60;
depth = 50;
rear = 15;
corner = 20;
edge = 6;
wall = 1.2;
angle = 35;
chamfer = 0.8;

// -- handle vars --
handle = 35;
hheight = 6;
hwall = 2;
hole = 8;
r1 = 8;
r2 = 6;

textsize = 5;
textextrude = 1;

// -- common vars --
$fn = 90;
some = 0.01;
some2 = 2*some;


// ----------- pan ------------

module panshape(depth, width, height, corner)  {
   translate([corner, corner])
   linear_extrude(height)
   hull()
   offset(corner)
   square([depth-2*corner, width-2*corner]);
}

module panprofile(depth, height, edge, angle, chamfer)  {
   intersection()  {
      polygon([
         [0, 0],
         [depth, 0],
         [depth-edge*tan(90-angle), edge],
         [0, height]
      ]);
   square([depth-chamfer, height]);
   }
}

module pan(width, depth, height, corner, edge, wall, angle, chamfer)  {
   wall2 = 2*wall;
   intersection()  {
      difference()  {
         panshape(depth+corner, width, height, corner);
         translate([wall, wall, wall])
         panshape(depth+corner, width-wall2, height, corner);
      }
      translate([0, width])
      rotate([90, 0, 0])
      linear_extrude(width)
      panprofile(depth, height, edge, angle, chamfer);
   }
}

// --------- handle ----------

module handleshape(height, len, r1, r2)  {
   hull()  {
      cylinder(height, r=r1);
      translate([len, 0])
      cylinder(height, r=r2);
   }
}

module handle(r1, r2, l, h, w, hole)  {
   d1 = 2*r1;
   d2 = 2*r2;
   ri = r1-w;
   rz = r2-w;
   intersection()  {
      union()  {
         difference()  {
            handleshape(h, l, r1, r2);                   // outer handle wall
            translate([0, 0, w])
            handleshape(h, l, ri, rz);                   // inner handle wall
            translate([0, 0, -some])
            scale([1, 0.6])
            cylinder(w+some2, d=hole);                   // hanger hole
         }
         for (side = [-r2, r2])  {
            translate([l, side])
            cylinder(h, r=w);
         }
         translate([l-w, -r2])
         cube([w, d2, h]);
         translate([10, -textsize/2, w])
         linear_extrude(textextrude)
         text(version, size=textsize);
      }
      translate([-r1, -r1])
      cube([l+r1, d1, h]);                               // trim part of handle protruding into pan
   }
}


// ---------- assemble ----------
module dustpan(width, depth, height, corner, edge, wall, angle, chamfer, handle, hheight, r1, r2, hwall, hole)  {
   pan(width, depth, height, corner, edge, wall, angle, chamfer);
   translate([-handle, width/2])
   handle(r1, r2, handle, hheight, hwall, hole);
}

// -------- voila -------
dustpan(                                                 // all relevant parameters passed as arguments:
   width, depth, rear, corner, edge,                     // basic pan dimensions and corner rounding                                       
   wall, angle, chamfer,                                 // sizing and dimensioning of strength and oblique dirt intake
   handle, hheight,                                      // handle dimensions
   r1, r2,                                               // width is determined by rounding radii
   hwall, hole                                           // strength and size of hanger hole
);
