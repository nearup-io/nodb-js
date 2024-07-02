import { Axios } from "axios";

let axios: Axios;

const createNewAxiosInstance = (): Axios => {
  axios = new Axios({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JWT_TOKEN}`,
    },
  });

  return axios;
};

const getAxiosInstance = (): Axios => {
  if (axios) return axios;

  return createNewAxiosInstance();
};

// TODO create interceptors for error handling

export default getAxiosInstance;
