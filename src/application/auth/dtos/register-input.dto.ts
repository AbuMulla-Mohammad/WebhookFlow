import { UserRole } from "../../../domain/types/user-roles.js";

export type RegisterInputDto = {
  email: string;
  password: string;
  role?: UserRole;
};
