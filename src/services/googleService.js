const axios = require("axios");
const {
  GOOGLE_API_KEY,
  GOOGLE_GEOCODING_URL,
  GOOGLE_DISTANCE_MATRIX_URL,
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

async function calcularTempoComGoogle(
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
        mode: "driving",
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

module.exports = { buscarCoordenadasEndereco, calcularTempoComGoogle };
