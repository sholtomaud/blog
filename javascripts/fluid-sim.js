window.FluidSim = function(canvasId, options) {
  options = options || {};

  options.initVFn = options.initVFn || function(x, y) {
    return [0.05 * Math.sin(2 * Math.PI * y), 0.05 * Math.sin(2 * Math.PI * x)];
  };

  if (options.threshold === undefined) {
    options.threshold = true;
  }

  if (options.advectV === undefined) {
    options.advectV = true;
  }

  var WIDTH = 500;
  var HEIGHT = 400;

  var canvas = document.getElementById(canvasId);
  canvas.style.margin = "0 auto";
  canvas.style.display = "block";

  var gl = GL.create(canvas);
  gl.canvas.width = WIDTH;
  gl.canvas.height = HEIGHT;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Standard 2-triangle mesh covering the viewport
  // when draw with gl.TRIANGLE_STRIP
  var standardMesh = gl.Mesh.load({
    vertices: [
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1]
    ],
    coords: [
      [0, 1],
      [1, 1],
      [0, 0],
      [1, 0]
    ]
  });

  var standardVertexShaderSrc = `
  varying vec2 textureCoord;
  void main() {
    textureCoord = gl_TexCoord.xy;
    gl_Position = gl_Vertex;
  }`;

  // Given a texture holding a 2D velocity field, draw arrows
  // showing the direction of the fluid flow.
  var drawVectorFieldArrows = (function() {
    var shader = new gl.Shader(`
      mat2 rot(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        
        return mat2(
          vec2(c, -s),
          vec2(s, c)
        );
      }

      attribute vec2 position;
      uniform sampler2D velocity;
      void main() {
        vec2 v = texture2D(velocity, (position + 1.0) / 2.0).xy;
        float scale = length(v);
        float angle = atan(v.y, v.x);
        mat2 rotation = rot(-angle);
        gl_Position = vec4(
          (rotation * (scale * gl_Vertex.xy)) + position,
          0.0, 1.0);
      }
    `, `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `);
    
    // Triangle pointing towards positive x axis
    // with baseline on the y axis
    var triangleVertices = [
      [0, 0.2],
      [1, 0],
      [0, -0.2]
    ];

    var arrowsMesh = new gl.Mesh({triangles: false});
    arrowsMesh.addVertexBuffer('positions', 'position');
    
    var INTERVAL = 30;
    
    for (var i = INTERVAL / 2; i < HEIGHT; i += INTERVAL) {
      for (var j = INTERVAL / 2; j < WIDTH; j += INTERVAL) {
        for (var k = 0; k < 3; k++) {
          arrowsMesh.vertices.push(triangleVertices[k]);
          arrowsMesh.positions.push([2 * j / WIDTH - 1, 2 * i / HEIGHT - 1]);
        }
      }
    }
    arrowsMesh.compile();
    
    return function(velocityTexture) {
      velocityTexture.bind(0);
      shader.uniforms({
        velocity: 0
      });
      
      shader.draw(arrowsMesh, gl.TRIANGLES);    
    };
  })();

  // Draw a texture directly to the framebuffer.
  // Will stretch to fit, but in practice the texture and the framebuffer should be
  // the same size.
  var drawTexture = (function() {
    var shader = new gl.Shader(standardVertexShaderSrc, `
      varying vec2 textureCoord;
      uniform sampler2D inputTexture;
      void main() {
        gl_FragColor = texture2D(inputTexture, textureCoord);
      }
    `);
    
    return function(inputTexture) {
      inputTexture.bind(0);
      shader.uniforms({
        input: 0
      });
      shader.draw(standardMesh, gl.TRIANGLE_STRIP)
    };
  })();

  // Draw a texture to the framebuffer, thresholding at 0.5
  var drawTextureThreshold = (function() {
    var shader = new gl.Shader(standardVertexShaderSrc, `
      varying vec2 textureCoord;
      uniform sampler2D inputTexture;
      void main() {
        gl_FragColor = step(0.5, texture2D(inputTexture, textureCoord));
      }
    `);
    
    return function(inputTexture) {
      inputTexture.bind(0);
      shader.uniforms({
        input: 0
      });
      shader.draw(standardMesh, gl.TRIANGLE_STRIP)
    };  
  })();

  // Given an velocity texture and a time delta, advect the
  // quantities in the input texture into the output texture
  var advect = (function() {
  var shader = new gl.Shader(standardVertexShaderSrc, `
      uniform float timeDelta;
      uniform sampler2D inputTexture;
      uniform sampler2D velocity;
      varying vec2 textureCoord;

      void main() {
        vec2 v = texture2D(velocity, textureCoord).xy;
        vec2 pastCoord = fract(textureCoord - (2.0 * timeDelta * v));
        gl_FragColor = texture2D(inputTexture, pastCoord);
      }
    `);
    
    return function(inputTexture, velocityTexture, timeDelta) {
      inputTexture.bind(0);
      velocityTexture.bind(1);

      shader.uniforms({
        timeDelta: timeDelta,
        input: 0,
        velocity: 1
      });
      shader.draw(standardMesh, gl.TRIANGLE_STRIP);
    };
  })();

  // Apply a "splat" of velocity change to a given place with a given
  // blob radius. The effect of the splat has an exponential falloff.
  var addVelocitySplat = (function() {
  var shader = new gl.Shader(standardVertexShaderSrc, `
      uniform vec2 velocityChange;
      uniform vec2 center;
      uniform float radius;
      uniform sampler2D velocity;

      varying vec2 textureCoord;

      void main() {
        float dx = center.x - textureCoord.x;
        float dy = center.y - textureCoord.y;
        vec2 v = texture2D(velocity, textureCoord).xy;
        vec2 newV = v + velocityChange * exp(-(dx * dx + dy * dy) / radius);
        gl_FragColor = vec4(newV, 0.0, 1.0);
      }
    `);  
    
    return function(velocityTexture, velocityChange, center, radius) {
      velocityTexture.bind(0);
      shader.uniforms({
        velocityChange: velocityChange,
        center: center,
        radius: radius,
        velocity: 0
      });
      shader.draw(standardMesh, gl.TRIANGLE_STRIP);
    };
  })();

  var velocityData = new Float32Array(WIDTH * HEIGHT * 4);
  var inkData = new Float32Array(WIDTH * HEIGHT * 4);


  var gridSize = Math.floor(WIDTH / 12);

  for (var i = 0; i < HEIGHT; i++) {
    var y = -((i / HEIGHT) * 2 - 1);
    for (var j = 0; j < WIDTH; j++) {
      var x = (j / WIDTH) * 2 - 1;
      
      var offset = (i * WIDTH + j) * 4;

      var initVal = options.initVFn(x, y);
      velocityData[offset + 0] = initVal[0];
      velocityData[offset + 1] = initVal[1];

      var brightness = (Math.floor(i / gridSize) + Math.floor(j / gridSize)) % 2;
      
      inkData[offset + 0] = brightness;
      inkData[offset + 1] = brightness;
      inkData[offset + 2] = brightness;
      inkData[offset + 3] = 1;
    }
  }

  var velocityTexture0 = new gl.Texture(WIDTH, HEIGHT, {
    type: gl.FLOAT,
    data: velocityData
  });

  var velocityTexture1 = new gl.Texture(WIDTH, HEIGHT, {
    type: gl.FLOAT
  });

  var inkTexture0 = new gl.Texture(WIDTH, HEIGHT, {
    type: gl.FLOAT,
    data: inkData
  });

  var inkTexture1 = new gl.Texture(WIDTH, HEIGHT, {
    type: gl.FLOAT
  });

  var reset = function() {
    velocityTexture0 = new gl.Texture(WIDTH, HEIGHT, {
      type: gl.FLOAT,
      data: velocityData
    });

    inkTexture0 = new gl.Texture(WIDTH, HEIGHT, {
      type: gl.FLOAT,
      data: inkData
    });
  };

  canvas.addEventListener('dblclick', reset);

  var onScreen = function() {
    var container = canvas.offsetParent;
    return (container.scrollTop < canvas.offsetTop + canvas.height &&
            container.scrollTop + container.offsetHeight > canvas.offsetTop);
  };

  gl.ondraw = function() {
    if (!onScreen()) return;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (options.threshold) {
      drawTextureThreshold(inkTexture0);
    } else {
      drawTexture(inkTexture0);
    }

    drawVectorFieldArrows(velocityTexture0);
  };

  gl.onupdate = function() {
    if (!onScreen()) return;
    inkTexture1.drawTo(function() {
      advect(inkTexture0, velocityTexture0, 1/60.0);
    });
    [inkTexture0, inkTexture1] = [inkTexture1, inkTexture0];

    if (options.advectV) {
      velocityTexture1.drawTo(function() {
        advect(velocityTexture0, velocityTexture0, 1/60.0);
      });
      [velocityTexture0, velocityTexture1] = [velocityTexture1, velocityTexture0];
    }
  };

  gl.onmousemove = function(ev) {
    if (ev.dragging) {
      velocityTexture1.drawTo(function() {
        addVelocitySplat(
          velocityTexture0,
          [ev.deltaX / WIDTH, -ev.deltaY / HEIGHT],
          [ev.offsetX / WIDTH, 1.0 - ev.offsetY / HEIGHT],
          0.01
        );
      });
      [velocityTexture0, velocityTexture1] = [velocityTexture1, velocityTexture0];
    }
  };

  gl.animate();
};
