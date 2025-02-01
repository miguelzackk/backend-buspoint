const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Habilita CORS para todos os domínios (não recomendado em produção sem controle)
app.use(cors());

// OU se você quiser permitir apenas o domínio específico (substitua pelo seu frontend):
// app.use(cors({ origin: 'https://consume-back-buspoint.vercel.app' }));

// Simulação de dados de ônibus
const onibusData = [
  { linha: 6450, endereco: 'Rua Vatinga, 208', sentido: 1 },
  // Outros dados simulados
];

// Rota para buscar o ônibus
app.get('/busca', (req, res) => {
  const { linha, endereco, sentido } = req.query;

  if (!linha || !endereco || !sentido) {
    return res.status(400).json({ erro: 'Parâmetros inválidos' });
  }

  // Busca a linha no "banco de dados" simulado
  const onibus = onibusData.find(o => 
    o.linha === parseInt(linha) && 
    o.endereco === endereco && 
    o.sentido === parseInt(sentido)
  );

  if (!onibus) {
    return res.status(404).json({ erro: 'Linha não encontrada.' });
  }

  // Retorna a resposta com os dados do ônibus
  res.json({ sucesso: true, onibus });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
