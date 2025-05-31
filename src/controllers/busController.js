//busController.js
import {
  autenticar,
  buscarCodigoLinha,
  buscarParadaMaisProxima,
  buscarVeiculosPosicao,
} from "../services/sptransService.js"
import {
  buscarCoordenadasEndereco,
  buscarCoordenadasParadaMaisProxima,
  calcularTempoComGoogle,
  converterCoordenadasParaEndereco,
} from "../services/googleService.js"

export async function buscarInformacoes(req, res) {
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


    const coordenadasMP = await buscarCoordenadasParadaMaisProxima(paradaMaisProxima.np);
    if (!coordenadasMP) {
      return res.status(404).json({ erro: "CoordenadasMP não encontrado." });
    }



    res.json({
      linha: linhaInfo.lt,
      parada: paradaMaisProxima.np,
      tempo_estimado_min: tempoChegada + " MP =  " + coordenadasMP + " , Endereco = " + coordenadas,
      localizacao_onibus: enderecoOnibus,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
