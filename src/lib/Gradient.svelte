<script lang="ts">

import * as twgl from "twgl.js";
import { onMount } from "svelte";
import { createNoise2D } from "simplex-noise";

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;
let frame: number;
let program: WebGLProgram;

let noise = createNoise2D(Math.random);

onMount(() => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = canvas.getContext("webgl");
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const vs = `

    attribute vec2 a_position;
    varying vec2 v_texcoord;

    void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texcoord = a_position * 0.5 + 0.5;
    }

    `;
    const fs = `
    
    precision mediump float;

    uniform sampler2D u_texture;
    uniform vec2 u_scale;

    uniform vec3 u_colors[8];
    uniform vec2 u_offsets[8];
    uniform bool u_skip[8];

    varying vec2 v_texcoord;

    void main() {
        
        vec3 color = vec3(0);
        float weights[8];
        float biggestWeight = 0.0;
        float noise = texture2D(u_texture, v_texcoord * u_scale).r;
        for (int i = 0; i < 8; i++) {
            float sqrDist = pow(v_texcoord.x - u_offsets[i].x, 2.0) + pow(v_texcoord.y - u_offsets[i].y, 2.0);
            weights[i] = pow(1.0 / (sqrDist + 0.0001), 1.0);

            if (u_skip[i]) {
                weights[i] = 0.0;
            }

            if (weights[i] > biggestWeight) {
                biggestWeight = weights[i];
            }
        }

        for (int i = 0; i < 8; i++) {
            if (weights[i] == biggestWeight) {
                weights[i] *= 1.04;
            }
            
            weights[i] /= biggestWeight;
            weights[i] = pow(weights[i], 2.0);
        }

        float totalWeight = 0.0;
        for (int i = 0; i < 8; i++) {
            totalWeight += weights[i];
        }

        float sum = 0.0;
        for (int i = 0; i < 8; i++) {
            sum += weights[i];
            if (noise < sum / totalWeight) {
                color = u_colors[i];
                break;
            }
        }

        gl_FragColor = vec4(color, 1);
        
    }

    `;

    program = twgl.createProgramFromSources(gl, [vs, fs]);
    gl.useProgram(program);

    // Draw screen rectangle with texture coordinates
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const noiseTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    // Asynchronously load an image
    const image = new Image();
    image.src = "noise.png";

    image.addEventListener('load', function(e) {
        console.log('loaded', e);
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.generateMipmap(gl.TEXTURE_2D);
    });

    // Set uniforms

    const scaleLocation = gl.getUniformLocation(program, "u_scale");
    // Scale to pixel ratio
    gl.uniform2f(scaleLocation, window.devicePixelRatio, 1 / window.devicePixelRatio);
    console.log(window.devicePixelRatio);

    return createLoop(render);
});

function hexToRgb(hex: string): [number, number, number] {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
 ] : null;
}

function setColors(colors: { color: string | [number, number, number], position: [number, number] }[]) {
    const colorsLocation = gl.getUniformLocation(program, "u_colors");
    const offsetsLocation = gl.getUniformLocation(program, "u_offsets");
    const skipLocation = gl.getUniformLocation(program, "u_skip");

    const colorsArray = new Float32Array(24);
    const offsetsArray = new Float32Array(16);
    const skipArray = new Uint8Array(8).fill(1);
    

    if (colors.length > 8) {
        throw new Error("Too many colors");
    }

    for (let i = 0; i < colors.length; i++) {
        const color = typeof colors[i].color === "string" ? hexToRgb(colors[i].color as string) : colors[i].color as [number, number, number];

        colorsArray[i * 3] = color[0];
        colorsArray[i * 3 + 1] = color[1];
        colorsArray[i * 3 + 2] = color[2];

        offsetsArray[i * 2] = colors[i].position[0];
        offsetsArray[i * 2 + 1] = colors[i].position[1];

        skipArray[i] = 0;
    }

    gl.uniform3fv(colorsLocation, colorsArray);
    gl.uniform2fv(offsetsLocation, offsetsArray);
    gl.uniform1iv(skipLocation, skipArray);
}

function normalizedNoise(x: number, y: number) {
    return (noise(x, y) + 1) / 2;
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

function lerpPosition(a: [number, number], b: [number, number], t: number): [number, number] {
    return [
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
    ];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
    return [
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t),
    ];
}

let prevPhase = 0;
let phaseChangeTime = 0;

export let phase = 0;
export let albumColors: { r: number, g: number, b: number, a: number }[] = [];

function render(elapsed: number, dt: number) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (prevPhase !== phase) {
        phaseChangeTime = elapsed;
        prevPhase = phase;
    }

    let darkBlue = "#0c1424";
    let lightBlue = "#25365b";

    let darkBlueRgb = hexToRgb(darkBlue);
    let lightBlueRgb = hexToRgb(lightBlue);

    let black: [number, number, number] = [0, 0, 0];

    const speed = 0.01;
    let positions: [number, number][] = new Array(8).fill([0, 0]).map((_, i) => {
        return [normalizedNoise(elapsed * speed, i * 2000), normalizedNoise(elapsed * speed, i * 2000 + 1000)];
    });

    let smooth = Math.exp(-(elapsed - phaseChangeTime));
    let invSmooth = 1 - smooth;
    if (phase === 0) {
        setColors([
            { color: darkBlueRgb, position: positions[0] },
            { color: lightBlueRgb, position: positions[1] },
        ]);
    } else if (phase === 1) {
        setColors([
            { color: lerpColor(darkBlueRgb, black, invSmooth), position: lerpPosition(positions[0], [0.5, 0.5], invSmooth)},
            { color: lerpColor(lightBlueRgb, black, invSmooth), position: lerpPosition(positions[0], [0.5, 0.5], invSmooth)}
        ])
    } else if (phase === 2) {
        let centerAttraction = 1 - Math.pow(smooth, 3);
        let elapsedSinceChange = elapsed - phaseChangeTime;
        let spinny = sigmoid(elapsedSinceChange - 4) * 4 * Math.PI * 2;
        let spinAttraction = Math.min(1, Math.exp(-(elapsedSinceChange - 6) / 2));
        setColors(albumColors.map((color, i) => {
            let angle = i / 8 * Math.PI * 2 + spinny;
            let spinX = 0.5 + Math.cos(angle) * centerAttraction * 0.3;
            let spinY = 0.5 + Math.sin(angle) * centerAttraction * 0.3;
            let x = lerp(positions[i][0], spinX, spinAttraction);
            let y = lerp(positions[i][1], spinY, spinAttraction);

            return {
                color: [lerp(0, color.r / 255, centerAttraction), lerp(0, color.g / 255, centerAttraction), lerp(0, color.b / 255, centerAttraction)],
                position: [x, y],
            };
        }));
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function createLoop (fn: Function) {
    let elapsed = 0;
    let lastTime = performance.now();
    (function loop() {
        frame = requestAnimationFrame(loop);
        const beginTime = performance.now();
        const dt = (beginTime - lastTime) / 1000;
        lastTime = beginTime;
        elapsed += dt;
        fn(elapsed, dt);
    })();
    return () => {
        cancelAnimationFrame(frame);
    };
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scaleLocation = gl.getUniformLocation(program, "u_scale");
    gl.uniform2f(scaleLocation, window.devicePixelRatio, window.devicePixelRatio);

    gl.viewport(0, 0, canvas.width, canvas.height);
}

</script>

<div class="canvas-container">
    <canvas class:full-opacity={phase === 2} class:half-opacity={phase === 0} bind:this={canvas} ></canvas>
    
</div>
<svelte:window on:resize|passive={handleResize} />


<style>
    .canvas-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }

    canvas {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        opacity: 0;
        animation: fade-in 4s ease-in-out forwards;
    }

    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>