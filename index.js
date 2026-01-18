const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const URL_ALVO = "https://www.tipminer.com/br/historico/estrelabet/aviator";

async function iniciarVigia() {
    console.log("Iniciando navegador...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    });

    const page = await browser.newPage();
    console.log("Abrindo TipMiner...");
    
    try {
        await page.goto(URL_ALVO, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (e) {
        console.log("Erro ao carregar página, tentando continuar...");
    }

    let ultimaVela = "";

    setInterval(async () => {
        try {
            const valorAtual = await page.evaluate(() => {
                // Seleciona a primeira vela da grade de histórico
                const vela = document.querySelector('.result-value'); 
                return vela ? vela.innerText.replace('x', '').trim() : null;
            });

            if (valorAtual && valorAtual !== ultimaVela) {
                ultimaVela = valorAtual;
                console.log("Vela Detectada: " + valorAtual);
                io.emit('nova-vela', valorAtual);
            }
        } catch (e) {
            console.log("Erro ao capturar dados do site.");
        }
    }, 4000);
}

// Serve o arquivo index.html na rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
    iniciarVigia();
});
