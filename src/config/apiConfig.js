//apiConfig.js
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import tough from "tough-cookie";
import dotenv from "dotenv";

dotenv.config();

export const TOKEN = process.env.SPTRANS_TOKEN;
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!TOKEN) {
  console.error("❌ SPTRANS_TOKEN não configurado.");
  process.exit(1);
}

if (!GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY não configurada.");
  process.exit(1);
}

console.log(`✅ GOOGLE_API_KEY carregada: ${GOOGLE_API_KEY.substring(0, 10)}...`);

// APIs base
export const BASE_URL = "http://api.olhovivo.sptrans.com.br/v2.1";
export const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";
export const GOOGLE_DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
export const GOOGLE_TRANSIT_URL = "https://maps.googleapis.com/maps/api/directions/json";

const cookieJar = new tough.CookieJar();

export const api = wrapper(
  axios.create({
    baseURL: BASE_URL,
    jar: cookieJar,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
  })
);
