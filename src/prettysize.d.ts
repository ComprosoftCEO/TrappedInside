// TypeScript declarations for the 'prettysize' library
declare module 'prettysize' {
  function pretty(
    bytes: number,
    removeSpace?: boolean,
    singleCharacter?: boolean,
    decimalPlaces?: number | false,
    numOnly?: boolean,
  ): string;

  function pretty(bytes: number, args: PrettyArgs): string;

  export interface PrettyArgs {
    one?: boolean;
    places?: number;
    numOnly?: boolean;
  }

  export default pretty;
}
