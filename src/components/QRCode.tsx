import {
  ECL,
  Mask,
  RenderOptions,
  SvgOptions,
  Version,
  get_svg,
  Mode,
} from "fuqr";

export default function QRCode(props: any) {
  const svg = () => {
    const svgOptions = new SvgOptions()
      .version(new Version(props.version))
      .ecl(props.ecl)
      .mask(new Mask(props.mask))
      .mode(props.mode);
    const renderOptions = new RenderOptions()
      .finder_pattern(props.finderPattern)
      .finder_roundness(props.finderRoundness)
      .margin(props.margin)
      .module_size(props.moduleSize)
      .foreground(props.foreground)
      .background(props.background);

    return get_svg(props.input, svgOptions, renderOptions);
  };

  return (
    <div innerHTML={svg()} class="w-full">
      <div>Version {props.version}</div>
    </div>
  );
}

// TODO remember to do this
// TEMPORARY FIX TO PREVENT CRASHING UNTIL I ADD SIZE ADJUSTMENT TO FUQR
// THIS DUPLICATES LOGIC FROM FUQR
const numECCodewords = {
  [ECL.Low]: [
    0, 7, 10, 15, 20, 26, 36, 40, 48, 60, 72, 80, 96, 104, 120, 132, 144, 168,
    180, 196, 224, 224, 252, 270, 300, 312, 336, 360, 390, 420, 450, 480, 510,
    540, 570, 570, 600, 630, 660, 720, 750,
  ],
  [ECL.Medium]: [
    0, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280,
    308, 338, 364, 416, 442, 476, 504, 560, 588, 644, 700, 728, 784, 812, 868,
    924, 980, 1036, 1064, 1120, 1204, 1260, 1316, 1372,
  ],
  [ECL.Quartile]: [
    0, 13, 22, 36, 52, 72, 96, 108, 132, 160, 192, 224, 260, 288, 320, 360, 408,
    448, 504, 546, 600, 644, 690, 750, 810, 870, 952, 1020, 1050, 1140, 1200,
    1290, 1350, 1440, 1530, 1590, 1680, 1770, 1860, 1950, 2040,
  ],
  [ECL.High]: [
    0, 17, 28, 44, 64, 88, 112, 130, 156, 192, 224, 264, 308, 352, 384, 432,
    480, 532, 588, 650, 700, 750, 816, 900, 960, 1050, 1110, 1200, 1260, 1350,
    1440, 1530, 1620, 1710, 1800, 1890, 1980, 2100, 2220, 2310, 2430,
  ],
};
const numDataModules = [
  0, 208, 359, 567, 807, 1079, 1383, 1568, 1936, 2336, 2768, 3232, 3728, 4256,
  4651, 5243, 5867, 6523, 7211, 7931, 8683, 9252, 10068, 10916, 11796, 12708,
  13652, 14628, 15371, 16411, 17483, 18587, 19723, 20891, 22091, 23008, 24272,
  25568, 26896, 28256, 29648,
];

export function min_version(
  input: string,
  mode: Mode,
  version: number,
  ecl: ECL
) {
  let bits = 4;
  if (mode === Mode.Numeric) {
    bits += 10 + (input.length / 3) * 10;
    if (input.length % 3 == 1) {
      bits += 4;
    } else if (input.length % 3 == 2) {
      bits += 7;
    }
  } else if (mode == Mode.Alphanumeric) {
    bits += 9 + (input.length / 2) * 11 + (input.length % 2) * 6;
  } else {
    bits += 8 + input.length * 8;
  }

  if (mode == Mode.Byte && version > 9) {
    bits += 8;
  } else if (version > 26) {
    bits += 4;
  } else if (version > 9) {
    bits += 2;
  }

  while (
    version <= 40 &&
    (bits + 7) / 8 > numDataModules[version] / 8 - numECCodewords[ecl][version]
  ) {
    if (mode == Mode.Byte && version == 9) {
      bits += 8;
    } else if (version == 26) {
      bits += 4;
    } else if (version == 9) {
      bits += 2;
    }
    version++;
  }

  return version;
}
