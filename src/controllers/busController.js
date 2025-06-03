//busController.js
import {
  autenticar,
  buscarCodigoLinha,
  buscarParadaMaisProxima,
  buscarVeiculosPosicao,
  buscarParadasPorLinha
} from "../services/sptransService.js";

import {
  buscarCoordenadasEndereco,
  converterCoordenadasParaEndereco,
  gerarRotaGoogle
} from '../services/googleService.js';

export async function buscarInformacoes(req, res) {
  console.log("➡️ [buscarInformacoes] Recebido:", req.query);

  try {
    await autenticar();

    const { linha, endereco, sentido } = req.query;
    const sentidoNormalizado = String(sentido);
    console.log(`🚦 Linha: ${linha}, Endereço: ${endereco}, Sentido: ${sentidoNormalizado}`);

    const coordenadas = await buscarCoordenadasEndereco(endereco);
    if (!coordenadas) return res.status(404).json({ erro: "Endereço não encontrado." });

    const codigoLinha = await buscarCodigoLinha(linha);
    if (!codigoLinha) return res.status(404).json({ erro: "Linha não encontrada." });

    const paradaMaisProxima = await buscarParadaMaisProxima(coordenadas.lat, coordenadas.lng);
    if (!paradaMaisProxima) return res.status(404).json({ erro: "Nenhuma parada próxima encontrada." });

    const linhaInfo = await buscarVeiculosPosicao(codigoLinha);
    if (!linhaInfo?.vs?.length) return res.status(404).json({ erro: "Nenhum veículo disponível." });

    const veiculosNoSentido = linhaInfo.vs.filter(v => String(v.sl) === sentidoNormalizado);
    if (!veiculosNoSentido.length) return res.status(404).json({ erro: "Nenhum veículo no sentido informado." });

    const veiculoMaisProximo = veiculosNoSentido.reduce((maisProximo, atual) => {
      const distMaisProx = Math.hypot(maisProximo.py - paradaMaisProxima.py, maisProximo.px - paradaMaisProxima.px);
      const distAtual = Math.hypot(atual.py - paradaMaisProxima.py, atual.px - paradaMaisProxima.px);
      return distAtual < distMaisProx ? atual : maisProximo;
    });

    const itinerario = await buscarParadasPorLinha(codigoLinha);

    const rota = await gerarRotaGoogle(
      { lat: veiculoMaisProximo.py, lng: veiculoMaisProximo.px },
      { lat: paradaMaisProxima.py, lng: paradaMaisProxima.px },
      itinerario
    );

    if (!rota || !rota.routes || !rota.routes.length) {
      return res.status(500).json({ erro: "Falha ao gerar rota no Google Directions." });
    }

    const enderecoOnibus = await converterCoordenadasParaEndereco(veiculoMaisProximo.py, veiculoMaisProximo.px);

    const resposta = {
      linha: linhaInfo.lt,
      parada: paradaMaisProxima.np,
      tempo_estimado_min: Math.ceil(rota.routes[0].legs[0].duration.value / 60),
      localizacao_onibus: enderecoOnibus,
      polyline: rota.routes[0].overview_polyline.points
    };

    console.log("✅ Resposta enviada:", resposta);

    res.json(resposta);

  } catch (error) {
    console.error("❌ Erro buscarInformacoes:", error);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
}
