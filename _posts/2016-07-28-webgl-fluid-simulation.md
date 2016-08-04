---
layout: post
title: Fluid Simulation (in WebGL)
status: publish
type: post
published: true
---

<link rel="stylesheet" 
href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.6.0/katex.min.css">

About a year and a half ago, I had a passing interest in trying to figure out 
how to make a fluid simulation. At the time, it felt just a bit out of my reach, 
requiring knowledge of shaders, vector calculus, and numerical computation, that 
were all just a little bit past my grasp. At the time, I was working through the
[Fluid Simulation Course Notes from SIGGRAPH 2007][1], and was struggling with 
the math. Now armed with a bit more knowledge and a lot more time, and with the 
help of other less dense resources like [GPU Gems Chapter 38.  Fast Fluid 
Dynamics Simulation on the GPU][0], I was finally able to figure out enough to 
get something working. Hopefully I can help leapfrog you past where I got stuck.  
This post is going to be light on math, but hopefully heavy on intuition.

We're going to work with the simplest 2D fluid simulation, where the entire area 
is full of fluid, and we're going to ignore viscosity.

# The Velocity Field

As compared to a rigid, unrotating solid, where every bit of the thing has to be 
moving in the same direction at the same speed, each bit of a fluid might be 
moving differently. One way to model this is to use a vector field representing 
velocity. For any given \\( (x, y) \\) coordinate, this field will tell you the 
velocity of the fluid at that point.

$$
\vec u(x, y) = (u_x, u_y)
$$

A nice way to get an intuition about what a given field like is to sample the 
function in a grid of points, then draw arrows starting at each grid point whose 
size and orientation are dictated by the value of the function at that point.
For the purposes of this post, we're always going to be working over the domain 
\\( x \in [-1, 1] \\), \\( y \in [-1, 1] \\).

For instance, here's a very simple field \\( \vec u(x, y) = (0.05, 0) \\) 
representing everything moving at a constant speed to the right.

<img src="/images/16-08-01/vecfield1.png">

And here's a more interesting one \\( \vec u(x, y) = (0.05x, 0.05y) \\) where 
things move away from the origin, increasing in speed the farther away from the 
origin they are.

<img src="/images/16-08-01/vecfield2.png">

We're going to play with this one, \\( \vec u(x, y) = \left( 0.05 \sin (2 \pi 
y), 0.05 \sin (2 \pi x) \right) \\), since it creates some interesting visual 
results once we start making the fluid move accordingly.

<img src="/images/16-08-01/vecfield3.png">

For a more thorough introduction to vector fields, check out the [Introduction 
to Vector Fields][2] video on Khan Academy. The rest of the videos on 
multivariate calculus might prove useful for understanding concepts in fluid 
flow too!

Now then, let's get things moving.

# Advection

Advection is the transfer of a property from one place to another due to the 
motion of the fluid. If you've got some black dye in some water, and the water 
is moving to the right, then surprise surprise, the black dye moves right!

<canvas id="advection1" width="500" height="400"></canvas>
<div class="caption">Click and drag to change the fluid flow. Double click to 
reset.</div>

If the fluid is moving in a more complex manner, that black dye will get pulled 
through the liquid in a more complex manner.

<canvas id="advection2" width="500" height="400"></canvas>

Before we dive into how advection works, we need to talk a bit about the format 
of the data underlying these simulations.

The simulation consist of two fields: color and velocity. Each field is 
represented by a two dimensional grid. For simplicity, we use the same 
dimensions as the output pixel grid.

Previously, I described the velocity field as an analytical function \\( \vec 
u(x, y) \\). In practice, that analytical function is only used to initialize 
the grid values.

The simulation runs by stepping forward bit-by-bit in time, with the state of 
the color and velocity grids depending only on the state of the color and 
velocity grids from the previous time step. We'll use \\( \vec u(\vec p, t) \\) 
to represent the velocity grid at 2d position \\( \vec p \\) and time \\( t \\), 
and \\( \vec c(\vec p, t) \\) to represent the color in the same manner.

So how do we move forward in time? Let's just talk about how the color field 
changes for now. If we consider each grid point as a little particle in the 
fluid, then one approach is to update the color of the fluid where that particle 
will be, one time step in the future.

<div>$$
\vec c(\vec p + u(\vec p, t) \Delta t, t + \Delta t) := \vec c(\vec p, t)
$$</div>

TODO: fix diagram to use uppercase delta
<img src="/images/16-08-01/advection1.png">

But this winds up being difficult to implement on the GPU. First, the position 
we want to write, \\( \vec p + v(\vec p, t) \Delta t) \\) might not lie on a 
grid point, so we'd have to distribute the impact of the write across the 
surrounding grid points. Second, many of our imaginary particles might end up in 
the same place, meaning we need to analyze the entire grid before we decide what 
the new values of each grid point might be.

So instead, instead of figuring out what our imaginary particles at the grid 
points *go to*, we'll figure out where they *came from* in order to calculate 
the next time step.

<div>$$
\vec c(\vec p, t + \Delta t) := \vec c(\vec p - \vec u(\vec p) \Delta t, t)
$$</div>

TODO: fix diagram to use uppercase delta
<img src="/images/16-08-01/advection2.png">

With this scheme, we only need to write to a single grid point, and we don't 
need to consider the contributions of imaginary particles coming from multiple 
different places.

The last teensy hurdle is figuring out the value of \\( \vec c(\vec p - \vec 
u(\vec p, t) \Delta t, t ) \\), since \\( \vec p - \vec u(\vec p, t) \\) might 
not be at a grid point. We can hop this hurdle using [bilinear interpolation][3] 
on the surrounding 4 grid points (the ones linked by the dashed grey rectangle 
above).

# Advecting the Velocity Field

Barring bizarre sequence of perfectly aligned fans underneath the liquid, 
there's no reason why the velocity field wouldn't change over time. Just as 
black ink would move through the fluid, so too will the velocity field itself!
Just as we can *advect* \\( \vec c \\) through \\( \vec u \\), we can also 
*advect* \\( \vec u \\) through itself!

Intuitively you can think of it this way: a particle moving in a certain 
direction will continue moving in that direction, even after it's moved.

Since we're storing velocity in a grid just like we did with color, we can use 
the exact same routine to advect velocity through itself. Below, wa tch the 
velocity change over time, with an initial velocity field of \\( \vec u = (0.05, 
0.05 \sin(2 \pi y)) \\).

<canvas id="advectV1" width="500" height="400"></canvas>
<div class="caption">See how the changes you make by dragging propagate through 
space via advection.</div>

If you tried playing around with this, and saw a bunch of weird hard edges and 
might've thought to yourself "I don't think fluids work like that...", you'd be 
right. We're missing an important ingredient, but before we look at the 
solution, let's take a closer look at the problem.

# Divergent Fields

Something about the velocity field below makes this intuitively not feel like a 
fluid.  Fluids just don't *behave* like this.

<canvas id="divergent1" width="500" height="400"></canvas>

Same problem with this one...

<canvas id="divergent2" width="500" height="400"></canvas>

If you look at where the arrows are pointing in each of the above 2 simulations, 
you'll see that there are spots where the all the arrows point away from that 
spot, and others where all the arrows point toward that spot.  Assuming the 
volume of the liquid is staying constant, the density of the fluid has to be 
changing for such a velocity field to be possible.

Water is roughly incompressible. That means that at every spot, you have to have 
the same amount of fluid entering that spot as leaving it.

Mathematically, we can represent this fact by saying a field is 
*divergence-free*. The divergence of a velocity field \\( \vec u \\), indicated 
with \\( div(\vec u) \\) or \\( \nabla \cdot \vec u \\), is a measure of how 
much net stuff is entering or leaving a given spot in the field. For our 2D 
velocity field, it's defined like this:

<div>$$\begin{aligned}
\nabla \cdot \vec u &=
    \left( \frac{\partial}{\partial x}, \frac{\partial}{\partial y} \right) 
    \cdot
    \left( u_x, u_y \right) \\
&= \frac{\partial u_x}{\partial x} + \frac{\partial u_y}{\partial y}
\end{aligned}$$</div>

The first of the two not-very-fluidy fields above has an equation \\( \vec u(x, 
y) = (0.05x, 0.05y) \\). Taking the divergence, we find:

<div>$$\begin{aligned}
\nabla \cdot \vec u &=
    \frac{\partial}{\partial x}(0.05x) + \frac{\partial}{\partial y}(0.05y) \\
&= 0.05 + 0.05 \\
&= 0.1
\end{aligned}$$</div>

This positive value tells us that, in all places, more stuff is leaving that 
point than entering it.

Working through the math for the other non-very-fluidy field, we get \\( \nabla 
\cdot \vec u = 0.1 \pi x \cos(2 \pi x) \\).

Which tells us that in some places, more stuff is entering than leaving (where 
the divergence is negative), and in others, more stuff is leaving than entering 
(where the divergence is positive).

Doing the same operation on the more fluidy looking swirly velocity field \\( 
\vec u = (0.05 \sin ( 2 \pi y), 0.05 \sin ( 2 \pi x ) \\) that you saw in the 
section about advection, we discover \\( \nabla \cdot \vec u = 0 \\).

An incompressible fluid will have a divergence of zero everywhere. So, if we 
want our simulated fluid to look kind of like a real fluid, we better make sure 
it too is divergence-free.

Since our velocity field undergoes advection and can be influenced by clicking 
and dragging around the fluid, having an initially divergence-free velocity 
field isn't enough to guarantee that the field will continue to be 
divergence-free. For example, if we take our swirly simulation and start 
advecting the velocity field through itself, we end up with something divergent:

<canvas id="divergent3" width="500" height="400"></canvas>

So we need a way of taking a divergent field and *making* it divergence-free. To 
understand what force makes that happen in the real world, we need to talk about 
some honest-to-goodness physics.

# Navier-Stokes

The Navier-Stokes equations describe the motion of fluids. Here are the 
Navier-Stokes equations for incompressible fluid flow:

<div>$$\begin{aligned}
& \frac{\partial \vec u}{\partial t} =
    -\vec u \cdot \nabla \vec u
    -\frac{1}{\rho} \nabla p + \nu \nabla^2 \vec u + \vec F \\
\\
& \nabla \cdot \vec u = 0
\end{aligned}$$</div>

Where \\( \vec u \\) is the velocity field, \\( \rho \\) is density, \\( p \\) 
is pressure,
\\( \nu \\) is the kinematic viscosity, \\( \vec F \\) is external forces acting 
upon the fluid

Since we're pretending the viscosity of our fluid is zero, we can drop the \\( 
\nu \\) term in the first equation. In our simple simulation, external forces 
are only applied by dragging the mouse, so we'll ignore that term for now, 
opting to allow it to influence the velocity field directly.

Dropping those terms, we're left with the following:

<div>$$
\frac{\partial \vec u}{\partial t} =
    -\vec u \cdot \nabla \vec u
    -\frac{1}{\rho} \nabla p
$$</div>

We can expand this to its partial derivative form, expanding vector components 
to leave us with only scalar variables.

<div>$$\begin{aligned}
\begin{bmatrix}
    \frac{\partial u_x}{\partial t} \\
    \\
    \frac{\partial u_y}{\partial t}
\end{bmatrix} &=
    -
    \begin{bmatrix}
        \frac{\partial u_x}{\partial x} & \frac{\partial u_x}{\partial y} \\
        \\
        \frac{\partial u_y}{\partial x} & \frac{\partial u_y}{\partial y}
    \end{bmatrix}
    \begin{bmatrix}
        u_x \\
        \\
        u_y
    \end{bmatrix}
    -
    \frac{1}{\rho}
    \begin{bmatrix}
        \frac{\partial p}{\partial x} \\
        \\
        \frac{\partial p}{\partial y}
    \end{bmatrix}
    \\
\begin{bmatrix}
    \frac{\partial u_x}{\partial t} \\
    \\
    \frac{\partial u_y}{\partial t}
\end{bmatrix} &=
    \begin{bmatrix}
        - u_x \frac{\partial u_x}{\partial x}
        - u_y \frac{\partial u_x}{\partial y}
        - \frac{1}{\rho} \frac{\partial p}{\partial x} \\
        \\
        - u_x \frac{\partial u_y}{\partial x}
        - u_y \frac{\partial u_y}{\partial y}
        - \frac{1}{\rho} \frac{\partial p}{\partial y}
    \end{bmatrix}
\end{aligned}$$</div>

Remembering that these fields are all functions on \\( (x, y, t) \\), we can 
approximate the partial derivatives with [finite differences][4]. Because the 
procedure ends up being the same for both components, we'll focus on only the 
\\( x \\) component here.

<div>$$
\begin{aligned}
\frac{u_x(x, y, t + \Delta t) - u_x(x, y, t)}{\Delta t} =&
    -u_x(x, y, t)
        \frac{u_x(x + \epsilon, y, t) - u_x(x - \epsilon, y, t)}{2 \epsilon}
    \\
    &
    -u_y(x, y, t)
        \frac{u_x(x, y + \epsilon, t) - u_x(x, y - \epsilon, t)}{2 \epsilon}
    \\
    &
    -\frac{1}{\rho}
        \frac{p(x + \epsilon, y, t) - p(x - \epsilon, y, t)}{2 \epsilon}
\end{aligned}
$$</div>

Ultimately what we want is \\( \vec u(x, y, t + \Delta t) \\), which will tell 
us, for a given point, what the velocity will be at the next time step. So let's 
solve for that by rearranging the big long formula above:

<div>$$
\begin{aligned}
u_x(x, y, t + \Delta t) = &
    u_x(x, y, t)
    \\
    &

    - u_x(x, y, t) \Delta t
        \frac{u_x(x + \epsilon, y, t) - u_x(x - \epsilon, y, t)}{2 \epsilon}
    \\
    &
    -u_y(x, y, t) \Delta t
        \frac{u_x(x, y + \epsilon, t) - u_x(x, y - \epsilon, t)}{2 \epsilon}
    \\
    &
    -\frac{1}{\rho} \Delta t
        \frac{p(x + \epsilon, y, t) - p(x - \epsilon, y, t)}{2 \epsilon}
\end{aligned}
$$</div>

If you look at the first three terms in this expression, what does it look like 
they conceptually represent? It looks like they represent the next velocity 
after we've taken into account changes due to the motion of the fluid itself.
That sounds an awful like advection as discussed earlier. In fact, it will work 
quite well if we substitute the velocity field after it's undergone advection. 
We'll call the advected velocity field \\( \vec u ^ a \\). So now we have:

<div>$$
\begin{aligned}
u_x(x, y, t + \Delta t) =
    u^a_x(x, y, t)
    -\frac{1}{\rho} \Delta t
        \frac{p(x + \epsilon, y, t) - p(x - \epsilon, y, t)}{2 \epsilon}
\end{aligned}
$$</div>

So after all of that, we have an equation that relates the velocity field at the 
next time tick to the current velocity field after it's undergone advection, 
followed by application of pressure.

We know that a divergence-free field that undergoes advection isn't necessarily 
still divergence-free, and yet we know that the Navier-Stokes equations for 
impressible flow represent divergence-free velocity fields, so
therefore we have our answer about what in nature prevents the velocity field 
from becoming divergent: pressure!

# Solving for Pressure

Now that we have an equation that relates \\( \vec u \\) to \\( p \\). This is 
where the math gets messy. We start from the second Navier-Stokes equation for 
incompressible flow, applied at time \\( t + \Delta t \\), and apply finite 
differences again:

<div>$$
\begin{aligned}
\nabla \cdot \vec u & = 0
\\

\frac{\partial u_x}{\partial x} + \frac{\partial u_y}{\partial y} & = 0
\\

\frac{
    u_x(x + \epsilon, y, t + \Delta t) - u_x(x - \epsilon, y, t + \Delta t)
}{
    2 \epsilon
} +
\\
\\
\frac{
    u_x(x, y + \epsilon, t + \Delta t) - u_x(x, y - \epsilon, t + \Delta t)
}{
    2 \epsilon
} & = 0
\end{aligned}
$$</div>

Here, we can substitute our equations for \\( \vec u \\) expressed in terms of 
\\( \vec u ^ a \\) and \\( p \\) to get this monster:

<div>$$\begin{aligned}
\frac{1}{2 \epsilon} \left(

    \left(
    u^a_x(x + \epsilon, y, t)
    -\frac{1}{\rho} \Delta t
        \frac{p(x + 2\epsilon, y, t) - p(x, y, t)}{2 \epsilon}
    \right)

    \right. \\ \left.

    -
    \left(
    u^a_x(x - \epsilon, y, t)
    -\frac{1}{\rho} \Delta t
        \frac{p(x, y, t) - p(x - 2\epsilon, y, t)}{2 \epsilon}
    \right)

    \right. \\ \left.

    +
    \left(
    u^a_x(x, y + \epsilon, t)
    -\frac{1}{\rho} \Delta t
        \frac{p(x, y + 2\epsilon, t) - p(x, y, t)}{2 \epsilon}
    \right)

    \right. \\ \left.

    -
    \left(
    u^a_x(x, y + \epsilon, t)
    -\frac{1}{\rho} \Delta t
        \frac{p(x, y, t) - p(x, y - 2\epsilon, t)}{2 \epsilon}
    \right)

    \right. \\ \left.

\right) = 0
\end{aligned}$$</div>

# Future Work

- Fluid-fluid interactions
- Solid-fluid interactions
- Smoke
- Fluid sources and drains
- Fluid simulations with particles
- Heightfield simulations

<script 
src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.6.0/katex.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.6.0/contrib/auto-render.min.js"></script>
<script>
renderMathInElement(document.body);
</script>

<script src="/javascripts/lightgl.js"></script>
<script src="/javascripts/fluid-sim.js"></script>
<script>

new FluidSim("advection1", {
    threshold: false,
    initVFn: function(x, y) {
        return [0.05, 0];
    },
    advectV: false,
});

new FluidSim("advection2", {
    threshold: false,
    advectV: false
});

new FluidSim("advectV1", {
    threshold: false,
    advectV: true,
    initVFn: function(x, y) {
        return [0.05, 0.05 * Math.sin(2 * Math.PI * x)];
    },
});

new FluidSim("divergent1", {
    threshold: false,
    advectV: false,
    initVFn: function(x, y) {
        return [0.05 * x, 0.05 * y];
    },
});

new FluidSim("divergent2", {
    threshold: false,
    advectV: false,
    initVFn: function(x, y) {
        return [0.05 * Math.sin(2 * Math.PI * x), 0];
    },
});

new FluidSim("divergent3", {
    threshold: false,
    advectV: true
});


// TODO(jlfwong): Add control to reset, hide vector field arrows
</script>

[0]: http://http.developer.nvidia.com/GPUGems/gpugems_ch38.html
[1]: https://www.cs.ubc.ca/~rbridson/fluidsimulation/fluids_notes.pd://www.cs.ubc.ca/~rbridson/fluidsimulation/fluids_notes.pdf 
[2]: https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/visualizing-vector-valued-functions/v/vector-fields-introduction
[3]: https://en.wikipedia.org/wiki/Bilinear_interpolation
[4]: https://en.wikipedia.org/wiki/Finite_difference#Forward.2C_backward.2C_and_central_differences
