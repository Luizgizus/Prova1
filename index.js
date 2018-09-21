const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const net = require('net')

const HOST = 'localhost'
const PORT = 8001
const client = new net.Socket()

const getClientStack = []

client.setEncoding('utf8');

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
    const data = JSON.stringify(req.params)
    sendNewClient(JSON.stringify(req.params))
    res.json({ message: data })
})

app.get("/clients", (req, res) => {
    getClients()
    const interval = setInterval(() => {
        if (getClientStack.length) {
            let resp = []
            const clientData = getClientStack.pop().split("@@##@@")

            for (let i = 0; i < clientData.length; i++) {
                if (clientData && clientData[i] && clientData[i].length) {
                    resp.push(JSON.parse(clientData[i]))
                }
            }
            console.log(resp)
            res.json(resp)
            clearInterval(interval)
        }
    }, 500)
})

const sendNewClient = (data) => {
    client.connect(PORT, HOST)
    client.write("setNewClient@@##@@" + data)
    client.end()
}

const getClients = () => {
    client.connect(PORT, HOST)
    client.write("getClients")
    client.end()
}

app.listen(8000, () => {
    console.log('Rodando')
    net.createServer(function (sock) {
        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sock.on('data', function (data) {
            const bufferesResp = new Buffer(data).toString()
            console.log(bufferesResp)
            if (bufferesResp.startsWith("getClients")) {
                getClientStack.push(bufferesResp.split("####")[1])
            }
            sock.write(data);
        });

        sock.on('close', function (data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });

    }).listen(8002, "localhost")
})