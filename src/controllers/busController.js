//busController.js
import {
  autenticar,
  buscarCodigoLinha,
  buscarParadaMaisProxima,
  buscarVeiculosPosicao,
} from "../services/sptransService.js";
import {
  buscarCoordenadasEndereco,
  buscarCoordenadasParadaMaisProxima,
  calcularTempoComGoogle,
  converterCoordenadasParaEndereco,
} from "../services/googleService.js";

export async function buscarInformacoes(req, res) {
  try {
    await autenticar();
    const { linha, endereco, sentido } = req.query;
    if (!linha || !endereco || !sentido) {
      return res.status(400).json({ erro: "Parâmetros inválidos." });
    }

    const sentidoNormalizado = String(sentido);
    console.log(`🚦 [busca] Linha: ${linha}, Endereço: ${endereco}, Sentido: ${sentidoNormalizado}`);

    const coordenadas = await buscarCoordenadasEndereco(endereco);
    if (!coordenadas) {
      return res.status(404).json({ erro: "Endereço não encontrado." });
    }

    const codigoLinha = await buscarCodigoLinha(linha);
    if (!codigoLinha) {
      return res.status(404).json({ erro: "Linha não encontrada." });
    }

    const paradaMaisProxima = await buscarParadaMaisProxima(coordenadas.lat, coordenadas.lng);
    if (!paradaMaisProxima) {
      return res.status(404).json({ erro: "Nenhuma parada próxima encontrada." });
    }

    const linhaInfo = await buscarVeiculosPosicao(codigoLinha);
    if (!linhaInfo?.vs?.length) {
      return res.status(404).json({ erro: "Nenhum veículo disponível." });
    }

    const veiculosNoSentido = linhaInfo.vs.filter(v => String(v.sl) === sentidoNormalizado);
    if (!veiculosNoSentido.length) {
      return res.status(404).json({ erro: "Nenhum veículo no sentido informado." });
    }

    const veiculoMaisProximo = encontrarVeiculoMaisProximo(veiculosNoSentido, paradaMaisProxima);
    console.log("🚌 Veículo mais próximo:", veiculoMaisProximo);

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

    const coordenadasMP = await buscarCoordenadasParadaMaisProxima(paradaMaisProxima.np);
    if (!coordenadasMP) {
      return res.status(404).json({ erro: "CoordenadasMP não encontrado." });
    }

    res.json({
      linha: linhaInfo.lt,
      parada: paradaMaisProxima.np,
      tempo_estimado_min: tempoChegada,
      localizacao_onibus: enderecoOnibus
    });

  } catch (error) {
    console.error("❌ Erro em buscarInformacoes:", error);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
}

// Função auxiliar para encontrar o veículo mais próximo
function encontrarVeiculoMaisProximo(veiculos, parada) {
  return veiculos.reduce((maisProximo, atual) => {
    const distMaisProx = calcularDistancia(maisProximo, parada);
    const distAtual = calcularDistancia(atual, parada);
    return distAtual < distMaisProx ? atual : maisProximo;
  });
}

// Função auxiliar para cálculo de distância
function calcularDistancia(ponto1, ponto2) {
  return Math.hypot(ponto1.py - ponto2.py, ponto1.px - ponto2.px);
}

export { buscarInformacoes };