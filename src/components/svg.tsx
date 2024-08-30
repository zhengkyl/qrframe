type SvgProps ={
  size?: number
  class?: string
}
export function FilledDot(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
