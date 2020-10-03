const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaModel = new Schema({
    nombre: {
        type: String,
        required: [true, 'El campo nombre es requerido']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    img: {
        type: String,
        required: false
    },
    estado: {
        type: Boolean,
        default: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuario'
    }

});

categoriaModel.methods.toJSON = function() {
    let cat = this;
    let catObject = cat.toObject();
    //    delete catObject.password;
    return catObject;
}

categoriaModel.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('categoria', categoriaModel);