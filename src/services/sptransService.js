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

async function buscarVeiculosPosicao(
  codigoLinha,
  paradaLatitude,
  paradaLongitude,
  sentido
) {
  try {
    const response = await api.get(`/Posicao`);
    const linha = response.data.l.find((linha) => linha.cl === codigoLinha);

    if (!linha) {
      console.log("Nenhuma linha encontrada.");
      return null;
    }

    let veiculosNoSentido = linha.v.filter((veiculo) => veiculo.sl === sentido);

    if (veiculosNoSentido.length === 0) {
      console.log("Nenhum veículo encontrado no sentido correto.");
      return null;
    }

    veiculosNoSentido = veiculosNoSentido.map((veiculo) => {
      const distancia = Math.hypot(
        veiculo.py - paradaLatitude,
        veiculo.px - paradaLongitude
      );
      return { ...veiculo, distancia };
    });

    veiculosNoSentido = veiculosNoSentido.filter((veiculo) => {
      return sentido === 1
        ? veiculo.py < paradaLatitude
        : veiculo.py > paradaLatitude;
    });

    if (veiculosNoSentido.length === 0) {
      console.log("Todos os ônibus já passaram da parada.");
      return null;
    }

    const onibusMaisProximo = veiculosNoSentido.reduce((maisProximo, atual) =>
      atual.distancia < maisProximo.distancia ? atual : maisProximo
    );

    return onibusMaisProximo;
  } catch (error) {
    console.error("Erro ao buscar posição dos veículos:", error.message);
    return null;
  }
}

async function buscarParadasPorLinha(codigoLinha) {
  try {
    const response = await api.get(
      `/Parada/BuscarParadasPorLinha?codigoLinha=${codigoLinha}`
    );
    if (response.data && response.data.length > 0) {
      return response.data.map((parada) => ({
        lat: parada.py,
        lng: parada.px,
        nome: parada.np,
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
