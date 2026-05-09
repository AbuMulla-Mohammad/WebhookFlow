export type TokenPayload = {
  sub: string;
  role: string;
};

export interface TokenPort {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
