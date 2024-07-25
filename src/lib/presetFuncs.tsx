export const PRESET_FUNCS = {
  Square: `export const paramsSchema = {
  "Margin": {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Foreground": {
    type: "Color",
    default: "#000000",
  },
  "Background": {
    type: "Color",
    default: "#ffffff"
  },
}

export function renderCanvas(qr, params, ctx) {
  const pixelSize = 10;
  const matrixWidth = qr.version * 4 + 17;
  const canvasSize = (matrixWidth + 2 * params["Margin"]) * pixelSize;

  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  ctx.fillStyle = params["Background"];
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = params["Foreground"];

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];

      if (module & 1) {
        ctx.fillRect(
          (x + params["Margin"]) * pixelSize,
          (y + params["Margin"]) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}
`,
  Circle: `export const paramsSchema = {
  "Circular finder pattern": {
    type: "boolean",
    default: true,
  },
  "Circular alignment pattern": {
    type: "boolean",
    default: true,
  },
}

const Module = {
  DataOFF: 0,
  DataON: 1,
  FinderOFF: 2,
  FinderON: 3,
  AlignmentOFF: 4,
  AlignmentON: 5,
  TimingOFF: 6,
  TimingON: 7,
  FormatOFF: 8,
  FormatON: 9,
  VersionOFF: 10,
  VersionON: 11,
  SeparatorOFF: 12,
}
export function renderCanvas(qr, params, ctx) {
  const pixelSize = 10;
  const margin = 2;
  const matrixWidth = qr.version * 4 + 17;
  const canvasSize = (matrixWidth + 2 * margin) * pixelSize;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const gradient = ctx.createRadialGradient(
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    2 * pixelSize,
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    20 * pixelSize,
  );

  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, "blue");

  ctx.fillStyle = gradient;

  const radius = pixelSize / 2;

  const finderPos = [
    [margin, margin],
    [margin + matrixWidth - 7, margin],
    [margin, margin + matrixWidth - 7],
  ];

  if (params["Circular finder pattern"]) {
    for (const [x, y] of finderPos) {
      ctx.beginPath();
      ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 3.5 * pixelSize, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.beginPath();
      ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 2.5 * pixelSize, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 1.5 * pixelSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  const xMid = matrixWidth / 2;
  const yMid = matrixWidth / 2;
  const maxDist = Math.sqrt(xMid * xMid + yMid * yMid);
          
  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];

      if (module & 1) {
        if (params["Circular finder pattern"] && module === Module.FinderON) continue;
        if (params["Circular alignment pattern"] && module === Module.AlignmentON) {
          // Find top left corner of alignment square
          if (qr.matrix[(y - 1) * matrixWidth + x] !== Module.AlignmentON &&
              qr.matrix[y * matrixWidth + x - 1] !== Module.AlignmentON && 
              qr.matrix[y * matrixWidth + x + 1] === Module.AlignmentON
             ) {
            const xPos = x + 2.5 + margin;
            const yPos = y + 2.5 + margin;

            ctx.beginPath();
            ctx.arc(xPos * pixelSize, yPos * pixelSize, 2.5 * pixelSize, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(xPos * pixelSize, yPos * pixelSize, 1.5 * pixelSize, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(xPos * pixelSize, yPos * pixelSize, 0.5 * pixelSize, 0, 2 * Math.PI);
            ctx.fill();
          }
          continue; 
        };

        const xCenter = (x + margin) * pixelSize + radius;
        const yCenter = (y + margin) * pixelSize + radius;

        const xDist = Math.abs(xMid - x);
        const yDist = Math.abs(yMid - y);
        const scale = Math.sqrt(xDist * xDist + yDist * yDist) / maxDist * 0.7 + 0.5;
        
        ctx.beginPath();
        ctx.arc(xCenter, yCenter, radius * scale, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}
`,
  Camouflage: `export const paramsSchema = {
  "Margin": {
    type: "number",
    min: 0,
    max: 10,
    default: 3,
  },
  "Quiet zone": {
    type: "number",
    min: 0,
    max: 10,
    default: 1,
  },
  "Seed": {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
}

const Module = {
  DataOFF: 0,
  DataON: 1,
  FinderOFF: 2,
  FinderON: 3,
  AlignmentOFF: 4,
  AlignmentON: 5,
  TimingOFF: 6,
  TimingON: 7,
  FormatOFF: 8,
  FormatON: 9,
  VersionOFF: 10,
  VersionON: 11,
  SeparatorOFF: 12,
}

function splitmix32(a) {
 return function() {
   a |= 0;
   a = a + 0x9e3779b9 | 0;
   let t = a ^ a >>> 16;
   t = Math.imul(t, 0x21f0aaad);
   t = t ^ t >>> 15;
   t = Math.imul(t, 0x735a2d97);
   return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
}

export function renderCanvas(qr, params, ctx) {
  const seededRand = splitmix32(params["Seed"]);
  const margin = params["Margin"];
  const quietZone = params["Quiet zone"];

  const pixelSize = 10;
  const radius = pixelSize / 2;
  const qrWidth = qr.version * 4 + 17;
  const matrixWidth = qrWidth + 2 * margin;
  const canvasSize = matrixWidth * pixelSize;

  const newMatrix = Array(matrixWidth * matrixWidth).fill(Module.SeparatorOFF);

  // Copy qr to matrix with margin and randomly set pixels in margin
  for (let y = 0; y < margin - quietZone; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }
  for (let y = margin - quietZone; y < margin + qrWidth + quietZone; y++) {
    for (let x = 0; x < margin - quietZone; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
    if (y >= margin && y < margin + qrWidth) {
      for (let x = margin; x < matrixWidth - margin; x++) {
        newMatrix[y * matrixWidth + x] = qr.matrix[(y - margin) * qrWidth + x - margin];
      }
    }
    for (let x = margin + qrWidth + quietZone; x < matrixWidth; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }
  for (let y = margin + qrWidth + quietZone; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }

  const fg = "rgb(40, 70, 10)";
  const bg = "rgb(200, 200, 100)";

  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const xMax = matrixWidth - 1;
  const yMax = matrixWidth - 1;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = newMatrix[y * matrixWidth + x];

      const top = y > 0 && (newMatrix[(y - 1) * matrixWidth + x] & 1);
      const bottom = y < yMax && (newMatrix[(y + 1) * matrixWidth + x] & 1);
      const left = x > 0 && (newMatrix[y * matrixWidth + x - 1] & 1);
      const right = x < xMax && (newMatrix[y * matrixWidth + x + 1] & 1);

      ctx.fillStyle = fg;
      
      if (module & 1) {
        ctx.beginPath();
        ctx.roundRect(
          x * pixelSize,
          y * pixelSize,
          pixelSize,
          pixelSize,
          [
            !left && !top && radius,
            !top && !right && radius,
            !right && !bottom && radius,
            !bottom && !left && radius,
          ]
        );
        ctx.fill();
      } else {
        // Draw rounded concave corners
        const topLeft = y > 0 && x > 0 && (newMatrix[(y - 1) * matrixWidth + x - 1] & 1);
        const topRight = y > 0 && x < xMax && (newMatrix[(y - 1) * matrixWidth + x + 1] & 1);
        const bottomRight = y < yMax && x < xMax && (newMatrix[(y + 1) * matrixWidth + x + 1] & 1);
        const bottomLeft = y < yMax && x > 0 && (newMatrix[(y + 1) * matrixWidth + x - 1] & 1);
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        
        ctx.beginPath();
        ctx.fillStyle = bg;
        ctx.roundRect(
          x * pixelSize,
          y * pixelSize,
          pixelSize,
          pixelSize,
          [
            left && top && topLeft && radius,
            top && right && topRight && radius,
            right && bottom && bottomRight && radius,
            bottom && left && bottomLeft && radius,
          ]
        );
        ctx.fill();
      }
    }
  }
}
`,
  Minimal: `export const paramsSchema = {
  "Margin": {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Pixel size": {
    type: "number",
    min: 0,
    max: 20,
    default: 8,
  },
  "Small pixel size": {
    type: "number",
    min: 1,
    max: 20,
    default: 4,
  },
}
export function renderCanvas(qr, params, ctx) { 
  const Module = {
    DataOFF: 0,
    DataON: 1,
    FinderOFF: 2,
    FinderON: 3,
    AlignmentOFF: 4,
    AlignmentON: 5,
    TimingOFF: 6,
    TimingON: 7,
    FormatOFF: 8,
    FormatON: 9,
    VersionOFF: 10,
    VersionON: 11,
    SeparatorOFF: 12,
  }

  const margin = params["Margin"];
  const pixelSize = params["Pixel size"];
  const minSize = params["Small pixel size"];

  const matrixWidth = qr.version * 4 + 17;
  const canvasSize = (matrixWidth + 2 * margin) * pixelSize;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  const finderPos = [
    [margin, margin],
    [matrixWidth + margin - 7, margin],
    [margin, matrixWidth + margin - 7],
  ];

  ctx.fillStyle = "rgb(0, 0, 0)";

  for (const [x, y] of finderPos) {
    ctx.fillRect((x + 3) * pixelSize, y * pixelSize, pixelSize, pixelSize);
    ctx.fillRect((x + 3) * pixelSize, (y + 6) * pixelSize, pixelSize, pixelSize);
    ctx.fillRect(x * pixelSize, (y + 3) * pixelSize, pixelSize, pixelSize);
    ctx.fillRect((x + 6) * pixelSize, (y + 3) * pixelSize, pixelSize, pixelSize);
    
    ctx.fillRect((x + 2) * pixelSize, (y + 2) * pixelSize, 3 * pixelSize, 3 * pixelSize);
  }

  const offset = (pixelSize - minSize) / 2;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];
      if ((module | 1) === Module.FinderON) {
        continue;
      }
      
      if (module & 1) {
        ctx.fillRect(
          (x + margin) * pixelSize + offset,
          (y + margin) * pixelSize + offset,
          minSize,
          minSize
        );
      }
    }
  }
}
`,
  "Lover (Animated)": `export function renderCanvas(qr, params, ctx) {
  const pixelSize = 10;
  const margin = 2;
  const matrixWidth = qr.version * 4 + 17;
  const canvasSize = (matrixWidth + 2 * margin) * pixelSize;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  const period = 3000; // ms
  const amplitude = 0.8; // maxSize - minSize
  const minSize = 0.6;

  let counter = 0; 
  let prevTimestamp;

  let req;
  function frame(timestamp) {
    // performance.now() and requestAnimationFrame's timestamp are not consistent together
    if (prevTimestamp != null) {
      counter += timestamp - prevTimestamp;
    }
    
    prevTimestamp = timestamp;
    
    if (counter >= period) {
      counter -= period;
    }
    
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (let y = 0; y < matrixWidth; y++) {
      for (let x = 0; x < matrixWidth; x++) {
        const module = qr.matrix[y * matrixWidth + x];
        if ((module & 1) === 0) continue;

        const xBias = Math.abs(5 - (x % 10));
        const biasCounter = counter + (x + y) * (period / 20) + xBias * (period / 10);
        
        const ratio = Math.abs((period / 2) - (biasCounter % period)) / (period / 2);
        
        const size = (ratio * amplitude + minSize) * pixelSize;
        
        const offset = (pixelSize - size) / 2;
        
        ctx.fillStyle = \`rgb(\${100 + ratio * 150}, \${200 + xBias * 10}, 255)\`;
        ctx.fillRect((x + margin) * pixelSize + offset, (y + margin) * pixelSize + offset, size, size);
      }
    }
    req = requestAnimationFrame(frame);
  }

  req = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(req);
}
`,
};
