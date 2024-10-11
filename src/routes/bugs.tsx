import AtSign from "lucide-solid/icons/at-sign";

export default function Bugs() {
  return (
    <main class="max-w-screen-sm mx-auto">
      <div class="px-4 py-8 flex flex-col gap-4">
        <p>
          If you have Github account, feel free to file a{" "}
          <a
            class="text-rose-500 font-semibold hover:text-rose-400 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
            href="https://github.com/zhengkyl/qrframe/issues"
            target="_blank"
          >
            Github issue
          </a>
          .
        </p>
        <p>
          Otherwise, you can just email me at hi
          <AtSign class="inline h-4 w-4" />
          kylezhe.ng
        </p>
      </div>
    </main>
  );
}
