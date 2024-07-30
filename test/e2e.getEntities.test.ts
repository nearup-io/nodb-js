import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb get entities/entity tests", () => {
  const appName = "test-app";
  const envName = "test-env";

  const nodb = new Nodb({
    baseUrl: process.env.NODB_BASE_URL!,
  });

  const entityName = "testProject";
  const entityName2 = "testProject2";
  let ids: string[] = [];

  beforeAll(async () => {
    const result = await nodb.createApplication({
      appName,
      envName,
    });

    nodb.setToken(result.applicationTokens[0]!.key);

    ids = await nodb.writeEntities({
      entityName,
      appName,
      envName,
      payload: [projectPhoenix, projectPegasus],
    });
    const lastId = await nodb.writeEntity({
      entityName: entityName2,
      appName,
      envName,
      payload: projectTitan,
    });
    ids.push(lastId);
  });

  afterAll(async () => {
    await nodb.deleteApplication({ appName });
  });

  test("should get entities", async () => {
    const result = await nodb.getEntities({
      entityName,
      appName,
      envName,
    });

    expect(Object.keys(result).sort()).toEqual([entityName, "__meta"].sort());
    expect(result["__meta"]).toStrictEqual({
      current_page: `/${appName}/${envName}/${entityName}?__page=1&__per_page=10`,
      items: 2,
      page: 1,
      pages: 1,
      totalCount: 2,
    });

    expect(result[entityName]?.length).toBe(2);
    const [first, second] = result[entityName] as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];

    expect(first).toStrictEqual({
      ...projectPhoenix,
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${ids[0]}`,
      },
      id: ids[0],
    });

    expect(second).toStrictEqual({
      ...projectPegasus,
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${ids[1]}`,
      },
      id: ids[1],
    });
  });

  test("should get entity", async () => {
    const entity = await nodb.getEntity({
      entityName: entityName2,
      appName,
      envName,
      entityId: ids[2]!,
    });

    expect(entity).toStrictEqual({
      ...projectTitan,
      id: ids[2]!,
      __meta: {
        self: `/${appName}/${envName}/${entityName2}/${ids[2]}`,
      },
    });
  });
});
