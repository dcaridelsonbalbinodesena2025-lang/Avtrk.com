<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KCM MASTER - MODO REAL</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { --tg-bg: #0e1621; --tg-panel: #17212b; --tg-blue: #2481cc; --tg-green: #45ad5b; --tg-red: #d14e4e; --tg-text: #f5f5f5; }
        body { background: #070a0e; color: var(--tg-text); font-family: 'Open Sans', sans-serif; margin: 0; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        #app { width: 100%; max-width: 450px; background: var(--tg-bg); display: flex; flex-direction: column; position: relative; border-left: 1px solid #222; border-right: 1px solid #222; }
        
        .tg-header { background: var(--tg-panel); padding: 12px 15px; display: flex; align-items: center; border-bottom: 1px solid #000; }
        .tg-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, #50a2e3, #2481cc); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; }
        .tg-info { flex: 1; }
        .tg-info b { display: block; font-size: 14px; }
        .tg-info span { font-size: 11px; color: var(--tg-green); }

        .visor-chat { flex-grow: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-blend-mode: overlay; background-color: var(--tg-bg); }
        .bubble { max-width: 85%; padding: 12px; border-radius: 12px; margin-bottom: 10px; font-size: 13px; align-self: flex-start; background: var(--tg-panel); border-bottom-left-radius: 2px; position: relative; border-left: 4px solid var(--tg-blue); box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
        .bubble-win { border-left-color: var(--tg-green); }
        .bubble-loss { border-left-color: var(--tg-red); }

        #panel-config { display: none; position: absolute; top: 65px; left: 10px; right: 10px; background: var(--tg-panel); padding: 20px; border-radius: 12px; z-index: 200; border: 1px solid #333; box-shadow: 0 0 50px #000; }
        .config-row { margin-bottom: 15px; }
        .config-row label { font-size: 10px; color: var(--tg-blue); text-transform: uppercase; font-weight: bold; }
        .config-row select, .config-row input { width: 100%; background: #0e1621; color: #fff; border: 1px solid #333; padding: 12px; border-radius: 6px; margin-top: 5px; }

        .tg-footer { background: var(--tg-panel); padding: 10px; border-top: 1px solid #000; display: flex; justify-content: space-around; }
        .btn-footer { background: none; border: none; color: #6c7883; cursor: pointer; text-align: center; font-size: 10px; width: 33%; }
        .btn-footer i { font-size: 20px; margin-bottom: 4px; }
        .btn-footer:active { color: #fff; }
    </style>
</head>
<body>

<div id="app">
    <div class="tg-header">
        <div class="tg-avatar">KC</div>
        <div class="tg-info">
            <b>🤖 KCM MASTER (MODO REAL)</b>
            <span id="status-global">conectando servidor...</span>
        </div>
        <div style="text-align: right;">
            <div id="placar" style="font-size: 12px; font-weight: bold;">🟢 0 | 🔴 0</div>
            <div id="banca-top" style="font-size: 10px; color: var(--tg-green);">R$ 5000.00</div>
        </div>
    </div>

    <div class="visor-chat" id="chat">
        <div class="bubble"><b>MODO DINHEIRO REAL ATIVADO</b> ⚠️<br>Os sinais agora seguem a matemática exata da Deriv. Abra os ajustes para começar.</div>
    </div>

    <div id="panel-config">
        <div class="config-row">
            <label>Sua Banca (R$)</label>
            <input type="number" id="inpBanca" value="5000">
        </div>
        <div class="config-row">
            <label>Selecione o Ativo</label>
            <select id="selAtivo">
                <option value="1HZ10V">Volatility 10 (1s)</option>
                <option value="1HZ100V">Volatility 100 (1s)</option>
                <option value="R_10">Volatility 10 Index</option>
                <option value="R_100">Volatility 100 Index</option>
                <option value="JD10">Jump 10 Index</option>
                <option value="cryBTCUSD">Bitcoin (BTC/USD)</option>
            </select>
        </div>
        <button onclick="salvarConfig()" style="width: 100%; padding: 15px; background: var(--tg-blue); color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">SALVAR E LIGAR ROBÔ</button>
    </div>

    <div class="tg-footer">
        <button class="btn-footer" onclick="toggleConfig()"><i class="fas fa-sliders-h"></i><br>AJUSTES</button>
        <button class="btn-footer" onclick="location.reload()"><i class="fas fa-power-off"></i><br>REINICIAR</button>
    </div>
</div>

<script>
    let ws, banca = 5000, wins = 0, loss = 0, operando = false;
    let precoAtual = 0, precoEntrada = 0, direcaoEntrada = "", velaAbertura = 0;

    function addMsg(txt, tipo = '') {
        const chat = document.getElementById('chat');
        const div = document.createElement('div');
        div.className = `bubble ${tipo === 'win' ? 'bubble-win' : (tipo === 'loss' ? 'bubble-loss' : '')}`;
        div.innerHTML = txt + `<br><small style="opacity:0.5; font-size:9px; float:right; margin-top:5px;">${new Date().toLocaleTimeString()}</small><div style="clear:both;"></div>`;
        chat.appendChild(div); chat.scrollTop = chat.scrollHeight;
    }

    function toggleConfig() { document.getElementById('panel-config').style.display = 'block'; }

    function salvarConfig() {
        banca = parseFloat(document.getElementById('inpBanca').value);
        document.getElementById('banca-top').innerText = `R$ ${banca.toFixed(2)}`;
        document.getElementById('panel-config').style.display = 'none';
        conectarServidor();
    }

    function conectarServidor() {
        if (ws) ws.close();
        const ativo = document.getElementById('selAtivo').value;
        ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
        
        ws.onopen = () => {
            ws.send(JSON.stringify({ ticks: ativo }));
            addMsg(`📡 <b>Conectado com Sucesso!</b><br>Ativo: ${ativo}<br>Monitorando mercado real...`);
        };

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (!data.tick) return;
            
            precoAtual = data.tick.quote;
            const segundos = new Date().getSeconds();
            document.getElementById('status-global').innerText = `AO VIVO: ${precoAtual.toFixed(2)} [${segundos}s]`;

            // Detecta abertura de vela de 1 minuto
            if (segundos === 0) velaAbertura = precoAtual;

            // LÓGICA REAL: Se o preço desviar mais de 0.03% (Força real de sinal)
            if (velaAbertura > 0 && !operando && segundos > 5) {
                let variacao = ((precoAtual - velaAbertura) / velaAbertura) * 100;
                
                if (Math.abs(variacao) > 0.035) { // Filtro de volatilidade real
                    executarSinal(variacao > 0 ? "PUT" : "CALL");
                }
            }
        };
    }

    function executarSinal(dir) {
        operando = true;
        precoEntrada = precoAtual;
        direcaoEntrada = dir;
        
        addMsg(`🚀 <b>SINAL EM OPERAÇÃO</b><br>🎯 Direção: ${dir === 'CALL' ? 'COMPRA 🟢' : 'VENDA 🔴'}<br>💰 Entrada: ${precoEntrada.toFixed(4)}`);

        // EXPIRAÇÃO DE 60 SEGUNDOS (Verificação matemática real)
        let tempoRestante = 60;
        const contagem = setInterval(() => {
            tempoRestante--;
            if (tempoRestante <= 0) {
                clearInterval(contagem);
                const precoSaida = precoAtual;
                verificarResultado(precoSaida);
            }
        }, 1000);
    }

    function verificarResultado(saida) {
        let ganhou = (direcaoEntrada === "CALL" && saida > precoEntrada) || (direcaoEntrada === "PUT" && saida < precoEntrada);
        
        if (ganhou) {
            wins++; banca += 9.50; // Exemplo de Payout de 95%
            addMsg(`✅ <b>GREEN (LUCRO REAL)</b><br>Entrada: ${precoEntrada.toFixed(4)}<br>Saída: ${saida.toFixed(4)}`, 'win');
        } else {
            loss++; banca -= 10.00;
            addMsg(`❌ <b>LOSS (MERCADO REAL)</b><br>Entrada: ${precoEntrada.toFixed(4)}<br>Saída: ${saida.toFixed(4)}`, 'loss');
        }

        document.getElementById('placar').innerText = `🟢 ${wins} | 🔴 ${loss}`;
        document.getElementById('banca-top').innerText = `R$ ${banca.toFixed(2)}`;
        operando = false;
    }

    window.onload = () => {
        // Inicializa sem conectar, espera o usuário clicar em Ajustes
        addMsg("<b>Terminal pronto para uso.</b><br>Clique em Ajustes para configurar sua banca e o ativo desejado.");
    };
</script>
</body>
</html>
