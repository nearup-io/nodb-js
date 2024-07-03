import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb write entities/entity tests ", () => {
  const app = process.env.NODB_APP!;
  const env = process.env.NODB_ENV!;

  const nodb = new Nodb({
    app,
    env,
    baseUrl: process.env.NODB_BASE_URL!,
    token: process.env.NODB_JWT_TOKEN!,
  });

  const entityName = "testProject";

  afterAll(async () => {
    await nodb.deleteEntities({ entityName });
  });

  test("should create entities", async () => {
    const result = await nodb.writeEntities({
      entityName,
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
      entityId: projectPhoenixId,
    });

    expect(insertedProjectPhoenix).toStrictEqual({
      ...projectPhoenix,
      id: projectPhoenixId,
      __meta: {
        self: `/${app}/${env}/${entityName}/${projectPhoenixId}`,
      },
    });

    const insertedProjectPegasus = await nodb.getEntity({
      entityName,
      entityId: projectPegasusId,
    });

    expect(insertedProjectPegasus).toStrictEqual({
      ...projectPegasus,
      id: projectPegasusId,
      __meta: {
        self: `/${app}/${env}/${entityName}/${projectPegasusId}`,
      },
    });
  });

  test("should create entity", async () => {
    const insertedProjectId = await nodb.writeEntity({
      entityName,
      payload: projectTitan,
    });

    expect(typeof insertedProjectId).toBe("string");

    const insertedProjectTitan = await nodb.getEntity({
      entityName,
      entityId: insertedProjectId,
    });

    expect(insertedProjectTitan).toStrictEqual({
      ...projectTitan,
      id: insertedProjectId,
      __meta: {
        self: `/${app}/${env}/${entityName}/${insertedProjectId}`,
      },
    });
  });
});
