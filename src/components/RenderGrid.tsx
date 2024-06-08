import { createEffect, createSignal, onCleanup } from "solid-js";
import { type SetStoreFunction } from "solid-js/store";
import { usePaintContext, type BoxSelection } from "~/lib/PaintContext";

type Props = {
  width: number;
  height: number;
  color: number;
  // grid: number[];
  // setGrid: SetStoreFunction<number[]>;
};

enum Mode {
  Select,
  Brush,
}

type Selection = {
  left: number;
  right: number;
  top: number;
  bot: number;
};
const UNIT = 1;

function clamp(a: number, min: number, max: number) {
  return Math.min(Math.max(a, min), max);
}

export function RenderGrid(props: Props) {
  const { selections, setSelectionsInPlace } = usePaintContext();

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
  //   if (props.color === props.grid[y * props.width + x]) return;

  //   props.setGrid(y * props.width + x, props.color!);
  //   if (props.color) {
  //     ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);
  //   } else {
  //     ctx.clearRect(x * UNIT, y * UNIT, UNIT, UNIT);
  //   }
  };

  let selection: BoxSelection | null;

  function onMouseMove(e: MouseEvent) {
    const { x, y } = getPos(e);

    if (mode() === Mode.Select) {
      if (deselectIntent && x === prevX && y === prevY) return;

      selectCtx.clearRect(0, 0, props.width * UNIT, props.height * UNIT);

      selectCtx.fillStyle = "rgb(59, 130, 246)";
      selections().forEach((sel) => {
        selectCtx.fillRect(
          sel.left * UNIT,
          sel.top * UNIT,
          (sel.right - sel.left) * UNIT,
          (sel.bot - sel.top) * UNIT
        );
      });

      // @ts-expect-error initialized below
      let sel: Selection = {};
      if (x <= prevX) {
        sel.left = x;
        sel.right = prevX + 1;
      } else {
        sel.left = prevX;
        sel.right = x + 1;
      }
      if (y <= prevY) {
        sel.top = y;
        sel.bot = prevY + 1;
      } else {
        sel.top = prevY;
        sel.bot = y + 1;
      }
      selection = sel;

      selectCtx.fillRect(
        sel.left * UNIT,
        sel.top * UNIT,
        (sel.right - sel.left) * UNIT,
        (sel.bot - sel.top) * UNIT
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
    if (selection != null) {
      setSelectionsInPlace((prev) => {
        // @ts-expect-error i'm right unless somehow this isn't synchronous
        prev.push(selection);
        return prev;
      });
    }
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  onCleanup(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  });

  const [mode, setMode] = createSignal(Mode.Select);

  const [brushSize, setBrushSize] = createSignal(1);

  // let selectedBoxes: Selection[] = [];

  let prevX: number;
  let prevY: number;

  let deselectIntent: boolean;

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
        onMouseDown={(e) => {
          if (e.button != 0) return;

          const { x, y } = getPos(e);

          if (mode() === Mode.Select) {
            deselectIntent = false;
            if (!(e.shiftKey || e.ctrlKey)) {
              deselectIntent = selections().length > 0;

              if (deselectIntent) {
                selectCtx.clearRect(
                  0,
                  0,
                  props.width * UNIT,
                  props.height * UNIT
                );
                setSelectionsInPlace([]);
                selection = null;
              }
            }

            if (!deselectIntent) {
              selection = {
                left: x,
                right: x + 1,
                top: y,
                bot: y + 1,
              };
              selectCtx.fillStyle = "rgb(59, 130, 246)";
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
