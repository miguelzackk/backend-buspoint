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

async function buscarVeiculosPosicao(codigoLinha, paradaLat, paradaLng, sentido) {
  try {
    // 🛠️ Certifique-se de que estamos autenticados antes de fazer a requisição
    await autenticar(); 

    const response = await api.get(`/Posicao`);
    
    // Verifica se a API retornou dados válidos
    if (!response.data || !response.data.l) {
      console.error("❌ Erro: Resposta da API não contém dados válidos.");
      return null;
    }

    // Busca a linha correta na resposta da API
    const linha = response.data.l.find((linha) => linha.cl === codigoLinha);

    if (!linha) {
      console.log(`🚨 Nenhum ônibus encontrado para a linha ${codigoLinha}`);
      return null;
    }

    console.log(`🔍 Ônibus encontrados para a linha ${codigoLinha}:`, linha.v);

    // Filtra apenas os ônibus que ainda NÃO passaram pela parada
    const onibusValidos = linha.v.filter((onibus) => {
      if (onibus.sl !== sentido) return false; // Filtra ônibus no sentido correto

      // Distância entre o ônibus e a parada
      const distanciaOnibus = Math.hypot(onibus.py - paradaLat, onibus.px - paradaLng);

      // Verifica se o ônibus ainda não passou do ponto
      const aindaNaoPassou = onibus.py < paradaLat || onibus.px < paradaLng; 

      return aindaNaoPassou;
    });

    console.log("🚌 Ônibus filtrados que ainda não passaram:", onibusValidos);

    return onibusValidos.length > 0 ? onibusValidos : null;
  } catch (error) {
    console.error("❌ Erro ao buscar posição dos veículos:", error.message);
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