import { createSignal } from "solid-js";
import { type SetStoreFunction } from "solid-js/store";

type Props = {
  width: number;
  height: number;
  margin: number;
  color: number;
  // setColor: (c: number) => void;
  grid: number[];
  setGrid: SetStoreFunction<number[]>;
};

export function RenderGrid(props: Props) {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  const getPos = (e: MouseEvent) => {
    const { width, height } = canvas.getBoundingClientRect();
    const x = Math.floor((props.width * e.offsetX) / width);
    const y = Math.floor((props.height * e.offsetY) / height);
    return { x, y };
  };

  const setPixel = (x: number, y: number) => {
    if (props.color === props.grid[y * props.width + x]) return;

    props.setGrid(y * props.width + x, props.color!);
    console.log("set", x, y);
    if (props.color) {
      ctx.fillRect(x, y, 1, 1);
    } else {
      ctx.clearRect(x, y, 1, 1);
    }
  };

  const onMouseUp = () => {
    setStroke(false);
    prevX = null;
    prevY = null;
    removeEventListener("mousedown", onMouseUp);
  };

  const [stroke, setStroke] = createSignal<boolean>(false);

  let prevX: number | null = null;
  let prevY: number | null = null;

  return (
    <canvas
      class="absolute top-0 w-full"
      style={{ "image-rendering": "pixelated" }}
      ref={(ref) => {
        canvas = ref;
        ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "red";
        // ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, props.width, props.height);
      }}
      width={props.width}
      height={props.height}
      onContextMenu={(e) => {
        // ctx.clearRect(0, 0, props.width, props.width);
        // props.setGrid(Array(props.width * props.height).fill(false));
        e.preventDefault();
        ctx.fillStyle = "red";
        // ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, props.width, props.height);
      }}
      onMouseDown={(e) => {
        if (e.button != 0) return;

        const { x, y } = getPos(e);
        setPixel(x, y);

        setStroke(true);

        prevX = x;
        prevY = y;

        document.addEventListener("mouseup", onMouseUp);
      }}
      onMouseMove={(e) => {
        if (!stroke()) return;

        // Never true, but silences ts
        if (prevX == null) return;
        if (prevY == null) return;

        const { x, y } = getPos(e);

        const xDist = Math.abs(x - prevX);
        const yDist = Math.abs(y - prevY);
        if (xDist > 1 || yDist > 1) {
          if (yDist > xDist) {
            const slope = (x - prevX) / yDist;
            let xPos = prevX;
            if (prevY < y) {
              for (let yPos = prevY + 1; yPos < y; yPos++) {
                xPos += slope;
                setPixel(Math.floor(xPos), yPos);
              }
            } else {
              for (let yPos = prevY - 1; yPos > y; yPos--) {
                xPos += slope;
                setPixel(Math.floor(xPos), yPos);
              }
            }
          } else {
            const slope = (y - prevY) / xDist;
            let yPos = prevY;
            if (prevX < x) {
              for (let xPos = prevX + 1; xPos < x; xPos++) {
                yPos += slope;
                setPixel(xPos, Math.floor(yPos));
              }
            } else {
              for (let xPos = prevX - 1; xPos > x; xPos--) {
                yPos += slope;
                setPixel(xPos, Math.floor(yPos));
              }
            }
          }
        }

        setPixel(x, y);
        prevX = x;
        prevY = y;
      }}
    ></canvas>
  );
}
