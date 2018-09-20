const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const net = require('net')

app.all('*', function (req, res, next) {
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    }
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials)
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token")
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    res.header()
    next()
})

app.use(bodyParser.json())

app.get("/setClientData/:nome/:idade/:telefone/:cpf/:genero", (req, res) => {
    const data = req.params.nome  + ";" + req.params.idade  + ";" + req.params.telefone  + ";" + req.params.cpf  + ";" + req.params.genero 
    console.log(data)
    sendSocketMessage(data)
    res.json({message: data})
})

const sendSocketMessage = (data) => {
    const HOST = '127.0.0.1'
    const PORT = 8001
    const client = new net.Socket()

    client.connect(PORT, HOST, function() {
            console.log('connected to: ' + HOST + ':' + PORT)
            console.log(data)
            client.write(data)
    })

    client.on('data', function(data) {
            console.log(data.toString())
    })

    client.on('close', function() {
            console.log('Connection closed')
    })
}

app.listen(8000, ()=>{
    console.log('Rodando')
})