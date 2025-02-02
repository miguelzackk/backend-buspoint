const axios = require("axios");
const {
  GOOGLE_API_KEY,
  GOOGLE_GEOCODING_URL,
  GOOGLE_DISTANCE_MATRIX_URL,
  GOOGLE_TRANSIT_URL,
} = require("../config/apiConfig");

async function buscarCoordenadasEndereco(endereco) {
  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { address: endereco, key: GOOGLE_API_KEY },
    });
    if (response.data.results.length > 0) {
      return response.data.results[0].geometry.location;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar coordenadas:", error.message);
    return null;
  }
}

async function calcularTempoComGoogle(origemLat, origemLng, destinoLat, destinoLng) {
  try {
    const response = await axios.get(GOOGLE_DISTANCE_MATRIX_URL, {
      params: {
        origins: `${origemLat},${origemLng}`,
        destinations: `${destinoLat},${destinoLng}`,
        key: GOOGLE_API_KEY,
        travelMode: "TRANSIT",
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

async function converterCoordenadasParaEndereco(latitude, longitude) {
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

async function consultarRotaOnibus(origem, destino) {
  try {
    const response = await axios.post(GOOGLE_TRANSIT_URL, {
      origin: { address: origem },
      destination: { address: destino },
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

/**
 * 🔥 **Nova Função: Gera Rota de Ônibus com Waypoints**
 * Esta função usa as paradas do ônibus como waypoints no Google Maps.
 */
async function gerarRotaComWaypoints(paradas, origemLat, origemLng) {
  try {
    if (paradas.length < 2) {
      console.error("🚨 Erro: Não há paradas suficientes para gerar a rota!");
      return null;
    }

    const waypoints = paradas.map((parada) => ({
      location: { lat: parada.lat, lng: parada.lng },
      stopover: true,
    }));

    const response = await axios.get(GOOGLE_TRANSIT_URL, {
      params: {
        origin: `${origemLat},${origemLng}`,
        destination: `${paradas[paradas.length - 1].lat},${paradas[paradas.length - 1].lng}`,
        waypoints: waypoints,
        key: GOOGLE_API_KEY,
        travelMode: "TRANSIT",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao gerar rota com waypoints:", error.message);
    return null;
  }
}

module.exports = {
  buscarCoordenadasEndereco,
  calcularTempoComGoogle,
  converterCoordenadasParaEndereco,
  consultarRotaOnibus,
  gerarRotaComWaypoints,  // ✅ Adicionamos a nova função ao module.exports
};
