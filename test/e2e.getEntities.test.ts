import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb get entities/entity tests", () => {
  const app = process.env.NODB_APP!;
  const env = process.env.NODB_ENV!;

  const nodb = new Nodb({
    app,
    env,
    baseUrl: process.env.NODB_BASE_URL!,
    token: process.env.NODB_JWT_TOKEN!,
  });

  const entityName = "testProject";
  const entityName2 = "testProject2";
  let ids: string[] = [];

  beforeAll(async () => {
    ids = await nodb.writeEntities({
      entityName,
      payload: [projectPhoenix, projectPegasus],
    });
    const lastId = await nodb.writeEntity({
      entityName: entityName2,
      payload: projectTitan,
    });
    ids.push(lastId);
  });

  afterAll(async () => {
    await nodb.deleteEntities({ entityName });
    await nodb.deleteEntities({ entityName: entityName2 });
  });

  test("should get entities", async () => {
    const result = await nodb.getEntities({
      entityName,
    });

    expect(Object.keys(result).sort()).toEqual([entityName, "__meta"].sort());
    expect(result["__meta"]).toStrictEqual({
      current_page: `/${app}/${env}/${entityName}?__page=1&__per_page=10`,
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
        self: `/${app}/${env}/${entityName}/${ids[0]}`,
      },
      id: ids[0],
    });

    expect(second).toStrictEqual({
      ...projectPegasus,
      __meta: {
        self: `/${app}/${env}/${entityName}/${ids[1]}`,
      },
      id: ids[1],
    });
  });

  test("should get entity", async () => {
    const entity = await nodb.getEntity({
      entityName: entityName2,
      entityId: ids[2]!,
    });

    expect(entity).toStrictEqual({
      ...projectTitan,
      id: ids[2]!,
      __meta: {
        self: `/${app}/${env}/${entityName2}/${ids[2]}`,
      },
    });
  });
});
