import { createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { type SetStoreFunction } from "solid-js/store";

type Props = {
  width: number;
  height: number;
  color: number;
  grid: number[];
  setGrid: SetStoreFunction<number[]>;
};

enum Mode {
  Select,
  Brush,
}

const UNIT = 10;

function clamp(a: number, min: number, max: number) {
  return Math.min(Math.max(a, min), max);
}

export function RenderGrid(props: Props) {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let selectCanvas: HTMLCanvasElement;
  let selectCtx: CanvasRenderingContext2D;

  const getPos = (e: MouseEvent) => {
    const canvasRect = canvas.getBoundingClientRect();
    let xDist = clamp(e.clientX - canvasRect.x, 0, canvasRect.width - 1);
    let yDist = clamp(e.clientY - canvasRect.y, 0, canvasRect.height - 1);

    const x = Math.floor((props.width * xDist) / canvasRect.width);
    const y = Math.floor((props.height * yDist) / canvasRect.height);

    return { x, y };
  };

  const setPixel = (x: number, y: number) => {
    if (props.color === props.grid[y * props.width + x]) return;

    props.setGrid(y * props.width + x, props.color!);
    console.log("set", x, y);
    if (props.color) {
      ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);
    } else {
      ctx.clearRect(x * UNIT, y * UNIT, UNIT, UNIT);
    }
  };

  let selection = {
    left: 0,
    right: 0,
    top: 0,
    bot: 0,
  };

  function onMouseMove(e: MouseEvent) {
    const { x, y } = getPos(e);

    if (mode() === Mode.Select) {
      if (deselectIntent && x === prevX && y === prevY) return;

      selectCtx.clearRect(0, 0, props.width * UNIT, props.height * UNIT);

      selectedBoxes.forEach((s) => {
        selectCtx.fillRect(
          s.left * UNIT,
          s.top * UNIT,
          (s.right - s.left) * UNIT,
          (s.bot - s.top) * UNIT
        );
      });

      if (x <= prevX) {
        selection.left = x;
        selection.right = prevX + 1;
      } else {
        selection.left = prevX;
        selection.right = x + 1;
      }
      if (y <= prevY) {
        selection.top = y;
        selection.bot = prevY + 1;
      } else {
        selection.top = prevY;
        selection.bot = y + 1;
      }
      selectCtx.fillRect(
        selection.left * UNIT,
        selection.top * UNIT,
        (selection.right - selection.left) * UNIT,
        (selection.bot - selection.top) * UNIT
      );
    } else {
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
    }
  }

  const onMouseUp = () => {
    selectedBoxes.push({ ...selection });
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  onCleanup(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  });

  const [mode, setMode] = createSignal(Mode.Select);

  const [brushSize, setBrushSize] = createSignal(1);

  let selectedBoxes: (typeof selection)[] = [];

  let prevX: number;
  let prevY: number;

  let deselectIntent: boolean;

  onMount(() => {
    selectCtx.fillStyle = "rgb(59, 130, 246)";
    // selectCtx.globalAlpha = 0.5;
    // selectCtx.globalCompositeOperation = "source-out";
  });

  return (
    <>
      <canvas
        class="absolute top-0 w-full"
        style={{ "image-rendering": "pixelated" }}
        ref={(ref) => {
          canvas = ref;
          ctx = canvas.getContext("2d")!;
        }}
        width={props.width * UNIT}
        height={props.height * UNIT}
      ></canvas>
      <canvas
        class="absolute top-0 w-full opacity-50"
        style={{ "image-rendering": "pixelated" }}
        ref={(ref) => {
          selectCanvas = ref;
          selectCtx = selectCanvas.getContext("2d")!;
        }}
        width={props.width * UNIT}
        height={props.height * UNIT}
        // onContextMenu={(e) => {
        //   // ctx.clearRect(0, 0, props.width, props.width);
        //   // props.setGrid(Array(props.width * props.height).fill(false));
        //   e.preventDefault();
        //   ctx.fillStyle = "red";
        //   // ctx.globalAlpha = 0.5;
        //   ctx.fillRect(0, 0, props.width, props.height);
        // }}
        onMouseDown={(e) => {
          if (e.button != 0) return;

          const { x, y } = getPos(e);

          if (mode() === Mode.Select) {
            deselectIntent = false;
            if (!(e.shiftKey || e.ctrlKey)) {
              deselectIntent = selectedBoxes.length > 0;
              if (deselectIntent) {
                selectCtx.clearRect(
                  0,
                  0,
                  props.width * UNIT,
                  props.height * UNIT
                );
                selectedBoxes = [];
              }
            }

            if (!deselectIntent) {
              selection.left = x;
              selection.right = x + 1;
              selection.top = y;
              selection.bot = y + 1;
              selectCtx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);
            }
          } else {
            setPixel(x, y);
          }
          prevX = x;
          prevY = y;

          document.addEventListener("mouseup", onMouseUp);
          document.addEventListener("mousemove", onMouseMove);
        }}
      ></canvas>
    </>
  );
}
