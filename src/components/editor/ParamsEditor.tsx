import {
  closestCenter, createSortable, DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider, transformStyle, useDragDropContext
} from "@thisbeyond/solid-dnd";
import GripVertical from "lucide-solid/icons/grip-vertical";
import Minus from "lucide-solid/icons/minus";
import Plus from "lucide-solid/icons/plus";
import { createSignal, For, Index, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { PARAM_COMPONENTS } from "~/lib/params";
import { useRenderContext } from "~/lib/RenderContext";
import { FlatButton } from "../Button";

export function ParamsEditor() {
  const { paramsSchema, params, setParams } = useRenderContext();
  return (
    <div class="flex flex-col gap-2 mb-4">
      <For each={Object.entries(paramsSchema())}>
        {([label, { type, ...other }]) => {
          if (type === "array") {
            return <ArrayParam label={label} other={other} />;
          }
          return (
            <>
              <div class="flex justify-between">
                <div class="text-sm py-2 w-36 shrink-0">{label}</div>
                <Dynamic
                  component={PARAM_COMPONENTS[type]}
                  {...other}
                  value={params[label]}
                  setValue={(v: any) => setParams(label, v)}
                />
              </div>
            </>
          );
        }}
      </For>
    </div>
  );
}

function ArrayParam({ label, other }) {
  const { params, setParams } = useRenderContext();

  // 0 is falsey and not a valid key
  const idFromIndex = (i) => i + 1;
  const indexFromId = (k) => k - 1;
  const [activeId, setActiveId] = createSignal(null);
  const [dragging, setDragging] = createSignal(false);

  const onDragStart = ({ draggable }) => {
    setActiveId(draggable.id);
    setDragging(true);
  };
  const onDragEnd = ({ draggable, droppable }) => {
    const fromIndex = indexFromId(draggable.id);
    const toIndex = indexFromId(droppable.id);
    if (fromIndex !== toIndex) {
      setParams(label, (prev: any[]) => {
        const updatedItems = prev.slice();
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        return updatedItems;
      });
    }
    setDragging(false);
  };
  return (
    <div class="grid grid-cols-[144px_1fr] justify-items-end gap-y-2">
      <div class="text-sm py-2 w-36">{label}</div>
      <div class="flex gap-1">
        <Show when={other.resizable}>
          <FlatButton
            class="p-1.5"
            onClick={() => setParams(label, (prev: any[]) => prev.slice(0, -1))}
          >
            <Minus />
          </FlatButton>
          <FlatButton
            class="p-1.5"
            onClick={() =>
              setParams(label, (prev: any[]) => [...prev, other.props.default])
            }
          >
            <Plus />
          </FlatButton>
        </Show>
      </div>
      <DragDropProvider
        onDragStart={onDragStart}
        // @ts-expect-error droppable always exists
        onDragEnd={onDragEnd}
        collisionDetector={closestCenter}
      >
        <DragDropSensors />
        <SortableProvider
          ids={Array.from({ length: params[label].length }, (_, i) =>
            idFromIndex(i)
          )}
        >
          <Index each={params[label]}>
            {(v, i) => {
              const sortable = createSortable(idFromIndex(i));
              const [state] = useDragDropContext()!;
              return (
                <>
                  <div class="text-sm py-2 pl-4 w-full text-left">{i}</div>
                  <div
                    class="flex w-full justify-end items-center"
                    classList={{
                      "opacity-25": sortable.isActiveDraggable,
                      "transition-transform": !!state.active.draggable,
                    }}
                    ref={sortable.ref}
                    style={transformStyle(sortable.transform)}
                  >
                    <Dynamic
                      component={
                        PARAM_COMPONENTS[
                          other.props.type as keyof typeof PARAM_COMPONENTS
                        ]
                      }
                      {...other.props}
                      value={v()}
                      setValue={(v: any) => setParams(label, i, v)}
                    />
                    <div class="px-1 cursor-move touch-none" {...sortable.dragActivators}>
                      <GripVertical />
                    </div>
                  </div>
                </>
              );
            }}
          </Index>
        </SortableProvider>
        <DragOverlay>
          <div class="flex w-full justify-end items-center">
            <Show when={dragging()}>
              <Dynamic
                component={
                  PARAM_COMPONENTS[
                    other.props.type as keyof typeof PARAM_COMPONENTS
                  ]
                }
                {...other.props}
                value={params[label][indexFromId(activeId()!)]}
                test={true}
              />
            </Show>
            <div class="px-1 cursor-move">
              <GripVertical />
            </div>
          </div>
        </DragOverlay>
      </DragDropProvider>
    </div>
  );
}
