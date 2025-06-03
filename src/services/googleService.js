//googleService.js
import axios from "axios";
import {
  GOOGLE_API_KEY,
  GOOGLE_GEOCODING_URL,
  GOOGLE_DISTANCE_MATRIX_URL
} from "../config/apiConfig.js";

async function buscarCoordenadasEndereco(endereco) {
  try {
    const enderecoFormatado = `${endereco}, São Paulo, SP`;
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: {
        address: enderecoFormatado,
        key: GOOGLE_API_KEY,
        region: "br"
      }
    });

    console.log("🔎 Geocode raw response:", response.data);

    const { status, results, error_message } = response.data;

    if (status === "OK" && results.length > 0) {
      console.log("✅ Endereço localizado:", results[0].formatted_address);
      return results[0].geometry.location;
    } else if (status === "ZERO_RESULTS") {
      console.warn("⚠️ Nenhum resultado encontrado para:", enderecoFormatado);
      return null;
    } else {
      console.error(`❌ Erro na API Geocoding: Status ${status}, Mensagem: ${error_message}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Erro na resposta da API:", error.response.data);
    } else {
      console.error("❌ Erro ao buscar coordenadas:", error.message);
    }
    return null;
  }
}


export async function buscarCoordenadasParadaMaisProxima(paradaMaisProximanp) {
  console.error("paramdamaisproxima:", paradaMaisProximanp)
  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { address: paradaMaisProximanp, key: GOOGLE_API_KEY },
    });
    if (response.data.results.length > 0) {
      return response.data.results[0].geometry.location;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar coordenadas parada mais proxima:", error.message + "  , " + paradaMaisProximanp);
    return null;
  }
}

export async function calcularTempoComGoogle(
  origemLat,
  origemLng,
  destinoLat,
  destinoLng
) {
  try {
    const response = await axios.get(GOOGLE_DISTANCE_MATRIX_URL, {
      params: {
        origins: `${origemLat},${origemLng}`,
        destinations: `${destinoLat},${destinoLng}`,
        key: GOOGLE_API_KEY,
        travelMode: "TRANSIT",
        transitPreferences: {
          allowedTravelModes: ["BUS"]
        }
      },
    });
    return (
      Math.ceil(response.data.rows[0]?.elements[0]?.duration?.value / 60) ||
      null
    );
  } catch (error) {
    console.error("Erro ao calcular tempo de chegada:", error.message);
    return null;
  }
}

export async function converterCoordenadasParaEndereco(latitude, longitude) {
  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { latlng: `${latitude},${longitude}`, key: GOOGLE_API_KEY },
    });
    if (response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    } else {
      return "Endereço não encontrado";
    }
  } catch (error) {
    console.error("Erro ao converter coordenadas em endereço:", error.message);
    return "Erro ao obter endereço";
  }
}

export async function consultarRotaOnibus(origem, destino) {
  try {
    const response = await axios.post(GOOGLE_TRANSIT_URL, {
      origin: {
        address: origem
      },
      destination: {
        address: destino
      },
      travelMode: "TRANSIT",
      transitPreferences: {
        allowedTravelModes: ["BUS"],
      },
      computeAlternativeRoutes: true,
      key: GOOGLE_API_KEY,
    });
    console.log("Rota encontrada: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao consultar a rota de transporte público:", error.message);
    return null;
  }
}
