// Carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model("postagens")
    require('./models/Categoria')
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require('passport')
    require("./config/auth")(passport)

    

// Configurações
    // Sessão 
        app.use(session({
            secret: "node123",
            resave: true,
            saveUninitialized: true
        }))


        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())

    // Middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user= req.user || null;
            res.locals.loggedUserName = req.user ? req.user.nome : null;
            next()
        })
    // Body Parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json());

    // Handlebars
   
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    
    // Mongoose
    mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(()=>{
            console.log("conectado ao Mongodb")
        }).catch((erro)=>{
            console.log("Erro ao se conectar ao mongodb "+ erro)
        })
    // Public
        app.use(express.static(path.join(__dirname,"public")))
// Rotas
    app.get("/", (req, res)=>{
        Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
            res.render("index",{postagens: postagens})
        }).catch((err)=>{
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/404")
        })
        
    })

    app.get("/postagem/:slug", (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render("postagem/index", {postagem: postagem,
                    titulo: postagem.titulo,
                    descricao: postagem.descricao,
                    conteudo: postagem.conteudo,
                    data: postagem.data,
                    categoria: postagem.categoria,
            })
            }else{
                req.flash("error_msg", "esta postagem não existe mais")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Erro interno")
                res.redirect("/")
        })
    })

    app.get('/categorias', (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index",{categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao acessar categorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render("categorias/postagens",{postagens: postagens, nome: categoria.nome})
                }).catch((err)=>{
                    req.flash("error_msg", "Erro")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Categoria não existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Categoria não existe")
            res.redirect("/")
        })
    })

    app.get("/404", (req,res)=>{
        res.send("Erro 404!")
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
    
    

// Outros
    const PORT= process.env.PORT ||8081
    app.listen(PORT,()=>{
        console.log("Servidor rodando!")
    })