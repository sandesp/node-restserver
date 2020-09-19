const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['Admin', 'Negocio', 'Cliente'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioModel = new Schema({
    nombre: {
        type: String,
        required: [true, 'El campo nombre es requerido']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El campo correo eletronico es requerido']
    },
    password: {
        type: String,
        required: [true, 'El campo clave es requerido']
    },
    img: {
        type: String,
        required: false
    },
    rol: {
        type: String,
        default: 'Negocio',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioModel.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

usuarioModel.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('usuario', usuarioModel);