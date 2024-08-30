const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require("passport")

router.get("/registro", (req, res)=>{
    res.render("usuarios/registro")
})

//validação cadastro de usuarios
router.post('/registro', (req, res)=>{
    var erros=[]
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome invalido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email invalido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "senha invalido"})
    }
    if(!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null){
        erros.push({texto: "senha invalido"})
    }
    if(req.body.nome.length < 4){
        erros.push({texto: "nome curto demais"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "senha curta demais"})
    }
    
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senha diferentes"})
    }

    if(erros.length>0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                console.log("email ja cadastrado")
                req.flash("error_msg", "Email ja cadastrado")
                res.redirect('/usuarios/registro')
            }else{
                
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10,(erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }
                            novoUsuario.senha = hash

                            novoUsuario.save().then(()=>{
                                req.flash("success_msg", "Usuario criado com sucesso")
                                res.redirect("/")
                            }).catch((err)=>{
                                req.flash("error_msg", "Erro ao cadastrar, tente novamento mais tarde")
                                res.redirect("/")
                            })
                        
                    })
                })
            }
        }).catch((err)=>{
            req.flash("error_msg", "Erro interno, tente novamento mais tarde")
            res.redirect('/')
        })
    }
})

//login

router.get('/login', (req, res)=>{
    res.render("usuarios/login")
})

router.post("/login", (req, res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
    
})


router.get("/logout", (req, res)=>{

    req.logout(()=>{
       req.flash('success_msg', "Deslogado com sucesso");
    res.redirect('/'); 
    })
    


})
module.exports = router