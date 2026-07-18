export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export type AuthVariables = {
  user: AuthenticatedUser;
};
