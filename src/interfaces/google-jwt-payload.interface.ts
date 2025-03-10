/**
 * Interface that represents the structure of a Google IAM JWT token
 */
interface GoogleJwtPayload {
  /** JWT issuer (identity provider) */
  iss: string;

  /** Authorized party - the client ID of the application making the authentication request */
  azp: string;

  /** Audience(s) that this ID token is intended for */
  aud: string;

  /** Subject identifier (unique Google user ID) */
  sub: string;

  /** Google Workspace domain (if applicable) */
  hd?: string;

  /** User's email address */
  email: string;

  /** Whether the email has been verified */
  email_verified: boolean;

  /** Not valid before time (Unix timestamp) */
  nbf: number;

  /** User's full name */
  name: string;

  /** URL of the user's profile picture */
  picture: string;

  /** User's given name (first name) */
  given_name: string;

  /** User's family name (last name) */
  family_name: string;

  /** Issued at time (Unix timestamp) */
  iat: number;

  /** Expiration time (Unix timestamp) */
  exp: number;

  /** JWT ID (unique identifier for this token) */
  jti: string;
}

export default GoogleJwtPayload;
