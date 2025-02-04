//googleService.js
const axios = require("axios");
const { GOOGLE_API_KEY, GOOGLE_GEOCODING_URL, GOOGLE_DISTANCE_MATRIX_URL } = require("../config/apiConfig");

async function buscarCoordenadasEndereco(endereco) {
  try {
    const response = await axios.get(GOOGLE_GEOCODING_URL, {
      params: { address: endereco, key: GOOGLE_API_KEY },
    });
    return response.data.results[0]?.geometry.location || null;
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
        mode: "transit",
      },
    });
    return Math.ceil(response.data.rows[0]?.elements[0]?.duration?.value / 60) || null;
  } catch (error) {
    console.error("Erro ao calcular tempo de chegada:", error.message);
    return null;
  }
}

async function consultarRotaOnibus(origem, destino) {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
      params: {
        origin: origem,
        destination: destino,
        mode: "transit",
        transit_mode: "bus",
        key: GOOGLE_API_KEY,
      },
    });
    return response.data.routes[0] || null;
  } catch (error) {
    console.error("Erro ao consultar a rota de ônibus:", error.message);
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


module.exports = {
  buscarCoordenadasEndereco,
  calcularTempoComGoogle,
  consultarRotaOnibus,
  converterCoordenadasParaEndereco,
};