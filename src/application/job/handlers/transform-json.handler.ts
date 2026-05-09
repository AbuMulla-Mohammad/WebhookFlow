import { ActionHandler } from "../../../application/ports/action-handler.port";

export class TransformJsonHandler implements ActionHandler {
  readonly type = "transform-json" as const;
  async execute(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const prefix = "x_";
    const transformed = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [prefix + k, v]),
    );
    return {
      action: this.type,
      transformed,
      transformedAt: new Date().toISOString(),
    };
  }
}
