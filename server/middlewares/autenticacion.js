const jwt = require('jsonwebtoken');

//==================
// Verificar token
//==================

let verificaToken = ((req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
});

//=========================
// Verifica admin_role
//=========================

let verificaAdminRole = ((req, res, next) => {
    let usuario = req.usuario;

    if (usuario.rol != 'Admin') {
        return res.status(403).json({
            ok: false,
            err: 'Usuario no autorizado'
        });
    }
    next();
});

//==================
// Verificar token imagen
//==================

let verificaTokenImg = ((req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
});

module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}