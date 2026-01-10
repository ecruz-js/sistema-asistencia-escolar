import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import env from "./src/config/environment.js";
import * as cheerio from "cheerio";

const page = axios.get(`${env.sigerd.baseUrl}`);
page.then((response) => {
  const $ = cheerio.load(response.data);
  const token = $('input[name="__RequestVerificationToken"]').val();
  console.log("Token extraído:", token);
});

const jar = new CookieJar();
const client = wrapper(
  axios.create({
    baseURL: env.sigerd.baseUrl,
    jar,
    withCredentials: true,
  })
);