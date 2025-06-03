//googleService.js
import axios from "axios";
import {
  GOOGLE_API_KEY,
  GOOGLE_GEOCODING_URL,
  GOOGLE_DISTANCE_MATRIX_URL,
  GOOGLE_TRANSIT_URL
} from '../config/apiConfig.js';

function checkApiKey() {
  if (!GOOGLE_API_KEY) {
    throw new Error("❌ GOOGLE_API_KEY está undefined no googleService.js");
  }
}

// Reutilizado nas funções
function logKey(funcName) {
  console.log(`🔑 [${funcName}] Usando GOOGLE_API_KEY: ${GOOGLE_API_KEY.substring(0, 10)}...`);
}

export async function buscarCoordenadasEndereco(endereco) {
  checkApiKey();
  logKey('buscarCoordenadasEndereco');
  const enderecoFormatado = `${endereco}, São Paulo, SP`;

  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { address: enderecoFormatado, key: GOOGLE_API_KEY, region: "br" }
    });
    console.log("🔎 Geocode raw response:", response.data);
    const { status, results, error_message } = response.data;

    if (status === "OK" && results.length > 0) return results[0].geometry.location;
    console.error(`❌ Geocode erro: ${status}, ${error_message}`);
    return null;
  } catch (error) {
    console.error("❌ Erro buscarCoordenadasEndereco:", error.response?.data || error.message);
    return null;
  }
}

export async function buscarCoordenadasParadaMaisProxima(parada) {
  checkApiKey();
  logKey('buscarCoordenadasParadaMaisProxima');
  const enderecoFormatado = `${parada}, São Paulo, SP`;

  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { address: enderecoFormatado, key: GOOGLE_API_KEY, region: "br" }
    });
    console.log("🔎 Geocode parada response:", response.data);
    const { status, results, error_message } = response.data;

    if (status === "OK" && results.length > 0) return results[0].geometry.location;
    console.error(`❌ Geocode parada erro: ${status}, ${error_message}`);
    return null;
  } catch (error) {
    console.error("❌ Erro buscarCoordenadasParadaMaisProxima:", error.response?.data || error.message);
    return null;
  }
}

export async function calcularTempoComGoogle(origemLat, origemLng, destinoLat, destinoLng) {
  checkApiKey();
  logKey('calcularTempoComGoogle');

  try {
    const response = await axios.get(GOOGLE_DISTANCE_MATRIX_URL, {
      params: {
        origins: `${origemLat},${origemLng}`,
        destinations: `${destinoLat},${destinoLng}`,
        key: GOOGLE_API_KEY,
        mode: "transit",
        transit_mode: "bus"
      }
    });
    console.log("🕒 Distance Matrix response:", response.data);
    return Math.ceil(response.data.rows[0]?.elements[0]?.duration?.value / 60) || null;
  } catch (error) {
    console.error("❌ Erro calcularTempoComGoogle:", error.response?.data || error.message);
    return null;
  }
}

export async function converterCoordenadasParaEndereco(lat, lng) {
  checkApiKey();
  logKey('converterCoordenadasParaEndereco');

  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { latlng: `${lat},${lng}`, key: GOOGLE_API_KEY }
    });
    if (response.data.results.length > 0) return response.data.results[0].formatted_address;
    console.warn("⚠️ Endereço não encontrado para:", lat, lng);
    return "Endereço não encontrado";
  } catch (error) {
    console.error("❌ Erro converterCoordenadasParaEndereco:", error.response?.data || error.message);
    return "Erro ao obter endereço";
  }
}

export async function consultarRotaOnibus(origem, destino) {
  checkApiKey();
  logKey('consultarRotaOnibus');

  try {
    const response = await axios.post(GOOGLE_TRANSIT_URL, {
      origin: { address: origem },
      destination: { address: destino },
      travelMode: "TRANSIT",
      transitPreferences: { allowedTravelModes: ["BUS"] },
      computeAlternativeRoutes: true,
      key: GOOGLE_API_KEY
    });
    console.log("🚌 Rota encontrada:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro consultarRotaOnibus:", error.response?.data || error.message);
    return null;
  }
}
