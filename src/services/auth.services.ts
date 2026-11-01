import axios from "axios";
import { baseUrl } from "../constants";

export function loginUser(values: object) {
  return axios.post(`${baseUrl}/users/signin`, values);
}

export function registerUser(values: object) {
  return axios.post(`${baseUrl}/users/signup`, values);
}
