const {
  autenticar,
  buscarCodigoLinha,
  buscarParadaMaisProxima,
  buscarVeiculosPosicao,
} = require("../services/sptransService");
const {
  buscarCoordenadasEndereco,
  calcularTempoComGoogle,
  converterCoordenadasParaEndereco,
} = require("../services/googleService");

const { buscarParadasPorLinha } = require("../services/sptransService");


async function buscarInformacoes(req, res) {
  try {
    await autenticar();
    const { linha, endereco, sentido } = req.query;

    if (!linha || !endereco || !sentido) {
      return res.status(400).json({ erro: "Parâmetros inválidos." });
    }

    const coordenadas = await buscarCoordenadasEndereco(endereco);
    if (!coordenadas) {
      return res.status(404).json({ erro: "Endereço não encontrado." });
    }

    const codigoLinha = await buscarCodigoLinha(linha);
    if (!codigoLinha)
      return res.status(404).json({ erro: "Linha não encontrada." });

    const paradaMaisProxima = await buscarParadaMaisProxima(
      coordenadas.lat,
      coordenadas.lng
    );
    if (!paradaMaisProxima)
      return res
        .status(404)
        .json({ erro: "Nenhuma parada próxima encontrada." });

    const linhaInfo = await buscarVeiculosPosicao(codigoLinha);
    if (!linhaInfo)
      return res.status(404).json({ erro: "Nenhum veículo disponível." });

    const veiculosNoSentido = linhaInfo.vs.filter(
      (v) => linhaInfo.sl == sentido
    );
    if (veiculosNoSentido.length === 0)
      return res
        .status(404)
        .json({ erro: "Nenhum veículo no sentido informado." });

    const veiculoMaisProximo = veiculosNoSentido.reduce(
      (maisProximo, veiculoAtual) => {
        const distMaisProx = Math.hypot(
          maisProximo.py - paradaMaisProxima.py,
          maisProximo.px - paradaMaisProxima.px
        );
        const distAtual = Math.hypot(
          veiculoAtual.py - paradaMaisProxima.py,
          veiculoAtual.px - paradaMaisProxima.px
        );
        return distAtual < distMaisProx ? veiculoAtual : maisProximo;
      }
    );

    const enderecoOnibus = await converterCoordenadasParaEndereco(
      veiculoMaisProximo.py,
      veiculoMaisProximo.px
    );
    const tempoChegada = await calcularTempoComGoogle(
      veiculoMaisProximo.py,
      veiculoMaisProximo.px,
      paradaMaisProxima.py,
      paradaMaisProxima.px
    );

    res.json({
      linha: linhaInfo.lt,
      parada: paradaMaisProxima.np,
      tempo_estimado_min: tempoChegada,
      localizacao_onibus: enderecoOnibus,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

async function buscarParadasDaLinha(codigoLinha) {
  try {
    const response = await buscarParadasPorLinha(codigoLinha);
    if (response.length > 0) {
      return response;
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar paradas da linha:", error.message);
    return [];
  }
}

async function criarRotaEntreParadas(paradas) {
  // Aqui, você pode usar o código da API do Google Maps que você já tem
  const waypoints = paradas.map(parada => ({
    location: new google.maps.LatLng(parada.lat, parada.lng),
    stopover: true,
  }));

  const request = {
    origin: waypoints[0].location,  // Ponto de partida
    destination: waypoints[waypoints.length - 1].location, // Ponto de chegada
    waypoints: waypoints.slice(1, -1),  // Paradas intermediárias
    travelMode: google.maps.TravelMode.DRIVING, // Modo de transporte
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
    } else {
      console.error("Erro ao calcular a rota:", status);
    }
  });
}

async function mostrarRotaDoOnibus(linha) {
  const paradas = await buscarParadasDaLinha(linha);
  if (paradas.length > 0) {
    criarRotaEntreParadas(paradas);
  } else {
    console.error("Não foi possível encontrar as paradas dessa linha.");
  }
}

module.exports = { mostrarRotaDoOnibus };

module.exports = { buscarInformacoes };
