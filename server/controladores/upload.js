const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();

const Usuario = require('../modelos/usuario');
const Categoria = require('../modelos/categoria');


// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
    tipo = req.params.tipo;
    id = req.params.id;

    let tiposValidos = ['productos', 'usuarios', 'categorias'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos válidos son ' + tiposValidos.join(', ')
            }
        });

    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo.'
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones válidas son ' + extensionesValidas.join(', ')
            },
            ext: extension
        });
    }

    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenCategoria(id, res, nombreArchivo);
        }

    });

    function imagenUsuario(id, res, nombreArchivo) {
        Usuario.findById(id, (err, usuarioDB) => {
            if (err) {
                borrarImagen(nombreArchivo, 'usuarios');
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!usuarioDB) {
                borrarImagen(nombreArchivo, 'usuarios');

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });
            }

            borrarImagen(usuarioDB.img, 'usuarios');

            usuarioDB.img = nombreArchivo;
            usuarioDB.save((err, usuarioGuardado) => {
                res.json({
                    ok: true,
                    usuario: usuarioGuardado,
                    img: nombreArchivo
                });
            });
        });
    }

    function imagenCategoria(id, res, nombreArchivo) {
        Categoria.findById(id, (err, categoriaDB) => {
            if (err) {
                borrarImagen(nombreArchivo, 'categorias');
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!categoriaDB) {
                borrarImagen(nombreArchivo, 'categorias');

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoria no existe'
                    }
                });
            }

            borrarImagen(categoriaDB.img, 'categorias');

            categoriaDB.img = nombreArchivo;
            categoriaDB.save((err, categoriaGuardada) => {
                res.json({
                    ok: true,
                    categoria: categoriaGuardada,
                    img: nombreArchivo
                });
            });
        });
    }

    function borrarImagen(nombreImagen, tipo) {
        let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);

        }
    }

});
module.exports = app;