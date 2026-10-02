// Minha chave da OpenWeather
const API_KEY = "bd2d559f8a825063f1b0450e64a744ea";

// Pegando os elementos do HTML
const campoCidade = document.getElementById("cidade");
const botaoBuscar = document.getElementById("btnBuscar");

const nomeCidade = document.getElementById("nomeCidade");
const temperatura = document.getElementById("temperatura");
const descricao = document.getElementById("descricao");
const iconeClima = document.getElementById("iconeClima");
const umidade = document.getElementById("umidade");
const vento = document.getElementById("vento");
const mensagemErro = document.getElementById("mensagemErro");


// Função que pesquisa o clima
async function buscarClima() {

    const cidade = campoCidade.value.trim();

    if (cidade === "") {
        mensagemErro.textContent = "Digite o nome de uma cidade.";
        return;
    }

    mensagemErro.textContent = "Buscando...";

    // Montando o endereço da API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${API_KEY}&units=metric&lang=pt_br`;

    console.log("Consultando API:", url);


    try {

        // Fazendo a requisição
        const resposta = await fetch(url);

        console.log("Status da resposta:", resposta.status);

        // Transformando a resposta em JSON
        const dados = await resposta.json();

        console.log("Dados recebidos:", dados);


        // Se a API retornar algum erro
        if (!resposta.ok) {

            if (resposta.status === 401) {
                throw new Error("API_KEY_INVALIDA");
            }

            if (resposta.status === 404) {
                throw new Error("CIDADE_NAO_ENCONTRADA");
            }

            throw new Error("ERRO_API");
        }


        // Atualizando as informações na tela
        nomeCidade.textContent = `${dados.name}, ${dados.sys.country}`;

        temperatura.textContent = `${Math.round(dados.main.temp)}°C`;

        descricao.textContent = dados.weather[0].description;

        umidade.textContent = `${dados.main.humidity}%`;

        vento.textContent = `${dados.wind.speed} m/s`;


        // Pegando o código do ícone fornecido pela API
        const codigoIcone = dados.weather[0].icon;

        iconeClima.src =
            `https://openweathermap.org/img/wn/${codigoIcone}@2x.png`;

        iconeClima.alt = dados.weather[0].description;

        // Apaga a mensagem "Buscando..."
        mensagemErro.textContent = "";


    } catch (erro) {

        console.error("Erro:", erro);


        if (erro.message === "API_KEY_INVALIDA") {

            mensagemErro.textContent =
                "A chave da API é inválida ou ainda não foi ativada.";

        } else if (erro.message === "CIDADE_NAO_ENCONTRADA") {

            mensagemErro.textContent =
                "Cidade não encontrada. Verifique o nome digitado.";

        } else {

            mensagemErro.textContent =
                "Não foi possível consultar o clima.";

        }
    }
}


// Clique no botão
botaoBuscar.addEventListener("click", buscarClima);


// Também pode apertar Enter para pesquisar
campoCidade.addEventListener("keydown", function(evento) {

    if (evento.key === "Enter") {
        buscarClima();
    }

});

const traducoes = {
    "pt": {
        titulo: "WeatherView",
        subtitulo: "Consulte o clima de qualquer cidade",
        placeholder: "Digite uma cidade...",
        buscar: "🔍 Buscar",
        umidade: "Umidade",
        vento: "Vento",
        pesquisar: "Pesquise uma cidade"
    },

    "en": {
        titulo: "WeatherView",
        subtitulo: "Check the weather in any city",
        placeholder: "Enter a city...",
        buscar: "🔍 Search",
        umidade: "Humidity",
        vento: "Wind",
        pesquisar: "Search for a city"
    },

    "es": {
        titulo: "WeatherView",
        subtitulo: "Consulta el clima de cualquier ciudad",
        placeholder: "Escribe una ciudad...",
        buscar: "🔍 Buscar",
        umidade: "Humedad",
        vento: "Viento",
        pesquisar: "Busca una ciudad"
    },

    "de": {
        titulo: "WeatherView",
        subtitulo: "Überprüfe das Wetter in jeder Stadt",
        placeholder: "Stadt eingeben...",
        buscar: "🔍 Suchen",
        umidade: "Luftfeuchtigkeit",
        vento: "Wind",
        pesquisar: "Suche eine Stadt"
    },

    "fr": {
        titulo: "WeatherView",
        subtitulo: "Consultez la météo de n'importe quelle ville",
        placeholder: "Entrez une ville...",
        buscar: "🔍 Rechercher",
        umidade: "Humidité",
        vento: "Vent",
        pesquisar: "Rechercher une ville"
    }
};

// Pega o idioma configurado no navegador
const idiomaNavegador = navigator.language;

// Pega só as duas primeiras letras
const idioma = idiomaNavegador.substring(0, 2);

// Se o idioma existir nas traduções, usa ele.
// Caso contrário, usa português.
const traducao = traducoes[idioma] || traducoes["pt"];

document.querySelector("header h1").textContent = traducao.titulo;
document.querySelector("header p").textContent = traducao.subtitulo;

campoCidade.placeholder = traducao.placeholder;
botaoBuscar.textContent = traducao.buscar;

document.querySelectorAll(".info small")[0].textContent = traducao.umidade;
document.querySelectorAll(".info small")[1].textContent = traducao.vento;

nomeCidade.textContent = traducao.pesquisar;

const sugestoes = document.getElementById("sugestoes");

// Controla qual foi a última busca de sugestões disparada.
// Isso evita que uma resposta antiga (que demorou mais para chegar)
// sobrescreva a lista com cidades que não têm mais nada a ver com
// o que está escrito no campo agora.
let idBuscaSugestoes = 0;

// Procura cidades parecidas com o que o usuário digitou
async function buscarSugestoes() {

    const texto = campoCidade.value.trim();

    // Cada chamada recebe um número novo. Só a mais recente
    // pode atualizar a lista de sugestões na tela.
    const idDestaBusca = ++idBuscaSugestoes;

    // Se tiver poucas letras, não faz a pesquisa
    if (texto.length < 2) {
        sugestoes.innerHTML = "";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(texto)}&limit=5&appid=${API_KEY}`;

    try {

        const resposta = await fetch(url);
        const cidades = await resposta.json();

        // Se o usuário já digitou mais coisa e outra busca foi
        // disparada enquanto esta ainda estava em andamento,
        // esta resposta está desatualizada: ignora.
        if (idDestaBusca !== idBuscaSugestoes) {
            return;
        }

        // Se a API retornou erro (ex: chave inválida), o resultado
        // não é uma lista de cidades — não tenta continuar.
        if (!resposta.ok || !Array.isArray(cidades)) {
            sugestoes.innerHTML = "";
            return;
        }

        sugestoes.innerHTML = "";

        cidades.forEach(function(cidade) {

            const item = document.createElement("div");

            item.classList.add("sugestao");

            // Monta o nome que vai aparecer na lista
            let textoCidade = cidade.name;

            if (cidade.state) {
                textoCidade += ` - ${cidade.state}`;
            }

            textoCidade += `, ${cidade.country}`;

            item.textContent = textoCidade;

            // Quando o usuário clicar na cidade
            item.addEventListener("click", function() {

                // Guarda o nome completo (com estado/país) no campo,
                // assim se o usuário buscar de novo por texto, não cai
                // em outra cidade de mesmo nome.
                campoCidade.value = textoCidade;

                sugestoes.innerHTML = "";

                buscarClimaPorCoordenadas(
                    cidade.lat,
                    cidade.lon,
                    textoCidade
                );
            });

            sugestoes.appendChild(item);
        });

    } catch (erro) {

        console.error("Erro ao buscar sugestões:", erro);

    }
}

// Busca o clima usando latitude e longitude.
// "nomeExibicao" é o nome que o usuário viu e clicou na lista de
// sugestões (ex: "Jacaré - Rio de Janeiro, BR"). Usamos ele na tela
// porque a API de clima por coordenadas às vezes devolve o nome da
// estação de clima mais PRÓXIMA, que pode ser de outro bairro/cidade
// quando o local buscado é pequeno e não tem estação própria.
async function buscarClimaPorCoordenadas(lat, lon, nomeExibicao) {

    mensagemErro.textContent = "Buscando...";

    const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

    console.log("Coordenadas clicadas -> lat:", lat, "lon:", lon);
    console.log("Consultando API (coordenadas):", url);

    try {

        const resposta = await fetch(url);

        const dados = await resposta.json();

        console.log("Dados recebidos (coordenadas):", dados);

        if (!resposta.ok) {
            throw new Error("ERRO_API");
        }

        nomeCidade.textContent =
            nomeExibicao || `${dados.name}, ${dados.sys.country}`;

        temperatura.textContent =
            `${Math.round(dados.main.temp)}°C`;

        descricao.textContent =
            dados.weather[0].description;

        umidade.textContent =
            `${dados.main.humidity}%`;

        vento.textContent =
            `${dados.wind.speed} m/s`;

        const codigoIcone =
            dados.weather[0].icon;

        iconeClima.src =
            `https://openweathermap.org/img/wn/${codigoIcone}@2x.png`;

        iconeClima.alt =
            dados.weather[0].description;

        mensagemErro.textContent = "";

    } catch (erro) {

        console.error(erro);

        mensagemErro.textContent =
            "Não foi possível consultar o clima.";
    }
}

// Guarda o temporizador do debounce
let temporizadorSugestoes;

campoCidade.addEventListener("input", function() {

    // Cancela o temporizador anterior
    clearTimeout(temporizadorSugestoes);

    // Espera 400ms antes de pesquisar
    temporizadorSugestoes = setTimeout(function() {
        buscarSugestoes();
    }, 400);

});