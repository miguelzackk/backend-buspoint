//apiConfig.js
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import tough from "tough-cookie";
import dotenv from "dotenv";

dotenv.config();

// ✅ Tokens e chaves de API
export const TOKEN = process.env.SPTRANS_TOKEN;
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// ✅ Fail-fast se variáveis não configuradas
if (!TOKEN) {
  console.error("❌ SPTRANS_TOKEN não configurado. Configure no .env ou painel de env do Render.");
  process.exit(1);
}

if (!GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY não configurada. Configure no .env ou painel de env do Render.");
  process.exit(1);
}

console.log("✅ SPTRANS_TOKEN e GOOGLE_API_KEY carregadas com sucesso.");

// ✅ URLs base das APIs
export const BASE_URL = "http://api.olhovivo.sptrans.com.br/v2.1";
export const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";
export const GOOGLE_DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
export const GOOGLE_TRANSIT_URL = "https://maps.googleapis.com/maps/api/directions/json";

// ✅ Configuração de cookies para SPTrans
const cookieJar = new tough.CookieJar();

// ✅ Instância da API SPTrans com suporte a cookies
export const api = wrapper(
  axios.create({
    baseURL: BASE_URL,
    jar: cookieJar,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
  })
);

