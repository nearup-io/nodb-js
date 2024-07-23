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
  PostApplicationBody,
  PostApplicationResponse,
  PostApplicationTokenResponse,
  PostEntityRequestBody,
  PostEnvironmentBody,
  PostEnvironmentResponse,
  PostEnvironmentTokenResponse,
  TokenPermissions,
} from "./types";
import { NodbError } from "./errors";
import axios, { Axios, AxiosError } from "axios";
import NodbWebSocket from "./nodb-web-socket";

class Nodb extends NodbWebSocket {
  private readonly baseUrl: string;
  private readonly axios: Axios;
  private token?: string;
  constructor({ token, baseUrl }: NodbConstructor) {
    super();
    if (!baseUrl) {
      throw new NodbError("Missing one of the required dependencies!");
    }
    this.baseUrl = baseUrl;
    this.token = token;
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
          throw new NodbError(JSON.stringify(error.response.data, null, 2));
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
    this.token = token;
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
    const response = await this.axios.put<{ ids: string[] }>(
      this.generateUrl(urlProps),
      payload,
      {
        ...(token && { headers: { token } }),
      },
    );
    return response.data.ids;
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

  async inquire(
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

  async createAppWithEnvironmentAndGetTokens(
    props: PostApplicationBody,
  ): Promise<PostApplicationResponse> {
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

  async createEnvironmentInApp(
    props: PostEnvironmentBody,
  ): Promise<PostEnvironmentResponse> {
    const { appName, description, environmentName, token } = props;

    const result = await this.axios.post<PostEnvironmentResponse>(
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

  async createApplicationToken(props: {
    appName: string;
    permission: TokenPermissions;
    token?: string;
  }): Promise<PostApplicationTokenResponse> {
    const { appName, permission, token } = props;
    const result = await this.axios.post<PostApplicationTokenResponse>(
      `/tokens/${appName}`,
      {
        permission,
      },
      { ...(token && { headers: { token } }) },
    );
    return result.data;
  }

  async createEnvironmentToken(props: {
    appName: string;
    envName: string;
    permission: TokenPermissions;
    token?: string;
  }): Promise<PostEnvironmentTokenResponse> {
    const { appName, envName, permission, token } = props;
    const result = await this.axios.post<PostEnvironmentTokenResponse>(
      `/tokens/${appName}/${envName}`,
      {
        permission,
      },
      { ...(token && { headers: { token } }) },
    );
    return result.data;
  }

  async revokeApplicationToken(props: {
    appName: string;
    tokenToBeRevoked: string;
    token?: string;
  }): Promise<boolean> {
    const { appName, tokenToBeRevoked, token } = props;
    const result = await this.axios.delete<{ success: boolean }>(
      `/tokens/${appName}/${tokenToBeRevoked}`,
      { ...(token && { headers: { token } }) },
    );
    return result.data.success;
  }

  async revokeEnvironmentToken(props: {
    appName: string;
    envName: string;
    tokenToBeRevoked: string;
    token?: string;
  }): Promise<boolean> {
    const { appName, envName, tokenToBeRevoked, token } = props;
    const result = await this.axios.delete<{ success: boolean }>(
      `/tokens/${appName}/${envName}/${tokenToBeRevoked}`,
      { ...(token && { headers: { token } }) },
    );
    return result.data.success;
  }

  connectToSocket(props: {
    appName: string;
    envName?: string;
    token?: string;
  }): void {
    this.connect({
      appName: props.appName,
      envName: props.envName,
      baseUrl: this.baseUrl,
      token: props.token || this.token || "",
    });
  }
}

export default Nodb;
