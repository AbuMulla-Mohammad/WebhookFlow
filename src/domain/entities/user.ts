import { UserRole } from "../types/user-roles.js";
import { BaseEntity } from "./base-entity.js";

export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  role: UserRole;
}
