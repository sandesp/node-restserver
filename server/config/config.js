process.env.PORT = process.env.PORT || 3000;

//=========================
// Entorno
//=========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//=========================
// Base de datos
//=========================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/promdb';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;


//=========================
// vencimiento del token
// 30 segundos
// 30 minutos
// 24 horas
// 30 dias
//=========================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
//=========================

//=========================
// SEED de autenticacion 
//=========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';
//=========================