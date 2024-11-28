export function initShaders(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  
  if (!vertexShader || !fragmentShader) return null
  
  const program = gl.createProgram()
  if (!program) return null
  
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program))
    return null
  }
  
  // Create and bind vertex buffer
  const vertices = new Float32Array([
    -1, -1,  // bottom left
     1, -1,  // bottom right
    -1,  1,  // top left
    -1,  1,  // top left
     1, -1,  // bottom right
     1,  1,  // top right
  ])
  
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  
  return program
}

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                       0.366025403784439,
                      -0.577350269189626,
                       0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    float time = u_time * 0.15;
    
    // Create fluid-like movement
    float noise1 = snoise(vec2(uv.x * 3.0 + time, uv.y * 2.0)) * 0.5;
    float noise2 = snoise(vec2(uv.x * 5.0 - time * 0.5, uv.y * 4.0)) * 0.25;
    float noise3 = snoise(vec2(uv.x * 7.0 + time * 0.2, uv.y * 6.0)) * 0.125;
    
    float combinedNoise = noise1 + noise2 + noise3;
    
    // Modified transition edge for complete coverage
    float edge = smoothstep(-0.2, 0.8, (uv.x - time + combinedNoise * 0.4));
    
    // Changed to transition from black to white
    vec3 color = vec3(clamp(edge, 0.0, 1.0));
    
    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  
  return shader
} 