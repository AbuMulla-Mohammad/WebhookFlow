import { Subscriber } from "../entities/subscriber";

export interface SubscriberRepository {
  getById(id: string): Promise<Subscriber | null>;
  getByPipelineId(pipelineId: string): Promise<Subscriber[]>;
  save(subscriber: Subscriber): Promise<void>;
  delete(id: string): Promise<void>;
  update(subscriber: Subscriber): Promise<void>;
}
