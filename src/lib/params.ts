import { ColorInput } from "~/components/ColorInput";
import { ImageInput } from "~/components/ImageInput";
import { NumberInput } from "~/components/NumberInput";
import { Select } from "~/components/Select";
import { Switch } from "~/components/Switch";


export const PARAM_TYPES = ["boolean", "number", "Color", "Select", "File"]

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
  // Select: default is first option
  File: null,
};

export type Params = {
  [label: string]: Exclude<ParamsSchema[string]["default"], undefined>;
};

export type ParamsSchema = SchemaFromMapping<typeof PARAM_COMPONENTS>;

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
