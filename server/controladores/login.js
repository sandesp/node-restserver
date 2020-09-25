const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../modelos/usuario');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en el servidor'
                }
            });
        }
        if (!usuarioDb) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(usuario) o contraseña incorrectos'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
                usuario: usuarioDb,
            },
            process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }
        );

        res.json({
            ok: true,
            usuario: usuarioDb,
            token
        });
    });
});

// Configuraciones de  Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Error en el servidor 2'
                }
            });
        }

        if (usuarioDb) {

            if (usuarioDb.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                        usuario: usuarioDb,
                    },
                    process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }
                );

                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            }
        } else {
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                        usuario: usuarioDb,
                    },
                    process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }
                );

                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            });
        }

    });
});

module.exports = app;