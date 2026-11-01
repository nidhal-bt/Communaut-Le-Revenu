/** Shape of the Strapi users-permissions user returned by POST /api/auth/local. */
export type User = {
  id: number;
  documentId: string;
  username: string;
  email: string;
};
