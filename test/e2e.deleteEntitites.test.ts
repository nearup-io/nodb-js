import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";
import { NodbError } from "../src/errors";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb delete entities/entity tests", () => {
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
      environmentName: envName,
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

  test("should delete entities", async () => {
    const result = await nodb.deleteEntities({ entityName, appName, envName });

    expect(result).toBe(2);

    const projectPhoenixId = ids[0]!;
    const projectPegasusId = ids[1]!;

    await expect(
      nodb.getEntity({
        entityName,
        appName,
        envName,
        entityId: projectPhoenixId,
      }),
    ).rejects.toThrow(NodbError);

    await expect(
      nodb.getEntity({
        entityName,
        appName,
        envName,
        entityId: projectPegasusId,
      }),
    ).rejects.toThrow(NodbError);
  });

  test("should delete entity", async () => {
    const deleted = await nodb.deleteEntity({
      entityName: entityName2,
      appName,
      envName,
      entityId: ids[2]!,
    });

    expect(deleted).toBe(true);
    await expect(
      nodb.getEntity({
        entityName,
        appName,
        envName,
        entityId: ids[2]!,
      }),
    ).rejects.toThrow(NodbError);
  });
});
