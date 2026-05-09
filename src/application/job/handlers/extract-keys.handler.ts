import { ActionHandler } from "../../../application/ports/action-handler.port";

export class ExtractKeysHandler implements ActionHandler {
  readonly type = "extract-payload-keys" as const;
  async execute(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const topLevelKeys = Object.keys(payload).sort();

    return {
      action: this.type,
      topLevelKeys,
      topLevelCount: topLevelKeys.length,
      extractedAt: new Date().toISOString(),
    };
  }
}
