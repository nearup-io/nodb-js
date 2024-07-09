import {
  BaseAPIProps,
  Entity,
  EntityBody,
  EntityBodyWithId,
  EntityId,
  EntityResponse,
  Inquiry,
  NodbConstructor,
  PatchRequestBody,
  PostApplicationResponse,
  PostEntityRequestBody,
} from "./types";
import { NodbError } from "./errors";
import axios, { Axios, AxiosError } from "axios";

class Nodb {
  private readonly baseUrl: string;
  private readonly axios: Axios;

  constructor({ token, baseUrl }: NodbConstructor) {
    if (!baseUrl) {
      throw new NodbError("Missing one of the required dependencies!");
    }
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      headers: {
        "Content-Type": "application/json",
        ...(token && { token }),
      },
      baseURL: this.baseUrl,
    });

    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response && error.response.status >= 400) {
          throw new NodbError(error.response.data as string);
        }
        return Promise.reject(error);
      },
    );
  }

  private generateUrl({
    appName,
    envName,
    entityName,
    entityId,
  }: BaseAPIProps & { entityId?: string }): string {
    const baseUrl = `/apps/${appName}/${envName}/${entityName}`;
    if (!entityId) return baseUrl;
    return `${baseUrl}/${entityId}`;
  }

  public setToken(token: string): void {
    this.axios.defaults.headers.common.token = token;
  }

  async writeEntities(
    props: BaseAPIProps & PostEntityRequestBody,
  ): Promise<string[]> {
    const { payload, token, ...urlProps } = props;
    const response = await this.axios.post<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
      {
        ...(token && { headers: { token } }),
      },
    );
    return response.data.ids;
  }

  async writeEntity(
    props: BaseAPIProps & { payload: EntityBody },
  ): Promise<string> {
    const { payload, ...rest } = props;
    const [id] = await this.writeEntities({
      ...rest,
      payload: [payload],
    });
    return id!;
  }

  async updateEntities(
    props: BaseAPIProps & PatchRequestBody,
  ): Promise<string[]> {
    const { payload, token, ...urlProps } = props;
    const response = await this.axios.patch<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
      {
        ...(token && { headers: { token } }),
      },
    );
    return response.data.ids;
  }

  async updateEntity(
    props: BaseAPIProps & { payload: EntityBodyWithId },
  ): Promise<string> {
    const { payload, ...rest } = props;
    const [id] = await this.updateEntities({
      ...rest,
      payload: [payload],
    });
    return id!;
  }

  async replaceEntities(
    props: BaseAPIProps & PatchRequestBody,
  ): Promise<string[]> {
    const { payload, token, ...urlProps } = props;
    const request = await this.axios.put<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
      {
        ...(token && { headers: { token } }),
      },
    );
    return request.data.ids;
  }

  async replaceEntity(
    props: BaseAPIProps & { payload: EntityBodyWithId },
  ): Promise<string> {
    const { payload, ...rest } = props;
    const [id] = await this.replaceEntities({
      ...rest,
      payload: [payload],
    });
    return id!;
  }

  async deleteEntities(props: BaseAPIProps): Promise<number> {
    const { token, ...urlProps } = props;
    const result = await this.axios.delete<{ deleted: number }>(
      this.generateUrl(urlProps),
      {
        ...(token && { headers: { token } }),
      },
    );
    return result.data.deleted;
  }

  async deleteEntity(props: BaseAPIProps & EntityId): Promise<boolean> {
    const { token, ...urlProps } = props;
    const result = await this.axios.delete<{ deleted: boolean }>(
      this.generateUrl(urlProps),
      {
        ...(token && { headers: { token } }),
      },
    );
    return result.data.deleted;
  }

  async getEntity(props: BaseAPIProps & EntityId): Promise<Entity> {
    const { token, ...urlProps } = props;
    const request = await this.axios.get<Entity>(this.generateUrl(urlProps), {
      ...(token && { headers: { token } }),
    });
    return request.data;
  }

  async getEntities(props: BaseAPIProps): Promise<EntityResponse> {
    const { token, ...urlProps } = props;
    const request = await this.axios.get<EntityResponse>(
      this.generateUrl(urlProps),
      { ...(token && { headers: { token } }) },
    );
    return request.data;
  }

  async getInquiry(
    props: Inquiry & Pick<BaseAPIProps, "appName" | "envName" | "token">,
  ): Promise<{ answer: string }> {
    const { inquiry, appName, envName, token } = props;
    const result = await this.axios.post<{ answer: string }>(
      `/knowledgebase/${appName}/${envName}`,
      {
        query: inquiry,
      },
      { ...(token && { headers: { token } }) },
    );

    return result.data;
  }

  async createAppWithEnvironmentAndGetTokens(props: {
    appName: string;
    appDescription?: string;
    appImage?: string;
    environmentName?: string;
    environmentDescription?: string;
  }): Promise<PostApplicationResponse> {
    const {
      appName,
      appImage,
      appDescription,
      environmentDescription,
      environmentName,
    } = props;

    const result = await this.axios.post<PostApplicationResponse>(
      `/apps/${appName}`,
      {
        image: appImage,
        description: appDescription,
        environmentName,
        environmentDescription,
      },
    );

    return result.data;
  }

  async createEnvironmentInApp(props: {
    appName: string;
    environmentName: string;
    description?: string;
    token?: string;
  }): Promise<PostApplicationResponse> {
    const { appName, description, environmentName, token } = props;

    const result = await this.axios.post<PostApplicationResponse>(
      `/apps/${appName}/${environmentName}`,
      {
        description,
      },
      { ...(token && { headers: { token } }) },
    );

    return result.data;
  }

  async deleteEnvironmentFromApp(props: {
    appName: string;
    environmentName: string;
    token?: string;
  }): Promise<boolean> {
    const { appName, environmentName, token } = props;
    const result = await this.axios.delete<{ found: boolean }>(
      `/apps/${appName}/${environmentName}`,
      { ...(token && { headers: { token } }) },
    );

    return result.data.found;
  }

  async deleteApplication(props: {
    appName: string;
    token?: string;
  }): Promise<boolean> {
    const { appName, token } = props;
    const result = await this.axios.delete<{ found: boolean }>(
      `/apps/${appName}`,
      { ...(token && { headers: { token } }) },
    );

    return result.data.found;
  }
}

export default Nodb;
