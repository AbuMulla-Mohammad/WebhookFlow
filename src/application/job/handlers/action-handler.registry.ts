import { ActionHandler } from "../../../application/ports/action-handler.port.js";
import { ActionType } from "../../../domain/types/action-type.js";

export class ActionHandlerRegistry {
  private readonly handlers = new Map<ActionType, ActionHandler>();
  constructor(handlers: ActionHandler[]) {
    handlers.forEach((h) => this.handlers.set(h.type, h));
  }

  get(type: ActionType): ActionHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`Unsupported action type: ${type}`);
    }
    return handler;
  }
}
