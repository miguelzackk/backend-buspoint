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

async function buscarInformacoes(req, res) {
  try {
    await autenticar(); // 🔒 Garante que a API está autenticada

    const { linha, endereco, sentido } = req.query;
    if (!linha || !endereco || !sentido) {
      return res.status(400).json({ erro: "Parâmetros inválidos." });
    }

    // 📍 Buscar coordenadas do endereço
    const coordenadas = await buscarCoordenadasEndereco(endereco);
    if (!coordenadas) {
      return res.status(404).json({ erro: "Endereço não encontrado." });
    }

    // 🔍 Buscar código da linha
    const codigoLinha = await buscarCodigoLinha(linha);
    if (!codigoLinha) {
      return res.status(404).json({ erro: "Linha não encontrada." });
    }

    // 🚏 Buscar parada mais próxima do usuário
    const paradaMaisProxima = await buscarParadaMaisProxima(
      coordenadas.lat,
      coordenadas.lng
    );
    if (!paradaMaisProxima) {
      return res.status(404).json({ erro: "Nenhuma parada próxima encontrada." });
    }

    // 🚌 Buscar ônibus apenas no sentido correto e que ainda não passou
    const veiculosDisponiveis = await buscarVeiculosPosicao(
      codigoLinha,
      paradaMaisProxima.py,
      paradaMaisProxima.px,
      parseInt(sentido) // 🔄 Converte string para número
    );

    if (!veiculosDisponiveis || veiculosDisponiveis.length === 0) {
      return res.status(404).json({ erro: "Nenhum veículo disponível no sentido informado." });
    }

    // 🏆 Encontrar o ônibus mais próximo da parada
    const veiculoMaisProximo = veiculosDisponiveis.reduce(
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

    // 📍 Buscar endereço do ônibus
    const enderecoOnibus = await converterCoordenadasParaEndereco(
      veiculoMaisProximo.py,
      veiculoMaisProximo.px
    );

    // ⏳ Calcular tempo de chegada
    const tempoChegada = await calcularTempoComGoogle(
      veiculoMaisProximo.py,
      veiculoMaisProximo.px,
      paradaMaisProxima.py,
      paradaMaisProxima.px
    );

    // 🔥 Retorna resposta JSON com os dados processados
    res.json({
      linha: linha,
      parada: paradaMaisProxima.np,
      tempo_estimado_min: tempoChegada,
      localizacao_onibus: enderecoOnibus,
    });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

module.exports = { buscarInformacoes };
