---
date: 2014-08-19T00:00:00Z
published: true
status: publish
title: Metaballs and Marching Squares
type: post
url: /2014/08/19/metaballs-and-marching-squares/
---

<script 
src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
<script src="/javascripts/metaball.bundle.js"></script>
<script>
var paused = false;

var dummyCanvas = document.createElement('canvas');
dummyCanvas.width = 700;
dummyCanvas.height = 500;

var base = new MetaballSimulation({
    canvas: dummyCanvas,
    cellSize: 100,
    numCircles: 10,
    draw: function() {}
});

var baseTick = function() {
    if (!paused) {
        base.tickCircles();
    }
    requestAnimationFrame(baseTick);
};
requestAnimationFrame(baseTick);

var animateOnScroll = function(simulation) {
    var canvas = simulation._canvas; // Gross, I know - sorry!
    var container = canvas.offsetParent;
    var tick = function() {
        if (!paused
            &&
            window.scrollY < canvas.offsetTop + canvas.height
            &&
            window.scrollY + container.offsetHeight > canvas.offsetTop
        ) {
            // Only recalculate and draw while the canvas is on the screen.
            simulation.recalculate();
            simulation.draw();
        }

        requestAnimationFrame(tick);
    };
    simulation.draw()
    requestAnimationFrame(tick);

    canvas.addEventListener('click', function() {
        paused = !paused;
    });

    return simulation;
};
</script>

<figure>
<canvas id="smooth-highres" width="700" height="500"></canvas>
<figcaption>Click any of the animations to pause</figcaption>
</figure>
<script>
var smoothHighres = base.clone({
    canvas: document.getElementById("smooth-highres"),
    cellSize: 5,
    draw: function() {
        this.drawBg();
        this.drawSmoothContours();
    }
});
animateOnScroll(smoothHighres);
</script>

Something about making visually interesting simulations to play with just gets 
me really excited about programming, particularly when there's some cool 
algorithm or bit of math backing it.

Reading a bit about particle simulations on Wikipedia, I stumbled upon 
[metaballs][1]. In 3D, metaballs looks something like this:

<figure>
<img src="/images/14-08-11/Metaball_contact_sheet.png" />
<figcaption>From <a href="http://en.wikipedia.org/wiki/Metaballs">Metaballs</a> 
on Wikipedia</a></figcaption>
</figure>

This looked like it had the potential to yield some cool behaviour, so I decided 
to dive in. To start, I just wanted some circles bouncing around, like this:

<canvas id="bouncing-circles" width="700" height="500"></canvas>
<script>
var bouncingCircles = base.clone({
    canvas: document.getElementById("bouncing-circles"),
    cellSize: 100,
    draw: function() {
        this.drawBg();
        this.drawCircles();
    }
});
animateOnScroll(bouncingCircles);
</script>
Sweet. The next step is to make these things blobby. 

# The Math
As a bit of a refresher, this is the equation of a circle centered at \\( (x_0, 
y_0) \\) with radius \\( r \\):

<div>$$(x - x_0)^2 + (y - y_0)^2 = r^2$$</div>

Or if you wanted to model all the points inside or on the boundary the circle, 
it would be this:

<div>$$(x - x_0)^2 + (y - y_0)^2 \leq r^2$$</div>

Rearranging this a little, we get this:

<div>$$\frac{r^2}{(x - x_0)^2 + (y - y_0)^2} \geq 1$$</div>

When we have a bunch of circles bouncing around, we can model all the points 
inside of _any_ of the circles like this, if circle \\(i\\) is defined by radius 
\\(r_i\\), and center \\((x_i, y_i)\\):

<div>$$\max_{i=0}^n \frac{r_i^2}{(x - x_i)^2 + (y - y_i)^2} \geq 1$$</div>

The thing that makes metaballs all blobby-like is that instead of considering 
each circle separately, we take contributions from each circle. This models all 
of the points inside of all the metaballs:

<div>$$\sum_{i=0}^n \frac{r_i^2}{(x - x_i)^2 + (y - y_i)^2} \geq 1$$</div>

We're going to be using the left hand side of this inequality quite a bit, so 
let's say:

<div>$$f(x, y) = \sum_{i=0}^n \frac{r_i^2}{(x - x_i)^2 + (y - y_i)^2}$$</div>

If we sample the \\( f(x,y) \\) in a grid and plot the results, we get something 
like this:

<figure>
<canvas id="corner-samples" width="700" height="500"></canvas>
<figcaption>The cells highlighted in green have a sample with \( f(x, y) > 1 \) 
at their center.</figcaption>
</figure>
<script>
var cornerSamples = base.clone({
    canvas: document.getElementById("corner-samples"),
    cellSize: 40,
    draw: function() {
        this.drawBg();
        this.drawThresholdedCells();
        this.drawCircles();
        this.drawGridLines(this._cellSize / 2, this._cellSize / 2);
        this.drawCircles('#900');
        this.drawCornerSamples();
    }
});
animateOnScroll(cornerSamples);
</script>

If we increase the resolution, we start getting a kind of amoeba-blobby effect.

<figure>
<canvas id="blocky-threshold" width="700" height="500"></canvas>
</figure>
<script>
var blockyThreshold = base.clone({
    canvas: document.getElementById("blocky-threshold"),
    cellSize: 5,
    draw: function() {
        this.drawBg();
        this.drawThresholdedCells();
    }
});
animateOnScroll(blockyThreshold);
</script>

You might be thinking that this still looks a little blocky. We sampled in a 
grid, so why didn't we just sample every pixel instead to make it look smoother? 

Well, for 40 bouncing circles, on a 700x500 grid, that would be on the order of 
14 million operations. If we want to have a nice smooth 60fps animation, that 
would be 840 million operations per second. JavaScript engines may be fast 
nowadays, but not _that_ fast.

Thankfully, there's a much nicer algorithm to get a smooth approximation of the 
boundary dividing the area where the inequality holds from the area where it 
doesn't.

# Marching Squares

The Marching Squares algorithm generates an approximation for a contour line of 
a two dimensional scalar field. Put in another way, if we have a 2D function, 
this will find an approximation of a line where all points on the line have the 
same function value. In our case, we're trying to find the outlines where

<div>$$f(x, y) = 1$$</div>

Instead of each cell being drawn based on one sample in that cell, we're going 
to sample the _corners_ of each cell, then do something more intelligent to draw 
a line in some cells, instead of just filling in the entire square.

Sampling the corners looks like this:

<figure>
<canvas id="thresholded-corners" width="700" height="500"></canvas>
<figcaption>The corners where \( f(x,y) \geq 1 \) are highlighted in 
green.</figcaption>
</figure>
<script>
var thresholdedCorners = base.clone({
    canvas: document.getElementById("thresholded-corners"),
    cellSize: 40,
    draw: function() {
        this.drawBg();
        this.drawCircles();
        this.drawCornerSamples();
        this.drawGridLines();
        this.drawThresholdedCorners();
    }
});
animateOnScroll(thresholdedCorners);
</script>

The "do something more intelligent" relies on the fact that in every case other 
than all corners having \\( f(x, y) \geq 1 \\) or all corners having \\( f(x, y) 
\lt 1 \\) (cases 0 and 15 in the diagram below), we know that part of the boundary 
of our blobs will run through that cell.

Since there are only 2^4 possible configurations of a cell's corners, we can 
just enumerate them all.

<figure>
<img src="/images/14-08-11/marching-squares-mapping.png" />
<figcaption>The configuration number between 0-15 is computed by assigning a 
value of 0 to each of the corners where \( f(x, y) \lt 1 \), and a value of 1 
where \( f(x, y) \geq 1 \), then interpreting these bits as a binary number, 
ordered (southwest, southeast, northeast, northwest).</figcaption>
</figure>

To the keen observer, you'll notice that configurations 5 and 10 are ambiguous, 
because we can't be sure if the center of the cell is inside our boundary or 
outside it. For the sake of simplicity we just assume it's always inside the 
boundary.

When we perform this mapping process for all of the cells in the grid, we end up 
with something like this:

<canvas id="45-deg" width="700" height="500"></canvas>
<script>
var fortyFiveDeg = base.clone({
    canvas: document.getElementById("45-deg"),
    cellSize: 40,
    draw: function() {
        this.drawBg();
        this.drawThresholdedCorners();
        this.drawGridLines();
        this.drawCellClassification();
        this.drawCircles('#900');
        this.draw45DegContours();
    }
});
animateOnScroll(fortyFiveDeg);
</script>

If we increase the resolution and get rid of our debugging information, we wind 
up with this:

<canvas id="45-deg-highres" width="700" height="500"></canvas>
<script>
var fortyFiveDegHighres = base.clone({
    canvas: document.getElementById("45-deg-highres"),
    cellSize: 5,
    draw: function() {
        this.drawBg();
        this.draw45DegContours();
    }
});
animateOnScroll(fortyFiveDegHighres);
</script>

This looks a little nicer than the solid blocks we had before, but all we've 
really done is turned some of our 90 degree angles into 45 degree angles. We 
should be able to get smoother without increasing the sampling resolution.

# Linear Interpolation

When we categorized our cells into one of 16 types, we only retained one bit of 
information from each corner. We can use the original sample values to give us a 
much better approximation for where the contour line really intersects the cell.

Consider these examples, and see how even though these are all of the same 0-16 
type, the underlying samples should intuitively result in noticeably different 
lines.

<figure>
<img src="/images/14-08-11/lerp-examples.png" />
<figcaption>
Even though each of these cells would be classified as type "0100 = 2", the 
green line approximating the set of points within the cell where \( f(x, y) = 1 
\) can vary dramatically depending on the underlying sample values.</figcaption>
</figure>

To calculate how to adjust these lines based on the original corner sample 
values, we're going to apply [linear interpolation][2]. Given the point labels 
in this diagram:

<img src="/images/14-08-11/lerp-labels.png" />

Let's work through the math for finding \\( (Q_x, Q_y) \\). The process would be 
the same for \\( (P_x, P_y) \\) or the point on either of the other 2 sides in 
the case of other 0-15 cell configurations.

For starters, we know this just looking at the diagram:

<div>$$Q_x = B_x$$</div>

And, even though the \\( f(x, y) \\) isn't linear, linear interpolation still 
gives a good enough result to provide us with visually meaningful smooth contour 
lines, so we can say:

<div>$$
\frac{Q_y - B_y}{D_y - B_y} \approx \frac{f(Q_x, Q_y) - f(B_x, B_y)}
                                         {f(D_x, D_y) - f(B_x, B_y)}
$$</div>

Since we're trying to get \\( Q \\) to lie roughly on the counter line where \\( 
f(x, y) = 1 \\), we want \\( f(Q_x, Q_y) \approx 1 \\), so let's substitute that 
and rearrange.

<div>$$
Q_y = B_y + (D_y - B_y) \left(
\frac{1 - f(B_x, B_y)}{f(D_x, D_y) - f(B_x, B_y)}
\right)
$$</div>

All the values on the right hand side are known, so we can just plug them in.  
The result is something like this:

<canvas id="smooth" width="700" height="500"></canvas>
<script>
var smooth = base.clone({
    canvas: document.getElementById("smooth"),
    cellSize: 40,
    draw: function() {
        this.drawBg();
        this.drawGridLines();
        this.drawCircles('#900');
        this.drawSmoothContours();
    }
});
animateOnScroll(smooth);
</script>

And if we crank up the resolution and hide the debug info, we're left with this 
pretty result:

<canvas id="smooth-highres-2" width="700" height="500"></canvas>
<script>
var smoothHighRes2 = base.clone({
    canvas: document.getElementById("smooth-highres-2"),
    cellSize: 5,
    draw: function() {
        this.drawBg();
        this.drawSmoothContours();
    }
});
animateOnScroll(smoothHighRes2);
</script>

As a bonus, I also implemented the blocky version of this (no marching squares) 
on the Khan Academy Computer Science platform, using [Voronoi diagram][5]-esque 
coloring for the cells. 

<figure>
<img src="/images/14-08-11/metaballs-on-ka.png" />
<figcaption><a 
href="https://www.khanacademy.org/cs/Metaballs%21/6209526669246464">
Metaballs! on Khan Academy
</a></figcaption>
</figure>

# Applications

It turns out that this algorithm can be actually useful!

The most likely example of this you've seen are elevation contours on maps.
Before we had crazy high resolution satellite imaging of everything, we could've 
taken elevation samples in a grid, then drawn contour lines for a fixed number 
of elevations to create maps like this:

<figure>
<img src="/images/14-08-11/contour-map.jpg" />
</figure>

Another application of this you might've seen without realizing it is applying 
tilesets in games. There's a great explanation of that in a blog post called 
[Squares Made for Marching][3] on Project Renegade. Linear interpolation doesn't 
apply to this version of the algorithm.

<figure>
<img src="/images/14-08-11/tile-corner-samples.png" />
<figcaption>From Project Renegade.</figcaption>
</figure>

If you extend the method to 3D, you get the [Marching Cubes][4] algorithm, which 
is the same concept but with far more configurations to deal with. Once you're 
working in 3D, you can use the algorithm to visualize things like MRI slices 
where you want to draw isosurfaces (3D equivalent of contour lines) representing 
surfaces of equal density.

<figure>
<img src="/images/14-08-11/marching-cubes-head.png" />
<figcaption>From <a href="http://en.wikipedia.org/wiki/Marching_cubes">Marching 
Cubes</a> on Wikipedia</figcaption>
</figure>

That's all for now. After enjoying Introduction to Computer Graphics (CS 488) at 
uWaterloo, then remembering how much I enjoyed it from helping out a friend, I 
want to get back into graphics stuff. I think I'll start delving into 3D stuff 
soon, but this was nice gentle wading back into visually interesting work with a 
teensy math component. Hopefully more like this to come!


[1]: http://en.wikipedia.org/wiki/Metaballs
[2]: http://en.wikipedia.org/wiki/Linear_interpolation
[3]: http://blog.project-retrograde.com/2013/05/marching-squares/
[4]: http://en.wikipedia.org/wiki/Marching_cubes
[5]: http://bl.ocks.org/mbostock/4060366
