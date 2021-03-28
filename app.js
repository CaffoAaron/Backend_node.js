'use strict'

//cagar mudulos de node para cargar servidor
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express (http)
var app = express();

//cargar ficheros rutas
var articleRoutes = require('./routes/article');

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//cors
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});



//añadir prefiojo a rutas prueba / cargar rutas
app.use('/api',articleRoutes);


/*
app.get('/datos-curso', (req, res)=>{
    return res.status(200).send({
        curso: 'Master en Frameworks Js',
        autor: 'Aaron Alva Caffo',
        url: 'aaron_caffo.com'
    });
});
*/


// exportar modulo (fichero actual)
module.exports = app;
