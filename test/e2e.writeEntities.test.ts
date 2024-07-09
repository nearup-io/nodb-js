import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb write entities/entity tests ", () => {
  const appName = "test-app";
  const envName = "test-env";

  const nodb = new Nodb({
    baseUrl: process.env.NODB_BASE_URL!,
  });

  const entityName = "testProject";

  beforeAll(async () => {
    const result = await nodb.createAppWithEnvironmentAndGetTokens({
      appName,
      environmentName: envName,
    });

    nodb.setToken(result.applicationTokens[0]!.key);
  });

  afterAll(async () => {
    await nodb.deleteApplication({ appName });
  });

  test("should create entities", async () => {
    const result = await nodb.writeEntities({
      entityName,
      appName,
      envName,
      payload: [projectPhoenix, projectPegasus],
    });

    expect(result.length).toBe(2);

    const projectPhoenixId = result[0]!;
    const projectPegasusId = result[1]!;
    expect(typeof projectPhoenixId).toBe("string");
    expect(typeof projectPegasusId).toBe("string");

    // get what's in db so we could verify it
    const insertedProjectPhoenix = await nodb.getEntity({
      entityName,
      appName,
      envName,
      entityId: projectPhoenixId,
    });

    expect(insertedProjectPhoenix).toStrictEqual({
      ...projectPhoenix,
      id: projectPhoenixId,
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${projectPhoenixId}`,
      },
    });

    const insertedProjectPegasus = await nodb.getEntity({
      entityName,
      appName,
      envName,
      entityId: projectPegasusId,
    });

    expect(insertedProjectPegasus).toStrictEqual({
      ...projectPegasus,
      id: projectPegasusId,
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${projectPegasusId}`,
      },
    });
  });

  test("should create entity", async () => {
    const insertedProjectId = await nodb.writeEntity({
      entityName,
      appName,
      envName,
      payload: projectTitan,
    });

    expect(typeof insertedProjectId).toBe("string");

    const insertedProjectTitan = await nodb.getEntity({
      entityName,
      appName,
      envName,
      entityId: insertedProjectId,
    });

    expect(insertedProjectTitan).toStrictEqual({
      ...projectTitan,
      id: insertedProjectId,
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${insertedProjectId}`,
      },
    });
  });
});
