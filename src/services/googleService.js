//googleService.js
import axios from "axios";
import { GOOGLE_API_KEY } from '../config/apiConfig.js';

function checkApiKey() {
  if (!GOOGLE_API_KEY) throw new Error("❌ GOOGLE_API_KEY não configurada.");
}

export async function buscarCoordenadasEndereco(endereco) {
  checkApiKey();
  const enderecoFormatado = `${endereco}, São Paulo, SP`;
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { address: enderecoFormatado, key: GOOGLE_API_KEY, region: "br" }
    });
    if (response.data.status === "OK") return response.data.results[0].geometry.location;
    return null;
  } catch (error) {
    console.error("❌ Erro buscarCoordenadasEndereco:", error.response?.data || error.message);
    return null;
  }
}

export async function converterCoordenadasParaEndereco(lat, lng) {
  checkApiKey();
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { latlng: `${lat},${lng}`, key: GOOGLE_API_KEY }
    });
    return response.data.results.length > 0 ? response.data.results[0].formatted_address : "Endereço não encontrado";
  } catch (error) {
    console.error("❌ Erro converterCoordenadasParaEndereco:", error.response?.data || error.message);
    return "Erro ao obter endereço";
  }
}

export async function gerarRotaGoogle(origin, destination, waypoints) {
  checkApiKey();
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: GOOGLE_API_KEY,
        mode: "driving",
        waypoints: waypoints.map(p => `${p.lat},${p.lng}`).join('|')
      }
    });
    console.log("🚌 Rota Google encontrada.");
    return response.data;
  } catch (error) {
    console.error("❌ Erro gerarRotaGoogle:", error.response?.data || error.message);
    return null;
  }
}

