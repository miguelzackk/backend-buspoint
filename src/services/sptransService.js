//sptransService
const { api, TOKEN } = require("../config/apiConfig");

async function autenticar() {
  try {
    await api.post(`/Login/Autenticar?token=${TOKEN}`);
  } catch (error) {
    console.error("Erro ao autenticar na SPTrans:", error.message);
  }
}

async function buscarCodigoLinha(letreiro) {
  try {
    const response = await api.get(`/Linha/Buscar?termosBusca=${letreiro}`);
    return response.data[0]?.cl || null;
  } catch (error) {
    console.error("Erro ao buscar código da linha:", error.message);
    return null;
  }
}

async function buscarParadaMaisProxima(latitude, longitude) {
  try {
    const response = await api.get(`/Parada/Buscar?termosBusca=`);
    return response.data.reduce((maisProxima, paradaAtual) => {
      const distMaisProx = Math.hypot(
        maisProxima.py - latitude,
        maisProxima.px - longitude
      );
      const distAtual = Math.hypot(
        paradaAtual.py - latitude,
        paradaAtual.px - longitude
      );
      return distAtual < distMaisProx ? paradaAtual : maisProxima;
    });
  } catch (error) {
    console.error("Erro ao buscar parada mais próxima:", error.message);
    return null;
  }
}

async function buscarVeiculosPosicao(codigoLinha) {
  try {
    const response = await api.get(`/Posicao`);
    return response.data.l.find((linha) => linha.cl === codigoLinha) || null;
  } catch (error) {
    console.error("Erro ao buscar posição dos veículos:", error.message);
    return null;
  }
}

async function buscarParadasPorLinha(codigoLinha) {
  try {
      const response = await api.get(`/Parada/BuscarParadasPorLinha?codigoLinha=${codigoLinha}`);
      if (response.data && response.data.length > 0) {
          return response.data.map(parada => ({
              lat: parada.py,
              lng: parada.px,
              nome: parada.np
          }));
      }
      return [];
  } catch (error) {
      console.error("Erro ao buscar paradas da linha:", error.message);
      return [];
  }
}

module.exports = {
  autenticar,
  buscarCodigoLinha,
  buscarParadaMaisProxima,
  buscarVeiculosPosicao,
  buscarParadasPorLinha,
};  