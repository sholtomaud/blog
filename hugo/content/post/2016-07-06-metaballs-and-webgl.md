---
date: 2016-07-06T00:00:00Z
published: true
status: publish
title: Metaballs and WebGL
type: post
url: /2016/07/06/metaballs-and-webgl/
---

<canvas id="topcanvas" width="700" height="500" />

I'm back to learning graphics! A lot of interesting simulation and rendering 
work takes place on the GPU, and I didn't have much experience doing that, so I 
figured I'd try to get metaballs rendering on the GPU. This time, instead of 
using the [marching squares algorithm][0], we'll leverage the GPU to compute 
every pixel in parallel!

In this post, I'm going to walk through the steps of getting metaballs rendering 
with WebGL. Each step will have a separate [codepen][2] you can play with, and a 
list of suggestions for things to try in order to understand the concepts. To 
get the most out of this post, work through the challenges in the comments at 
the top of each codepen.

To focus on what's happening at a low level, we'll be using WebGL directly, and 
not a high-level abstraction library like the excellent [THREE.js][8].

{:toc}

# The OpenGL programmable pipeline

Let's look at a simplified version of the OpenGL programmable pipeline. This is 
the pipeline of steps that brings you from 3D geometry to pixels on the screen 
using the GPU.

If you've never seen this before, don't worry. As you walk through the code 
examples below, you might want to refer back to this diagram.

<img src="/images/16-06-26/OpenGLpipeline.svg" width="700" />

**Shaders** in OpenGL/WebGL are programs written in a C-like language called 
[GLSL][3].

**Vertex shaders** operate on vertex property data, one vertex at a time. This 
vertex property data is specified as **attributes**. Attributes might include 
things like the position of the vertex in 3D space, texture coordinates, or 
vertex normals. Vertex shaders set the magic [`gl_Position`][7] variable, which 
GL interprets as the position in 3D space of the vertex. Vertex shaders are also 
responsible for setting **varying** variables, which are consumed in the 
**fragment shader**.

After positions are set in the vertex shader, the positions of the vertices are 
passed to **geometry assembly**, which decides how the vertices are connected 
into edges and faces based on the argument to [`gl.drawElements`][4] or 
[`gl.drawArrays`][5]. For instance, if you specify `gl.GL_LINE_STRIP`, then 
geometry assembly will connect every adjacent pair of vertices by edges, and 
give you no faces. If you instead specify `gl.GL_TRIANGLE_STRIP`, then every 
contiguous triple of vertices will be formed into a triangle.

Next, the geometry goes through **rasterization**, where each face or line is 
turned into pixels that fit the grid of the output framebuffer.  Information 
about each one of these pixels, including the interpolated values of the varying 
variables, is then passed to the fragment shader.

**Fragment shaders** output the color for a specific pixel to the framebuffer.  
As input, they have access to any varying variables specified in the vertex 
shader, and a few magic variables like [`gl_FragCoord`][6]. As output, fragment 
shaders set the magic `gl_FragColor` variable to specify the final color of the 
pixel.

**Uniform** variables are available in both the vertex shader and fragment 
shader, and hold the same value regardless of which vertex or fragment the 
shader is operating on.

# Aside: programmable vs fixed pipeline

While learning about OpenGL, and specifically WebGL, I was getting confused a 
lot about all the steps that were taking place. When I looked at how pixels got 
to the screen from geometry using shaders, I kept asking questions like: "Where 
is the camera set up?", "How are coordinates converted from the world coordinate 
system to the view coordinate system?", "How do I set the scene's lighting"?

The answer to all of these questions is, in the world of the *programmable* 
pipeline, all of these things are up to you. There's no default concept of a 
camera, or model coordinates, or lighting, or Phong shading. It's all up to you.

This is in contrast to older GPUs and older versions of OpenGL which used a 
*fixed* pipeline, where you would set all those things directly and it would
figure out how to convert from world coordinates to camera view coordinates and 
light the scene for you.

You can read a lot more about it in this excellent article: [The End of 
Fixed-Function Pipelines (and How to Move On)][9].

# Step 1. Running a fragment shader for every pixel on the screen

To be able to run arbitrary computation to determine the color of every pixel in 
our canvas, we need to get a fragment shader running for every pixel on the 
screen.

First, we set up geometry that covers the whole screen. The fragment shader only 
runs for pixels inside geometry being drawn, and also only for pixels that have 
x and y coordinates in between -1 and 1 (these coordinates are called 
[normalized device coordinates][1]). These coordinates will be stretched by GL 
to fit the viewport (i.e. these numbers always vary between -1 and 1, regardless 
of canvas size and aspect ratio).

To cover the screen perfectly, we'll set up two triangles like so:

<img src="/images/16-06-26/geometry.png" width="500" height="500" />

<p data-height="500" data-theme-id="0" data-slug-hash="GqmroZ" 
data-default-tab="result" data-user="jlfwong" data-embed-version="2" 
class="codepen">See the Pen <a 
href="http://codepen.io/jlfwong/pen/GqmroZ/">WebGL Metaballs Part 1</a> by Jamie 
Wong (<a href="http://codepen.io/jlfwong">@jlfwong</a>) on <a 
href="http://codepen.io">CodePen</a>.</p>

Click "Edit on codepen" and explore the code for it -- I commented the code just 
for you! In a comment at the top, I've included some things to try out to deepen 
your understanding of the code.

# Step 2. Doing something different for each pixel

Running a computation for each pixel isn't helpful if you do the same thing for 
each pixel. To have different information for each pixel, we could either set 
useful varying variables in our vertex shader, or we can use `gl_FragCoord`. 
We'll opt for the second option here.

<p data-height="500" data-theme-id="0" data-slug-hash="Wxjkxv" 
data-default-tab="result" data-user="jlfwong" data-embed-version="2" 
class="codepen">See the Pen <a 
href="http://codepen.io/jlfwong/pen/Wxjkxv/">WebGL Metaballs Part 2</a> by Jamie 
Wong (<a href="http://codepen.io/jlfwong">@jlfwong</a>) on <a 
href="http://codepen.io">CodePen</a>.</p>

The only thing changed between steps 1 and 2 is the fragment shader.  Here's the 
new fragment shader code:

    void main(){
        gl_FragColor = vec4(gl_FragCoord.x/500.0,
                            gl_FragCoord.y/400.0,
                            0.0, 1.0);
    }

Just as last time, click on "Edit on codepen", and read through the challenges 
at the top.

# Step 3. Moving data from CPU to GPU

In step 2, we managed to make each pixel do something different, but the only 
information available there was the coordinates of the pixel. If we're trying to 
render metaballs, we need to get the information about the radius and positions 
of the metaballs into the fragment shader somehow.

There are a few ways of making an array of data available in a fragment shader.

## First option: uniform arrays

Uniforms in GLSL can be integers or floats, can be scalars or vectors, and can 
be arrays or not. We can set them CPU-side using 
[`gl.uniform[1234][fi][v]`][10].
If we set a uniform via `gl.uniform3fv`, then inside the shader, we can access 
it with a declaration like so:

    uniform vec3 metaballs[12];  // The size has to be a compile time constant

This has the benefit of being easy to use, but has a major downside of having a 
low cap on the size of the array. GL implementations have a limit on the number 
of uniform vectors available in fragment shaders. You can find that limit like 
so:

    gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)

Which is 512 on my machine. That means the following compiles:

    uniform highp float vals[512];

But the following gives me `ERROR: too many uniforms` when I try to compile the 
shader:

    uniform highp float vals[513];

This limit is for the whole shader, not per-variable, so the following also 
doesn't compile:

    uniform highp float vals[256];
    uniform highp float vals2[257];

512 is probably good enough for our purposes since we aren't going to have 
hundreds of metaballs, but wouldn't be good enough for transferring information 
about thousands of particles in a particle simulation.

## Second option: 2D textures

**Second option**: 2D textures. Textures can be constructed on the CPU via 
[`gl.createTexture`][11], [`gl.bindTexture`][12], and be populated with 
[`gl.texImage2D`][13]. To make it available in the fragment shader, a `uniform 
sampler2D` can be used.

The benefit of using textures is that you can transfer a *lot* more data. The 
limits on texture size seem a bit fuzzy, but WebGL will at least let you 
allocate a texture up to 1xMAX pixels, where MAX can be found with:

    gl.getParameter(gl.MAX_TEXTURE_SIZE)

Which is 16384 on my machine. In practice, you probably won't be able to use a 
texture at 16384x16384, but regardless you end up with a lot more data to play 
with than 512 uniforms vectors. In practice I've had no issues with 1024x1024 
textures.

Another benefit is that if you're clever, you can run simulations entirely on 
the GPU by "ping ponging" between textures: flipping which one is input and 
which one is output to move forward a timestep in your simulation without 
needing to transfer any of the simulation state between CPU and GPU memory. But 
that's a topic for another day.

The downside is that they're kind of awkward to use: instead of indexing 
directly into an array, you need to convert your array index into a number in 
the range [0, 1], correctly configure the [texture's filtering algorithms][15] 
to be nearest neighbour to avoid dealing with bizarre interpolation between your 
array elements, and if you want support for real floating point numbers, your 
users' browsers and devices have to support the [`OES_texture_float`][16] 
extension.

## Third option: compile the array data into the shader

The benefit of GLSL code being compiled at JavaScript runtime is that you can 
generate GLSL code from JavaScript and compile the result. This means you could 
generate GLSL function calls as needed, one per element in your array.

This is one of the techniques used in the awesome [WebGL Path Tracing][14] demo.

<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

## Implementation with uniform arrays

For our purposes, since we're not transferring massive amounts of data, we'll go 
with the easiest option of using uniform arrays. To the codepen!

<p data-height="500" data-theme-id="0" data-slug-hash="pbAExY" 
data-default-tab="result" data-user="jlfwong" data-embed-version="2" 
class="codepen">See the Pen <a 
href="http://codepen.io/jlfwong/pen/pbAExY/">WebGL Metaballs Part 3</a> by Jamie 
Wong (<a href="http://codepen.io/jlfwong">@jlfwong</a>) on <a 
href="http://codepen.io">CodePen</a>.</p>

Most of the change needed to get to this step is in the fragment shader and in 
new sections at the bottom labelled "simulation setup", and "uniform setup".

If you want to send a `vec3` array from CPU to GPU, you'll need a 
[`Float32Array`][17] with 3 times the number of elements as the `vec3` array.

Here's a snippet of the code that deals with this conversion and sending it to 
the GPU.

    var dataToSendToGPU = new Float32Array(3 * NUM_METABALLS);
    for (var i = 0; i < NUM_METABALLS; i++) {
        var baseIndex = 3 * i;
        var mb = metaballs[i];
        dataToSendToGPU[baseIndex + 0] = mb.x;
        dataToSendToGPU[baseIndex + 1] = mb.y;
        dataToSendToGPU[baseIndex + 2] = mb.r;
    }
    gl.uniform3fv(metaballsHandle, dataToSendToGPU);

# Step 4. Animation and blobbiness

That's pretty much it for the tricky WebGL bits! The last bit is applying the 
same math as in the first part of the [Metaballs and marching squares][0] post 
inside the fragment shader, and then sticking the whole thing in a timer loop 
using [`requestAnimationFrame`][18], along with a bit of logic to make the balls 
move around and bounce off the walls.

<p data-height="500" data-theme-id="0" data-slug-hash="PzKbyg" 
data-default-tab="result" data-user="jlfwong" data-embed-version="2" 
class="codepen">See the Pen <a 
href="http://codepen.io/jlfwong/pen/PzKbyg/">WebGL Metaballs Part 4</a> by Jamie 
Wong (<a href="http://codepen.io/jlfwong">@jlfwong</a>) on <a 
href="http://codepen.io">CodePen</a>.</p>

<script src="/javascripts/webgl-metaballs.js"></script>
<script>
window.addEventListener('load', function() {
    runWebGLMetaballs(document.getElementById('topcanvas'));
});
</script>

# Resources

Thanks for reading! Here are some of the resources that I read to help me 
understand OpenGL, GPUs, and WebGL:

- [Tiny Renderer][19]: Learn how OpenGL works by making your own!
- [How a GPU Works][20]: This helped me understand what's happening inside a GPU 
at a lower level, and reason about performance. For instance, this helped me 
better understand why branching is so expensive on the GPU.
- [Unleash Your Inner Supercomputer: Your Guide to GPGPU with WebGL][21]: A 
fairly thorough but occasionally confusing explanation behind using WebGL for 
computation as opposed to rendering. Reading through the code was instructive.
- [lightgl.js][22]: A lightweight, simpler, but lower level abstraction over 
WebGL than THREE.js. All of the code for it is documented thoroughly using 
[docco][23]. Reading through the code for parts like [`GL.Shader`][24] helped me 
understand WebGL's APIs better.
- [An intro to modern OpenGL. Chapter 1: The Graphics Pipeline][25]: A much more 
thorough explanation of the graphics pipeline, with much better diagrams than 
this post.
- [OpenGL ES Shading Language Reference][26]: A concise overview/cheatsheet of 
GLSL.

[0]: /2014/08/19/metaballs-and-marching-squares/
[1]: http://www.learnopengles.com/understanding-opengls-matrices/
[2]: http://codepen.io/
[3]: https://en.wikipedia.org/wiki/OpenGL_Shading_Language
[4]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
[5]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
[6]: https://www.opengl.org/sdk/docs/man/html/gl_FragCoord.xhtml
[7]: https://www.opengl.org/sdk/docs/man/html/gl_Position.xhtml
[8]: http://threejs.org/
[9]: http://gamedevelopment.tutsplus.com/articles/the-end-of-fixed-function-rendering-pipelines-and-how-to-move-on--cms-21469
[10]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
[11]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createTexture
[12]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
[13]: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
[14]: http://madebyevan.com/webgl-path-tracing/
[15]: https://en.wikipedia.org/wiki/Texture_filtering
[16]: https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float
[17]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[18]: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
[19]: https://github.com/ssloy/tinyrenderer
[20]: http://www.cs.cmu.edu/afs/cs/academic/class/15462-f11/www/lec_slides/lec19.pdf
[21]: http://www.vizitsolutions.com/portfolio/webgl/gpgpu/
[22]: https://github.com/evanw/lightgl.js/
[23]: https://jashkenas.github.io/docco/
[24]: http://evanw.github.io/lightgl.js/docs/shader.html
[25]: http://duriansoftware.com/joe/An-intro-to-modern-OpenGL.-Chapter-1:-The-Graphics-Pipeline.html
[26]: http://www.shaderific.com/glsl/
