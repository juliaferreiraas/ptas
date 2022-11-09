// JWT
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
var { expressjwt: expressJWT } = require("express-jwt");
const cors = require('cors');

var cookieParser = require('cookie-parser')

const express = require('express');
const { usuario } = require('./models');

const app = express();

app.set('view engine', 'ejs');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(cookieParser());
app.use(
  expressJWT({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    getToken: req => req.cookies.token
  }).unless({ path: [ "/autenticar", "/logar", "/deslogar"] })
);

app.get('/autenticar', async function(req, res){
  res.render('autenticar');
});

app.get('/listar', async function(req, res){
  const usuarios = await usuario.findAll();
    res.render("listar", { usuarios })
    });

app.get('/cadastro', async function(req, res){
  res.render("cadastro")
  });

  app.post('/cadastro', async function(req, res){
    const usuario_ = await usuario.create(req.body)
    res.json(usuario_)
    });

app.get('/', async function(req, res){
  res.render("home")
});

app.post('/logar', async (req, res) => {
  const banco = await usuario.findOne({where: {usuario:req.body.user}})
  
  const encrypt = ((text) =>  {
    let cipher = crypto.createCipheriv(ALGORITMO, CHAVE, IV);
    let encrypted = cipher.update(text, 'utf8', METODO_CRIPTOGRAFIA);
    encrypted += cipher.final(METODO_CRIPTOGRAFIA);
    return encrypted;
 }); 
 
  const encrypted = encrypt(req.body.password);
  console.log(encrypted);

  if(req.body.user === banco.usuario && req.body.password === banco.senha){
    const id = 1;
    const token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 3600 // expira in 1h
    });

    res.cookie('token', token, { httpOnly: true });
    return res.json({ auth: true, token: token });
  }

  res.status(500).json({message: 'Login inválido!'});
})

app.post('/deslogar', function(req, res) {
  res.cookie('token', null, { httpOnly: true });
  res.json({deslogado: true})
})

app.get('/sobre', function(req, res) {
  res.cookie('token', null, { httpOnly: true });
  res.json({sobre: true})
})


app.listen(3000, function() {
  console.log('App de Exemplo escutando na porta 3000!')
});