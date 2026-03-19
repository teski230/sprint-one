const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3000;
const crypto = require('crypto');

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


// Conexão com banco
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tcc'
});

app.get('/clientes', async (req, res) => {

    try {

        const sql = 'SELECT * FROM clientes';
        const [rows] = await db.query(sql);

        return res.json(rows);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false
        });
    }

});

app.get('/pedidos', async (req,res)=> {

    try {
        const sql = 'SELECT * FROM pedidos';
        const [rows] = await db.query(sql);

        return res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false
        });
    }

});

app.get('/verProdutos', async (req,res)=>{

    try {

        const sql = 'SELECT * FROM produtos';
        const [ rows ] = await db.query(sql);

        return res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false
        });
    }
});



app.get('/clientes/:id', async (req, res) => {

    try{
        const { id } = req.params;

        const sql = 'SELECT * FROM clientes WHERE id_cliente = ?';
        const [rows] = await db.query(sql, [id]);

        if(rows.length === 0){
            return res.status(404).json({
                success: false,
                message: "Cliente não encontrado"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {

        console.log("Erro ao buscar cliente:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
        });
    }

});

app.get('/produtos/:id', async (req,res) =>{

    try{
        const {id_produtos} = req.params;

        const sql = 'SELECT * FROM produtos WHERE id_produtos = ?';
        const [rows] = await db.query(sql, [id_produtos]);

        if(rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"produto nao encontrado"
            });
        }

        return res.status(200).json({
            sucess:true,
            data: rows[0]
        });
    } catch (error) {
        console.log("erro ao buscar", error);

        return res.status(500).json({
            success:false,
            message:"erro interno do servidor"
        });
    }
});



app.post('/cadastro', async (req,res) => {

    try {
        const { nome, email, senha} = req.body;

        const senhaHash = crypto
            .createHash('sha256')
            .update(senha)
            .digest('hex');

        const sql = ` INSERT INTO clientes (nome, email, senha) VALUES(?,?,?)`

        const [resultado] = await db.query(sql,[nome, email, senhaHash

        ]);

        return res.json({
            sucess:true,
            message:"Vc foi cadastrado com sucesso",
            id:resultado.insertId
        });
    } catch (error) {
        console.log("erro ao cadastrar", error);
        return res.json({
            sucess:false,
            message:"erro ao cadastrar"
        })
    }
});

app.post('/entregadores', async (req,res) => {

    try {
        const { nome, email, CNH, senha} = req.body;

        const senhaHash = crypto
            .createHash('sha256')
            .update(senha)
            .digest('hex');

        const sql = ` INSERT INTO entregadores (nome, email, CNH, senha) VALUES(?,?,?,?)`

        const [resultado] = await db.query(sql,[nome, email,CNH, senhaHash

        ]);

        return res.json({
            sucess:true,
            message:"Vc foi cadastrado com sucesso",
            id:resultado.insertId
        });
    } catch (error) {
        console.log("erro ao cadastrar", error);
        return res.json({
            sucess:false,
            message:"erro ao cadastrar"
        })
    }
});

app.post('/ADCprodutos', async (req,res) =>{

    try {
        const { id_produtos, nome, descricao, preco, categoria } = req.body;

        const sql = `INSERT INTO produtos (id_produtos, nome, descricao, preco, categoria) VALUES (?,?,?,?,?)`
        
        const [resultado] = await db.query(sql,[id_produtos,nome,descricao,preco,categoria

        ]);

        return res.json({
            sucess:true,
            message:"Produto adicionado",
            id:resultado.insertId
        });
    } catch (error) {
        console.log("erro ao adicionar", error);
        return res.json({
            success:false,
            message:"erro ao adicionar"
        })
    }
});

app.post('/pedidos', async (req, res) => {
    try {
        const {
            id_cliente,
            bairro,
            rua,
            numero,
            complemento,
            valor,
            telefone,
            status,
            forma_pagamento,
            troco_para
        } = req.body;

        const sql = `
            INSERT INTO pedidos 
            (id_cliente, bairro, rua, numero, complemento, valor, telefone, status, forma_pagamento, troco_para) 
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `;

        const [resultado] = await db.query(sql, [
            id_cliente,
            bairro,
            rua,
            numero,
            complemento,
            valor,
            telefone,
            status,
            forma_pagamento,
            troco_para
        ]);

        return res.status(201).json({
            success: true,
            message: "Pedido criado com sucesso",
            id: resultado.insertId
        });

    } catch (error) {
        console.log("Erro ao criar pedido:", error);

        return res.status(500).json({
            success: false,
            message: "Erro ao criar pedido"
        });
    }
});






// --------------------------------------------------------
// INICIAR SERVIDOR
// --------------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Teste: http://localhost:${PORT}`);
});