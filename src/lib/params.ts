import { ColorInput } from "~/components/ColorInput";
import { ImageInput } from "~/components/ImageInput";
import { NumberInput } from "~/components/NumberInput";
import { Select } from "~/components/Select";
import { Switch } from "~/components/Switch";

const PARAM_TYPES = ["boolean", "number", "Color", "Select", "File"];

export const PARAM_COMPONENTS = {
  boolean: Switch,
  number: NumberInput,
  Color: ColorInput,
  Select: Select,
  File: ImageInput,
};

export const PARAM_DEFAULTS = {
  boolean: false,
  number: 0,
  Color: "rgb(0,0,0)",
  // Select: //default is first option
  File: null,
};

export function paramsEqual(
  paramsSchemaA: ParamsSchema,
  paramsSchemaB: ParamsSchema
) {
  const labelsA = Object.keys(paramsSchemaA);
  if (labelsA.length !== Object.keys(paramsSchemaB).length) return false;

  for (const label of labelsA) {
    if (!paramsSchemaB.hasOwnProperty(label)) return false;

    const propsA = Object.keys(paramsSchemaA[label]);
    if (propsA.length != Object.keys(paramsSchemaB[label]).length) return false;

    for (const prop of propsA) {
      if (prop === "options") {
        // @ts-expect-error Object.keys() returns keys
        const optionsA = paramsSchemaA[label][prop] as string[];
        // @ts-expect-error Object.keys() returns keys
        const optionsB = paramsSchemaA[label][prop] as string[];

        if (optionsA.length !== optionsB.length) return false;
        if (optionsA.some((option) => !optionsB.includes(option))) return false;
      } else {
        // @ts-expect-error Object.keys() returns keys
        if (paramsSchemaA[label][prop] !== paramsSchemaB[label][prop])
          return false;
      }
    }
  }

  return true;
}

// TODO
// refactor to parsing instead of validating...
// maybe use zod?
// for now this is easier and prevents obvious accidental crashing
export function parseParamsSchema(rawParamsSchema: any) {
  let parsedParamsSchema: ParamsSchema = {};
  if (typeof rawParamsSchema === "object") {
    for (const [key, value] of Object.entries(rawParamsSchema)) {
      if (
        value == null ||
        typeof value !== "object" ||
        !("type" in value) ||
        typeof value.type !== "string" ||
        !PARAM_TYPES.includes(value.type)
      ) {
        continue;
      } else if (value.type === "Select") {
        if (
          !("options" in value) ||
          !Array.isArray(value.options) ||
          value.options.length === 0
        ) {
          continue;
        }
      }

      // === undefined b/c null is a valid default value for ImageInput
      // @ts-expect-error yes .default might be undefined thanks typescript
      if (value.default === undefined) {
        if (value.type === "Select") {
          // @ts-expect-error adding default, options validated above
          value.default = value.options[0];
        } else {
          // @ts-expect-error adding default, type validated above
          value.default = PARAM_DEFAULTS[value.type];
        }
      }
      // TODO so user set default could be wrong type
      // @ts-expect-error prop types not validated
      parsedParamsSchema[key] = value;
    }
  }

  return parsedParamsSchema;
}

export function defaultParams(paramsSchema: ParamsSchema) {
  const defaultParams: Params = {};
  Object.entries(paramsSchema).forEach(([label, props]) => {
    defaultParams[label] = props.default;
  });
  return defaultParams;
}

type PARAM_VALUE_TYPES = {
  boolean: boolean;
  number: number;
  Color: string;
  Select: never; // see Params, uses options field instead of this mapping
  File: File | null;
};

export type Params<T extends RawParamsSchema = ParamsSchema> = {
  [K in keyof T]: T[K] extends { type: "Select" }
    ? T[K]["options"][number]
    : PARAM_VALUE_TYPES[T[K]["type"]];
} & {}; // & {} necessary for readable typehints, see ts "prettify"

export type ParamsSchema = {
  [label: string]: Required<RawParamsSchema[string]>;
};

export type RawParamsSchema = SchemaFromMapping<typeof PARAM_COMPONENTS>;

/**
 * Given object mapping keys to components, returns union of [key, props]
 */
type Step1<T extends { [key: keyof any]: (...args: any) => any }> = {
  [K in keyof T]: [K, Parameters<T[K]>[0]];
}[keyof T];

/**
 * Given union of [key, props]:
 *
 * adds default to props based on type of value and removes value and setValue from props
 */
type Step2<T extends [keyof any, { [prop: string]: any }]> = T extends any
  ? [T[0], Omit<T[1], "value" | "setValue"> & { default?: T[1]["value"] }]
  : never;

/**
 * Converts each tuple to an object with a type corresponding to key
 * (discriminated union of component props) assignable to any label
 */
type Step3<T extends [keyof any, { [prop: string]: any }]> = {
  [label: string]: T extends any ? { type: T[0] } & T[1] : never;
};

type SchemaFromMapping<T extends { [key: string]: (...args: any) => any }> =
  Step3<Step2<Step1<T>>>;
