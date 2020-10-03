const express = require('express');
const Producto = require('../modelos/producto');

const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

//================================
// Obtener todos los productos
//================================
app.get('/producto', verificaToken, function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('Usuario', ' nombre email rol')
        .populate('Categoria', ' nombre descripcion img ')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.count({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });

            });
        })
});

//================================
// Obtener un producto
//================================
app.get('/producto/:id', verificaToken, function(req, res) {
    let id = req.params.id;

    Producto.findById(id, 'nombre descripcion precioUni categoria usuario disponible')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id no válido'
                    }
                });
            }
            return res.json({
                ok: true,
                productos: productoDB

            });
        });
});

//================================
// Buscar un producto
//================================
app.get('/producto/buscar/:termino', verificaToken, function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite;
    limite = Number(limite);

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('Categoria', ' nombre ')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.count({ nombre: regex, disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });

            });
        })
});

//================================
// Crear un producto
//================================
app.post('/producto', verificaToken, function(req, res) {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoriaId,
        usuario: req.usuario._id

    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

//================================
// Actualizar un producto
//================================
app.put('/producto/:id', verificaToken, function(req, res) {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: 'Id de producto incorrecto'
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

//================================
// Borrar un producto (no fisicamente, sino ponerlo no disponible)
//================================
app.delete('/producto/:id', verificaToken, function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaEstado, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id de producto no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado
        });
    });
});

module.exports = app;