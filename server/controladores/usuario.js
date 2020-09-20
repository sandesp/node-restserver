const express = require('express');
const bcrypt = require('bcryptjs');
const _ = require('underscore');

const Usuario = require('../modelos/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();

// get usuarios
app.get('/usuario', verificaToken, function(req, res) {
    let desde = req.query.desde | 0;
    desde = Number(desde);

    let limite = req.query.limite;
    limite = Number(limite);

    Usuario.find({}, 'nombre email rol google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: 'Token no válido'
                });
            }
            Usuario.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })

            })
        })

});

//crear usuarios
app.post('/usuario', [verificaToken, verificaAdminRole], function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        rol: body.rol,
        google: false
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: 'Token  no válido'
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

//actualizar usuarios
app.put('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'rol', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: 'Usuario incorrecto'
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

// borrar usuarios
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: 'Token  no válido'
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;