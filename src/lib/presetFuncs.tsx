
export const PRESET_FUNCS = {
  Square: `export const paramsSchema = {
  "Pixel size": {
    type: "number",
    min: 1,
    max: 20,
    default: 10
  },
  "Foreground": {
    type: "Color",
    default: "#000000",
  },
  "Background": {
    type: "Color",
    default: "#ffffff"
  }
}

export function renderCanvas(qr, params, ctx) {
  const pixelSize = params["Pixel size"];
  ctx.canvas.width = qr.matrixWidth * pixelSize;
  ctx.canvas.height = qr.matrixHeight * pixelSize;

  ctx.fillStyle = params["Background"];
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = params["Foreground"];

  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      const module = qr.matrix[y * qr.matrixWidth + x];

      if (module & 1) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}
`,
  Circle: `// qr, ctx are args
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
  Unset: 12,
}
export function renderCanvas(qr, params, ctx) {
  const pixelSize = 10;
  ctx.canvas.width = qr.matrixWidth * pixelSize;
  ctx.canvas.height = qr.matrixHeight * pixelSize;

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
    [qr.margin.left, qr.margin.top],
    [qr.matrixWidth - qr.margin.right - 7, qr.margin.top],
    [qr.margin.left, qr.matrixHeight - qr.margin.bottom - 7],
  ];

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

  const xMid = qr.matrixWidth / 2;
  const yMid = qr.matrixHeight / 2;
  const maxDist = Math.sqrt(xMid * xMid + yMid + yMid);
          
  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      const module = qr.matrix[y * qr.matrixWidth + x];

      if (module & 1) {
        if (module === Module.FinderON) continue;
        if (module === Module.AlignmentON) {
          // Find top left corner of alignment square
          if (qr.matrix[(y - 1) * qr.matrixWidth + x] !== Module.AlignmentON &&
              qr.matrix[y * qr.matrixWidth + x - 1] !== Module.AlignmentON && 
              qr.matrix[y * qr.matrixWidth + x + 1] === Module.AlignmentON
             ) {
            ctx.beginPath();
            ctx.arc((x + 2.5) * pixelSize, (y + 2.5) * pixelSize, 2.5 * pixelSize, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc((x + 2.5) * pixelSize, (y + 2.5) * pixelSize, 1.5 * pixelSize, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc((x + 2.5) * pixelSize, (y + 2.5) * pixelSize, 0.5 * pixelSize, 0, 2 * Math.PI);
            ctx.fill();
          }
          continue; 
        };

        const xCenter = x * pixelSize + radius;
        const yCenter = y * pixelSize + radius;

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
  Camouflage: `// qr, ctx are args
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
  Unset: 12,
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
  const seededRand = splitmix32(1 /* change seed to change pattern */);

  // Randomly set pixels in margin
  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      if (y > qr.margin.top - 2 &&
          y < qr.matrixHeight - qr.margin.bottom + 1 &&
          x > qr.margin.left - 2 &&
          x < qr.matrixWidth - qr.margin.right + 1) {
         continue; 
      }

      if (seededRand() > 0.5) qr.matrix[y * qr.matrixWidth + x] = Module.DataON;
    }
  }

  const pixelSize = 20;
  const radius = pixelSize / 2;
  ctx.canvas.width = qr.matrixWidth * pixelSize;
  ctx.canvas.height = qr.matrixHeight * pixelSize;

  const fg = "rgb(40, 70, 10)";
  const bg = "rgb(200, 200, 100)";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const xMax = qr.matrixWidth - 1;
  const yMax = qr.matrixHeight - 1;

  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      const module = qr.matrix[y * qr.matrixWidth + x];

      const top = y > 0 && (qr.matrix[(y - 1) * qr.matrixWidth + x] & 1);
      const bottom = y < yMax && (qr.matrix[(y + 1) * qr.matrixWidth + x] & 1);
      const left = x > 0 && (qr.matrix[y * qr.matrixWidth + x - 1] & 1);
      const right = x < xMax && (qr.matrix[y * qr.matrixWidth + x + 1] & 1);

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
        const topLeft = y > 0 && x > 0 && (qr.matrix[(y - 1) * qr.matrixWidth + x - 1] & 1);
        const topRight = y > 0 && x < xMax && (qr.matrix[(y - 1) * qr.matrixWidth + x + 1] & 1);
        const bottomRight = y < yMax && x < xMax && (qr.matrix[(y + 1) * qr.matrixWidth + x + 1] & 1);
        const bottomLeft = y < yMax && x > 0 && (qr.matrix[(y + 1) * qr.matrixWidth + x - 1] & 1);
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
  Minimal: `export function renderCanvas(qr, params, ctx) { 
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
    Unset: 12,
  }

  const pixelSize = 12;
  ctx.canvas.width = qr.matrixWidth * pixelSize;
  ctx.canvas.height = qr.matrixHeight * pixelSize;

  const finderPos = [
    [qr.margin.left, qr.margin.top],
    [qr.matrixWidth - qr.margin.right - 7, qr.margin.top],
    [qr.margin.left, qr.matrixHeight - qr.margin.bottom - 7],
  ];

  ctx.fillStyle = "rgb(0, 0, 0)";

  for (const [x, y] of finderPos) {
    ctx.fillRect((x + 3) * pixelSize, y * pixelSize, pixelSize, pixelSize);
    ctx.fillRect((x + 3) * pixelSize, (y + 6) * pixelSize, pixelSize, pixelSize);
    ctx.fillRect(x * pixelSize, (y + 3) * pixelSize, pixelSize, pixelSize);
    ctx.fillRect((x + 6) * pixelSize, (y + 3) * pixelSize, pixelSize, pixelSize);
    
    ctx.fillRect((x + 2) * pixelSize, (y + 2) * pixelSize, 3 * pixelSize, 3 * pixelSize);
  }

  const minSize = pixelSize / 2;
  const offset = (pixelSize - minSize) / 2;

  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      const module = qr.matrix[y * qr.matrixWidth + x];
      if ((module | 1) === Module.FinderON) {
        continue;
      }
      
      if (module & 1) {
        ctx.fillRect(x * pixelSize + offset, y * pixelSize + offset, minSize, minSize);
      }
    }
  }
}
`,
  "Lover (Animated)": `export function renderCanvas(qr, params, ctx) {
  const pixelSize = 10;
  ctx.canvas.width = qr.matrixWidth * pixelSize;
  ctx.canvas.height = qr.matrixHeight * pixelSize;

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
    
    for (let y = 0; y < qr.matrixHeight; y++) {
      for (let x = 0; x < qr.matrixWidth; x++) {
        const module = qr.matrix[y * qr.matrixWidth + x];
        if ((module & 1) === 0) continue;

        const xBias = Math.abs(5 - (x % 10));
        const biasCounter = counter + (x + y) * (period / 20) + xBias * (period / 10);
        
        const ratio = Math.abs((period / 2) - (biasCounter % period)) / (period / 2);
        
        const size = (ratio * amplitude + minSize) * pixelSize;
        
        const offset = (pixelSize - size) / 2;
        
        ctx.fillStyle = \`rgb(\${100 + ratio * 150}, \${200 + xBias * 10}, 255)\`;
        ctx.fillRect(x * pixelSize + offset, y * pixelSize + offset, size, size);
      }
    }
    req = requestAnimationFrame(frame);
  }

  req = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(req);
}
`,
};
