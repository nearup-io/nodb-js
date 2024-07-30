import Nodb from "../src/nodb";
import { projectPegasus, projectPhoenix, projectTitan } from "./seed";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

describe("Nodb update entities/entity tests", () => {
  const appName = "test-app";
  const envName = "test-env";

  const nodb = new Nodb({
    baseUrl: process.env.NODB_BASE_URL!,
  });

  const entityName = "testProject";
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
      entityName,
      appName,
      envName,
      payload: projectTitan,
    });
    ids.push(lastId);
  });

  afterAll(async () => {
    await nodb.deleteApplication({ appName });
  });

  test("should update entities", async () => {
    const result = await nodb.updateEntities({
      entityName,
      appName,
      envName,
      payload: [
        { title: "Project Phoenix V2", id: ids[0]! },
        { title: "Project Pegasus V2", id: ids[1]! },
      ],
    });

    expect(result.length).toBe(2);
    expect(result[0]).toBe(ids[0]);
    expect(result[1]).toBe(ids[1]);

    const projectPhoenixId = result[0]!;
    const projectPegasusId = result[1]!;

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
      title: "Project Phoenix V2",
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
      title: "Project Pegasus V2",
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${projectPegasusId}`,
      },
    });
  });

  test("should update entity", async () => {
    const insertedProjectId = await nodb.updateEntity({
      entityName,
      appName,
      envName,
      payload: { title: "Project Titan V2", id: ids[2]! },
    });

    expect(insertedProjectId).toBe(ids[2]);
    const insertedProjectTitan = await nodb.getEntity({
      entityName,
      appName,
      envName,
      entityId: insertedProjectId,
    });

    expect(insertedProjectTitan).toStrictEqual({
      ...projectTitan,
      id: insertedProjectId,
      title: "Project Titan V2",
      __meta: {
        self: `/${appName}/${envName}/${entityName}/${insertedProjectId}`,
      },
    });
  });
});
