const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const tough = require("tough-cookie");
require("dotenv").config();

const TOKEN = process.env.SPTRANS_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const BASE_URL = "http://api.olhovivo.sptrans.com.br/v2.1";
const GOOGLE_GEOCODING_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_DISTANCE_MATRIX_URL =
  "https://maps.googleapis.com/maps/api/distancematrix/json";
const cookieJar = new tough.CookieJar();

const api = wrapper(
  axios.create({
    baseURL: BASE_URL,
    jar: cookieJar,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
);

module.exports = {
  api,
  TOKEN,
  GOOGLE_API_KEY,
  GOOGLE_GEOCODING_URL,
  GOOGLE_DISTANCE_MATRIX_URL,
};
