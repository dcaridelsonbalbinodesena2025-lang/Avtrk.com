const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const URL_ALVO = "https://www.tipminer.com/br/historico/estrelabet/aviator";

async function iniciarVigia() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
    });
    
    const page = await browser.newPage();
    console.log("Abrindo TipMiner...");
    await page.goto(URL_ALVO, { waitUntil: 'networkidle2' });

    let ultimaVela = "";

    setInterval(async () => {
        try {
            const valorAtual = await page.evaluate(() => {
                // Seleciona a primeira vela da grade de histórico
                const vela = document.querySelector('.result-value') || document.querySelector('.multiplier');
                return vela ? vela.innerText.replace('x', '').trim() : null;
            });

            if (valorAtual && valorAtual !== ultimaVela) {
                ultimaVela = valorAtual;
                console.log("Vela Detectada: " + valorAtual);
                io.emit('nova-vela', valorAtual);
            }
        } catch (e) {
            console.log("Erro ao capturar:");
        }
    }, 4000); 
}

app.get('/', (req, res) => res.send("Robô Sniper Online!"));
http.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado!");
    iniciarVigia();
});
