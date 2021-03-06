require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const hbs = require('hbs');
//require('./hbs/helpers');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(require('./controladores/index'));

// parse application/json
app.use(bodyParser.json())

// habilitar carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

app.set('view engine', 'hbs');
app.get('/', (req, res) => {
    res.render('home', {
        nombre: 'sanDra espiRitusanto'
    });
});

// conectar a base de datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) {
            throw err;
        }
        console.log('Base de datos ONLINE');
    });



app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto ', process.env.PORT);
});