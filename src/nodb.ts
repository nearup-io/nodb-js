import {
  BaseAPIProps,
  Body,
  BodyWithId,
  Entity,
  EntityId,
  EntityResponse,
  Inquiry,
  NodbConstructor,
  PatchRequestBody,
  PostRequestBody,
} from "./types";
import { NodbError } from "./errors";
import axios, { Axios } from "axios";

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
    this.axios = axios.create({
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

  async writeEntities(
    props: BaseAPIProps & PostRequestBody,
  ): Promise<string[]> {
    const { payload, ...urlProps } = props;
    const response = await this.axios.post<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
    );
    return response.data.ids;
  }

  async writeEntity(props: BaseAPIProps & { payload: Body }): Promise<string> {
    const { payload, ...urlProps } = props;
    const [id] = await this.writeEntities({ ...urlProps, payload: [payload] });
    return id!;
  }

  async updateEntities(
    props: BaseAPIProps & PatchRequestBody,
  ): Promise<string[]> {
    const { payload, ...urlProps } = props;
    const response = await this.axios.patch<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
    );
    return response.data.ids;
  }

  async updateEntity(
    props: BaseAPIProps & { payload: BodyWithId },
  ): Promise<string> {
    const { payload, ...urlProps } = props;
    const [id] = await this.updateEntities({
      ...urlProps,
      payload: [payload],
    });
    return id!;
  }

  async replaceEntities(
    props: BaseAPIProps & PatchRequestBody,
  ): Promise<string[]> {
    const { payload, ...urlProps } = props;
    const request = await this.axios.put<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
    );
    return request.data.ids;
  }

  async replaceEntity(
    props: BaseAPIProps & { payload: BodyWithId },
  ): Promise<string> {
    const { payload, ...urlProps } = props;
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

  async getInquiry(props: Inquiry): Promise<{ answer: string }> {
    const { inquiry } = props;
    const result = await this.axios.post<{ answer: string }>(
      `/knowledgebase/${this.app}/${this.env}`,
      {
        query: inquiry,
      },
    );

    return result.data;
  }
}

export default Nodb;
