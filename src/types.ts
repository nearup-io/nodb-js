export type NodbConstructor = {
  token?: string;
  baseUrl: string;
};

export type BaseAPIProps = {
  appName: string;
  envName: string;
  entityName: string;
  token?: string;
};

export type EntityBody = Record<string, unknown>;

export type PostEntityRequestBody = { payload: EntityBody[] };

export type EntityBodyWithId = Record<string, unknown> & { id: string };

export type PatchRequestBody = {
  payload: EntityBodyWithId[];
};

export type EntityId = {
  entityId: string;
};
export type Inquiry = {
  inquiry: string;
};

export type Entity = Record<string, unknown>;

export type EntitiesMeta = {
  totalCount: number;
  items: number;
  pages: number;
  page: number;
  next?: number;
  previous?: number;
  current_page: string;
  previous_page?: string;
  next_page?: string;
  first_page?: string;
  last_page?: string;
};

export type EntityResponse = {
  [entityName: string]: Entity[];
} & { __meta: EntitiesMeta };

export type Token = {
  key: string;
  permission: "ALL" | "READ_ONLY";
};

export type PostApplicationResponse = {
  applicationName: string;
  environmentName: string;
  applicationTokens: Token[];
  environmentTokens: Token[];
};

export type PostApplicationBody = {
  appName: string;
  appDescription?: string;
  appImage?: string;
  environmentName?: string;
  environmentDescription?: string;
};

export type PostEnvironmentResponse = {
  id: string;
  name: string;
  tokens: Token[];
  description?: string;
  entities: string[];
};

export type PostEnvironmentBody = {
  appName: string;
  environmentName: string;
  description?: string;
  token?: string;
};

export type TokenPermissions = "ALL" | "READ_ONLY";

export type PostApplicationTokenResponse = {
  appName: string;
  permission: TokenPermissions;
  token: string;
};

export type PostEnvironmentTokenResponse = PostApplicationTokenResponse & {
  envName: string;
};
