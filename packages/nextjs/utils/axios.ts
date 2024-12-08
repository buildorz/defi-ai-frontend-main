import { ENVIRONMENTS } from "./../config/environment";
import axios, { AxiosInstance } from "axios";

export const axiosBaseInstance = (token?: string): AxiosInstance =>
  axios.create({
    baseURL: `${ENVIRONMENTS.APP.BASEURL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
