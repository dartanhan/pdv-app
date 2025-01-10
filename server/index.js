const express = require('express');
const cors = require('cors');
const mysql = require("mysql2");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "loja_221224",
});

// Rota para buscar produtos e variações
app.get("/api/produtos", async (req, res) => {
  try {
    const query = `
      SELECT 
        lpv.id AS variacao_id,
        lpv.products_id AS produto_id,
        lpn.descricao AS descricao_produto,
        lpv.variacao AS descricao_variacao,
        CONCAT(lpv.subcodigo ,' - ', lpn.descricao, ' - ', lpv.variacao) AS nome_completo,
        lpv.subcodigo,
        CAST(lpv.valor_varejo AS DECIMAL(9,2)) AS valor_varejo,
        CAST(lpv.valor_atacado AS DECIMAL(9,2)) AS valor_atacado,
        lpv.quantidade,
        lpv.status,
        CAST(lpv.valor_produto AS DECIMAL(9,2)) AS valor_produto,
        lpn.codigo_produto,
        lpv.validade,
        lpv.estoque
      FROM 
        loja_produtos_variacao lpv
      JOIN 
        loja_produtos_new lpn 
      ON 
        lpv.products_id = lpn.id
      WHERE 
        lpv.status = 1
        AND lpn.status = 1
        AND lpv.quantidade > 0;
    `;

    const [results] = await db.promise().query(query);
    res.json(results);

    // db.query(query, (err, results) => {
    //   if (err) {
    //     console.error(err);
    //     res.status(500).send("Erro ao buscar produtos");
    //   } else {
    //     res.json(results);
    //   }
    // });
  } catch (err) {
    console.error(err);
    res.status(500).send({ 
      success: false, 
      message: 'Erro ao buscar/sincronizar Produtos.', 
      error: err.message 
    });
  }
});

// Rota para buscar clientes
app.get("/api/clientes", async (req, res) => {
  try {
    
    const query = `
      SELECT 
            lc.*,
            SUM(lvc.valor) AS cashback_disponivel
        FROM 
            loja_clientes lc
        LEFT JOIN 
            loja_vendas_cashback lvc 
            ON lc.id = lvc.cliente_id AND lvc.status = 0
        GROUP BY 
            lc.id;
    `;

    const [results] = await db.promise().query(query);
    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).send({ 
      success: false, 
      message: 'Erro ao buscar/sincronizar Cientes.', 
      error: err.message 
    });
  }
});

  // Rota para buscar forma de pagamentos 
  app.get("/api/formaPagamentos", async (req, res) => {
    try {
      
      const query = `
        SELECT lfp.id, lfp.nome
          FROM 
              loja_forma_pagamentos lfp
          WHERE
          lfp.status = 1;
      `;

      const [results] = await db.promise().query(query);
      res.json(results);

    } catch (err) {
      console.error('Erro ao buscar Forma de Pagamentos' , err);
      //res.status(500).send("Erro ao buscar Forma de Pagamentos");
      // Resposta em caso de erro
      res.status(500).send({ 
        success: false, 
        message: 'Erro ao buscar/sincronizar Forma de Pagamentos.', 
        error: err.message 
      });
    }
  });

    // Rota para buscar forma de entrega
    app.get("/api/formaEntregas", async (req, res) => {
      try {
        
        const query = `
          SELECT lfe.id, lfe.nome
            FROM 
                loja_forma_entregas lfe
            WHERE
            lfe.status = 1;
        `;
  
        const [results] = await db.promise().query(query);
        res.json(results);

      } catch (err) {
        console.error(err);
        //res.status(500).send("Erro ao buscar Forma de Entregas");
        // Resposta em caso de erro
          res.status(500).send({ 
            success: false, 
            message: 'Erro ao buscar/sincronizar Forma de Entregas.', 
            error: err.message 
        });
      }
    });

  // Endpoint para registrar a venda
  app.post('/api/vendas', async (req, res) => {
    try {
      const dadosVenda = req.body;

      // Verificação básica dos dados recebidos (ajuste conforme a necessidade)
      if (!dadosVenda || Object.keys(dadosVenda).length === 0) {
          return res.status(400).send({ 
              success: false, 
              message: 'Os dados da venda não foram fornecidos ou estão inválidos.' 
          });
      }

      // Salvar venda no banco
      const result = await salvarVendaNoBanco(dadosVenda);

      // Resposta com o resultado da operação
      res.status(200).send({ 
          success: true, 
          message: 'Venda registrada com sucesso!', 
          data: result 
      });
    } catch (err) {
      console.error('Erro ao registrar venda:', err);

      // Resposta em caso de erro
      res.status(500).send({ 
          success: false, 
          message: 'Erro ao registrar venda.', 
          error: err.message 
      });
    }
  });

  // Função para salvar os dados da venda no banco
  async function salvarVendaNoBanco(dadosVenda) {
    try {
      console.log('dadosVenda', dadosVenda);
      return ;
        // Aqui você pode gravar os dados no banco de dados (exemplo com MongoDB)
        // Exemplo com um banco fictício, ajuste para o seu caso (PostgreSQL, MySQL, etc.)
       // const resultado = await banco.save(dadosVenda);
      //  return resultado;
    } catch (err) {
        throw new Error('Erro ao salvar a venda no banco');
    }
  }

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
