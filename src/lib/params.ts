import { clientOnly } from "@solidjs/start";
import { FileInput } from "~/components/ImageInput";
import { NumberInput } from "~/components/NumberInput";
import { Select } from "~/components/Select";
import { Switch } from "~/components/Switch";

const ColorInput = clientOnly(() => import("~/components/ColorInput"));

const PARAM_TYPES = ["boolean", "number", "color", "select", "file", "array"];

export const PARAM_COMPONENTS = {
  boolean: Switch,
  number: NumberInput,
  color: ColorInput,
  select: Select,
  file: FileInput,
};

export const PARAM_DEFAULTS = {
  boolean: false,
  number: 0,
  color: "#000000",
  // select: //default is first option
  file: null,
  array: [],
};

type PARAM_VALUE_TYPES = {
  boolean: boolean;
  number: number;
  color: string;
  select: any;
  file: File | null;
  array: any[];
};

export type Params = {
  [key: string]: PARAM_VALUE_TYPES[keyof PARAM_VALUE_TYPES];
};

export type ParamsSchema = {
  [label: string]: Required<RawParamsSchema>;
};

export type RawParamsSchema = {
  type: keyof PARAM_VALUE_TYPES;
  default?: any;
  [key: string]: any;
};

export function deepEqualObj(a: any, b: any) {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (!b.hasOwnProperty(key)) return false;
    if (
      typeof a[key] === "object" &&
      a[key] != null &&
      typeof b[key] === "object" &&
      b[key] != null
    ) {
      if (!deepEqualObj(a[key], b[key])) return false;
    } else if (a[key] !== b[key]) {
      return false;
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
      // TODO so user set default could be wrong type
      const parsedField = parseField(value);
      if (parsedField == null) continue;
      parsedParamsSchema[key] = parsedField;
    }
  }
  return parsedParamsSchema;
}

function parseField(value: any) {
  if (
    value == null ||
    typeof value !== "object" ||
    !("type" in value) ||
    typeof value.type !== "string" ||
    !PARAM_TYPES.includes(value.type)
  ) {
    return null;
  } else if (value.type === "select") {
    if (
      !("options" in value) ||
      !Array.isArray(value.options) ||
      value.options.length === 0
    ) {
      return null;
    }
  } else if (value.type === "array") {
    if (!("props" in value)) {
      return null;
    }
    const innerProps = parseField(value.props);
    if (innerProps == null || innerProps.default === undefined) {
      return null;
    }
    value.props = innerProps;
  }

  // === undefined b/c null is a valid default value for ImageInput
  if (value.default === undefined) {
    if (value.type === "select") {
      value.default = value.options[0];
    } else if (value.type === "array") {
      value.default = Array.from(
        { length: value.defaultLength ?? 1 },
        () => value.props.default
      );
    } else {
      value.default = PARAM_DEFAULTS[value.type];
    }
  }

  return value;
}

export function defaultParams(paramsSchema: ParamsSchema) {
  const defaultParams: Params = {};
  Object.entries(paramsSchema).forEach(([label, props]) => {
    defaultParams[label] = props.default;
  });
  return defaultParams;
}
