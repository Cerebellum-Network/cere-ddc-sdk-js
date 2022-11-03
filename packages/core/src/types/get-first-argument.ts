export type GetFirstArgument<Fn> = Fn extends (x: infer R, ...args: any[]) => any ? R : unknown;
