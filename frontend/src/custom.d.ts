// custom.d.ts or types.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    input: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    > & {
      webkitdirectory?: string | boolean;
      directory?: string;
    };
  }
}
