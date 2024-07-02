export type NodbConstructor = {
  app: string;
  env: string;
  token: string;
  baseUrl: string;
};

export type BaseAPIProps = {
  entityName: string;
};

export type Body = Record<string, unknown>;

export type PostRequestBody = { payload: Body[] };

export type BodyWithId = Record<string, unknown> & { id: string };

export type PatchRequestBody = {
  payload: BodyWithId[];
};

export type EntityId = {
  entityId: string;
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
