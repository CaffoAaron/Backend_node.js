'use strict'

var validator = require('validator');
var Article = require('../models/article');

var fs = require('fs');
var path = require('path');

var Controller = {
    datosCurso: (req, res)=>{
        var hola = req.body.hola;
        return res.status(200).send({
            curso: 'Master en Frameworks Js',
            autor: 'Aaron Alva Caffo',
            url: 'aaron_caffo.com',
            hola
        });
    },

    test: (req, res)=>{
        return res.status(200).send({
            message: 'soy la accion test de mi controlador de articulos'
        });
    },

    save: (req, res)=>{
        // Recoger parametros por post
        var params = req.body;

        // Validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }

        if (validate_title && validate_content){

            //Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            //Guardar el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado!!!'
                    });
                }

                // Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });

            });
        }else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son validos!!!'
            });
        }
    },
    getArticles: (req, res)=>{

        var query = Article.find({})
        var last = req.params.last;

        if (last || last != undefined){
            query.limit(5)
        }

        //Find
        query.sort('-_id').exec( (err, articles)=>{
            if (err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos!!!'
                });
            }
            if (articles == null){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrara!!!'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });
        });
    },

    getArticle: (req, res)=>{
        //Recoger el id de la url
        var articleId = req.params.id;

        // Comprobar que existe
        if (!articleId || articleId==null){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo!!!'
            });
        }

        // Buscar el articulo
        Article.findById(articleId, (err, article)=>{

            if (!article || err){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo!!!'
                });
            }
            //Devolverlo en json
            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },

    update: (req, res) =>{
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        //Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try{
            var validate_tittle = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch (err){
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar!!!'
            });
        }

        //Find and Update
        if (validate_tittle && validate_content){
            Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated)=>{
                if (err){
                    return res.status(404).send({
                        status: 'error',
                        message: 'Error al actualizar!!!'
                    });
                }
                if (!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo!!!'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });

            });
        }else {
            return res.status(200).send({
                status: 'error',
                message: 'La validacion no es correcta!!!'
            });
        }

        //DEVOLVER RESPUESTA
    },

    delete: (req, res)=>{
        //Recoger el ide de la url
        var articleId = req.params.id

        // Find and delete

        Article.findOneAndDelete({_id:articleId}, (err, articleRomved)=>{
           if (err){
               return res.status(500).send({
                   status: 'error',
                   message: 'Error al borrar!!!'
               });
           }
           if (!articleRomved){
               return res.status(404).send({
                   status: 'error',
                   message: 'No existe el articulo!!!'
               });
           }
           return res.status(200).send({
               status: 'success',
               article: articleRomved
           });
        });
    },

    upload: (req, res)=>{
        //configurar el moludo del connect multiparty router/article.js
        var file_name = 'Imagen no subida..';

        if (!req.files){
            return res.status(404).send({
                status: 'error',
                fichero: file_name
            });
        }


        //recoger el fichero de la peticion
        var file_path = req.files.file0.path;

        var file_split = file_path.split('\\');

        //*Advertencia * en linux o mac
        //var file_split = file_path.split('/');

        //conseguir nombre y la extension del archivo
        var file_name = file_split[2];
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //comprobar la extensio, solo imagenes si no es validad borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg'  && file_ext != 'jpeg' && file_ext != 'gif'){
            //borrar el archivo subido
            fs.unlink(file_path, (err) =>{
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension de la imagen no es valida'
                });
            });

        }else{
            //si t odo es valido
            var articleId = req.params.id;
            Article.findOneAndUpdate({_id:articleId}, {image: file_name}, {new: true}, (err, artucleUpdate)=>{
                if(err|| !artucleUpdate){
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al guardar la imagen de articulo'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: artucleUpdate
                });
            });
            //Buscar el articulo y asignarle el nombre de la imagen y actualizarlo
        }
    },

    getImage: (req, res)=>{
        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {
           if (exists){
               return res.sendFile(path.resolve(path_file));
           } else {
               return res.status(404).send({
                   status: 'error',
                   message: 'La imagen no existe'
               });
           }
        });
    },
    search: (req, res)=>{
        //sacar el string a buscar
        var searchString = req.params.search;

        //Find or
        Article.find({"$or": [
                {"title": {"$regex": searchString, "$options": "i"}},
                {"content": {"$regex": searchString, "$options": "i"}},
            ]}).sort([['date', 'descending']]).exec( (err, articles)=>{
                if (err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'
                    });
                }
                if (!articles ||articles.length <= 0){
                     return res.status(404).send({
                        status: 'error',
                        message: 'No hay articulos que coincidan con tu busqueda'
                    });
                 }

                return res.status(200).send({
                status: 'success',
                articles
                });
        });
    }

}; //end controller

module.exports = Controller;
