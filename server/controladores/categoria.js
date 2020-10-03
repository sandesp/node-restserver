const express = require('express');
const _ = require('underscore');

const Categoria = require('../modelos/categoria');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();

// conseguir todas las categorias
app.get('/categoria', verificaToken, function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite;
    limite = Number(limite);

    Categoria.find({})
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email rol')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                })

            })
        })
});

// conseguir una categoria
app.get('/categoria/:id', verificaToken, function(req, res) {
    let id = req.params.id;

    Categoria.findById(id, 'nombre descripcion img')
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id no válido'
                    }
                })
            }
            return res.json({
                ok: true,
                categorias: categoriaDB

            });
        });
});

//crear categoria
app.post('/categoria', verificaToken, function(req, res) {
    let body = req.body;
    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        img: body.img,
        usuario: req.usuario._id
    });

    categoria.save((err, catDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!catDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: catDB
        });

    });

});

//actualizar categoria
app.put('/categoria/:id', verificaToken, function(req, res) {
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, catDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: 'Categoria incorrecta'
            });
        }

        res.json({
            ok: true,
            categoria: catDB
        });

    });

});

// borrar usuarios
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, catBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!catBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id de categoria no existe'
                }
            })
        }
        res.json({
            ok: true,
            categoria: catBorrada
        });
    })
});

module.exports = app;