import {
  BaseAPIProps,
  Body,
  BodyWithId,
  Entity,
  EntityId,
  EntityResponse,
  NodbConstructor,
  PatchRequestBody,
  PostRequestBody,
} from "./types";
import { NodbError } from "./errors";
import { Axios } from "axios";

class Nodb {
  private readonly app: string;
  private readonly env: string;
  private readonly axios: Axios;

  constructor({ app, env, token, baseUrl }: NodbConstructor) {
    if (!app || !env || !token || !baseUrl) {
      throw new NodbError("Missing one of the required dependencies!");
    }
    this.app = app;
    this.env = env;
    this.axios = new Axios({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      baseURL: baseUrl,
    });
  }

  private generateUrl({
    entityName,
    entityId,
  }: BaseAPIProps & { entityId?: string }): string {
    const baseUrl = `/apps/${this.app}/${this.env}/${entityName}`;
    if (!entityId) return baseUrl;
    return `${baseUrl}/${entityId}`;
  }

  async writeEntities({
    payload,
    ...urlProps
  }: BaseAPIProps & PostRequestBody): Promise<string[]> {
    const request = await this.axios.post<string[]>(
      this.generateUrl(urlProps),
      {
        data: payload,
      },
    );
    return request.data;
  }

  async writeEntity({
    payload,
    ...urlProps
  }: BaseAPIProps & { payload: Body }): Promise<string> {
    const [id] = await this.writeEntities({ ...urlProps, payload: [payload] });
    return id!;
  }

  async updateEntities({
    payload,
    ...urlProps
  }: BaseAPIProps & PatchRequestBody): Promise<string[]> {
    const request = await this.axios.patch<string[]>(
      this.generateUrl(urlProps),
      {
        data: payload,
      },
    );
    return request.data;
  }

  async updateEntity({
    payload,
    ...urlProps
  }: BaseAPIProps & { payload: BodyWithId }): Promise<string> {
    const [id] = await this.updateEntities({
      ...urlProps,
      payload: [payload],
    });
    return id!;
  }

  async replaceEntities({
    payload,
    ...urlProps
  }: BaseAPIProps & PatchRequestBody): Promise<string[]> {
    const request = await this.axios.put<string[]>(this.generateUrl(urlProps), {
      data: payload,
    });
    return request.data;
  }

  async replaceEntity({
    payload,
    ...urlProps
  }: BaseAPIProps & { payload: BodyWithId }): Promise<string> {
    const [id] = await this.replaceEntities({
      ...urlProps,
      payload: [payload],
    });
    return id!;
  }

  async deleteEntities(urlProps: BaseAPIProps): Promise<number> {
    const result = await this.axios.delete<{ deleted: number }>(
      this.generateUrl(urlProps),
    );
    return result.data.deleted;
  }

  async deleteEntity(urlProps: BaseAPIProps & EntityId): Promise<boolean> {
    const result = await this.axios.delete<{ deleted: boolean }>(
      this.generateUrl(urlProps),
    );
    return result.data.deleted;
  }

  async getEntity(urlProps: BaseAPIProps & EntityId): Promise<Entity> {
    const request = await this.axios.get<Entity>(this.generateUrl(urlProps));
    return request.data;
  }

  async getEntities(urlProps: BaseAPIProps): Promise<EntityResponse> {
    const request = await this.axios.get<EntityResponse>(
      this.generateUrl(urlProps),
    );
    return request.data;
  }
}

export default Nodb;
