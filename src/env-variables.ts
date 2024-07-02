const requiredEnvVariables = ["JWT_TOKEN"];

const verifyEnvVariables = (): void => {
  requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
      throw new Error(`Missing required env variable ${envVariable}`);
    }
  });
};

export default verifyEnvVariables;
