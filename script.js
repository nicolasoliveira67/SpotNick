// ========================================
// FIREBASE APP
// ========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getDatabase,
    ref,
    set,
    push,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// ========================================
// CONFIGURAÇÃO DO FIREBASE
// ========================================

const firebaseConfig = {

    apiKey: "SUA_API_KEY",

    authDomain:
        "spotnick-17492.firebaseapp.com",

    projectId:
        "spotnick-17492",

    storageBucket:
        "spotnick-17492.firebasestorage.app",

    messagingSenderId:
        "403990405276",

    appId:
        "1:403990405276:web:69307737bdd01dc23f4d59",

    databaseURL:
        "https://spotnick-17492-default-rtdb.firebaseio.com"
};


// ========================================
// INICIALIZAR FIREBASE
// ========================================

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

const database =
    getDatabase(app);


// ========================================
// ELEMENTOS HTML
// ========================================

const nome =
    document.getElementById("nome");

const estilo =
    document.getElementById("estilo");

const duracao =
    document.getElementById("duracao");

const imagem =
    document.getElementById("imagem");

const audio =
    document.getElementById("audio");

const adicionar =
    document.getElementById("adicionar");

const listaMusicas =
    document.getElementById("listaMusicas");

const listaAlbuns =
    document.getElementById("listaAlbuns");

const listaFavoritos =
    document.getElementById("listaFavoritos");

const pesquisa =
    document.getElementById("pesquisa");

const filtroEstilo =
    document.getElementById("filtroEstilo");


// ========================================
// VARIÁVEIS
// ========================================

let todasMusicas = [];

let musicaAtual = null;

let audioPlayer = new Audio();


// ========================================
// BOTÃO PLAY / PAUSE
// ========================================

const playerPlay =
    document.getElementById("playerPlay");


// ========================================
// CONVERTER ARQUIVO PARA BASE64
// ========================================

function arquivoParaBase64(arquivo) {

    return new Promise(
        (resolve, reject) => {

            const leitor =
                new FileReader();


            leitor.onload = () => {

                const base64 =
                    leitor.result.split(",")[1];

                resolve(base64);
            };


            leitor.onerror = () => {

                reject(
                    new Error(
                        "Erro ao ler o arquivo."
                    )
                );
            };


            leitor.readAsDataURL(arquivo);

        }
    );
}


// ========================================
// DIVIDIR BASE64
// ========================================

function dividirEmPartes(base64) {

    const tamanhoParte =
        700000;

    const partes = [];


    for (
        let i = 0;
        i < base64.length;
        i += tamanhoParte
    ) {

        partes.push(
            base64.slice(
                i,
                i + tamanhoParte
            )
        );
    }


    return partes;
}


// ========================================
// SALVAR ÁUDIO
// ========================================

async function salvarAudio(arquivo) {

    console.log(
        "Transformando áudio em Base64..."
    );


    const base64 =
        await arquivoParaBase64(
            arquivo
        );


    const partes =
        dividirEmPartes(
            base64
        );


    const referenciaAudio =
        push(
            ref(
                database,
                "audios"
            )
        );


    const audioId =
        referenciaAudio.key;


    await set(
        ref(
            database,
            `audios/${audioId}/info`
        ),
        {

            nome:
                arquivo.name,

            tipo:
                arquivo.type,

            tamanho:
                arquivo.size,

            quantidadePartes:
                partes.length
        }
    );


    for (
        let i = 0;
        i < partes.length;
        i++
    ) {

        console.log(
            `Salvando parte ${i + 1} de ${partes.length}`
        );


        await set(
            ref(
                database,
                `audios/${audioId}/partes/${i}`
            ),
            partes[i]
        );
    }


    console.log(
        "Áudio salvo com sucesso!"
    );


    return audioId;
}


// ========================================
// CARREGAR ÁUDIO
// ========================================

async function carregarAudio(
    audioId,
    tipoAudio
) {

    const referencia =
        ref(
            database,
            `audios/${audioId}/partes`
        );


    const resultado =
        await get(
            referencia
        );


    if (!resultado.exists()) {

        throw new Error(
            "Áudio não encontrado."
        );
    }


    const partes =
        resultado.val();


    const indices =
        Object.keys(partes)
            .sort(
                (a, b) =>
                    Number(a) - Number(b)
            );


    let base64Completa = "";


    for (
        const indice of indices
    ) {

        base64Completa +=
            partes[indice];
    }


    const dados =
        atob(
            base64Completa
        );


    const bytes =
        new Uint8Array(
            dados.length
        );


    for (
        let i = 0;
        i < dados.length;
        i++
    ) {

        bytes[i] =
            dados.charCodeAt(i);
    }


    const blob =
        new Blob(
            [bytes],
            {
                type: tipoAudio
            }
        );


    return URL.createObjectURL(
        blob
    );
}


// ========================================
// CADASTRAR MÚSICA
// ========================================

adicionar.addEventListener(
    "click",
    async function () {

        try {

            const nomeMusica =
                nome.value.trim();


            const estiloMusica =
                estilo.value.trim();


            const duracaoMusica =
                duracao.value.trim();


            const urlImagem =
                imagem.value.trim();


            const arquivoAudio =
                audio.files[0];


            if (
                nomeMusica === "" ||
                estiloMusica === "" ||
                duracaoMusica === "" ||
                urlImagem === "" ||
                !arquivoAudio
            ) {

                alert(
                    "Preencha todos os campos."
                );

                return;
            }


            if (
                !arquivoAudio.type.startsWith(
                    "audio/"
                )
            ) {

                alert(
                    "Selecione um arquivo de áudio."
                );

                return;
            }


            adicionar.disabled =
                true;


            adicionar.textContent =
                "Enviando...";


            const audioId =
                await salvarAudio(
                    arquivoAudio
                );


            const musica = {

                nome:
                    nomeMusica,

                estilo:
                    estiloMusica,

                duracao:
                    duracaoMusica,

                imagem:
                    urlImagem,

                audioId:
                    audioId,

                nomeArquivo:
                    arquivoAudio.name,

                tipoAudio:
                    arquivoAudio.type,

                favorito:
                    false,

                criadoEm:
                    Date.now()
            };


            await addDoc(
                collection(
                    db,
                    "musicas"
                ),
                musica
            );


            alert(
                "Música cadastrada com sucesso!"
            );


            nome.value = "";

            estilo.value = "";

            duracao.value = "";

            imagem.value = "";

            audio.value = "";


            await carregarMusicas();

        }

        catch (erro) {

            console.error(
                "Erro:",
                erro
            );


            alert(
                "Erro ao cadastrar música."
            );

        }

        finally {

            adicionar.disabled =
                false;


            adicionar.textContent =
                "➕ Adicionar música";
        }
    }
);


// ========================================
// CARREGAR MÚSICAS
// ========================================

async function carregarMusicas() {

    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "musicas"
                )
            );


        todasMusicas = [];


        resultado.forEach(
            documento => {

                todasMusicas.push({

                    id:
                        documento.id,

                    ...documento.data()

                });
            }
        );


        criarFiltros();


        mostrarMusicas(
            todasMusicas
        );


        mostrarFavoritos(
            todasMusicas
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar músicas:",
            erro
        );
    }
}


// ========================================
// CRIAR FILTROS
// ========================================

function criarFiltros() {

    const estilos =
        [
            ...new Set(
                todasMusicas.map(
                    musica =>
                        musica.estilo
                )
            )
        ];


    filtroEstilo.innerHTML = "";


    const todos =
        document.createElement(
            "option"
        );


    todos.value =
        "todos";


    todos.textContent =
        "Todos os estilos";


    filtroEstilo.appendChild(
        todos
    );


    estilos.forEach(
        estiloMusical => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                estiloMusical.toLowerCase();


            option.textContent =
                estiloMusical;


            filtroEstilo.appendChild(
                option
            );
        }
    );
}


// ========================================
// MOSTRAR MÚSICAS
// ========================================

async function mostrarMusicas(
    musicas
) {

    listaMusicas.innerHTML =
        "";


    if (
        musicas.length === 0
    ) {

        listaMusicas.innerHTML =
            "<p>Nenhuma música encontrada.</p>";

        return;
    }


    for (
        const musica of musicas
    ) {

        const card =
            await criarCardMusica(
                musica
            );


        listaMusicas.appendChild(
            card
        );
    }
}


// ========================================
// CRIAR CARD DA MÚSICA
// ========================================

async function criarCardMusica(
    musica
) {

    const card =
        document.createElement(
            "div"
        );


    card.classList.add(
        "musica"
    );


    // ====================================
    // CAPA
    // ====================================

    const capa =
        document.createElement(
            "img"
        );


    capa.src =
        musica.imagem;


    capa.alt =
        musica.nome;


    // ====================================
    // TÍTULO
    // ====================================

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        musica.nome;


    // ====================================
    // GÊNERO
    // ====================================

    const genero =
        document.createElement(
            "p"
        );


    genero.textContent =
        "Estilo: " +
        musica.estilo;


    // ====================================
    // DURAÇÃO
    // ====================================

    const tempo =
        document.createElement(
            "p"
        );


    tempo.textContent =
        "Duração: " +
        musica.duracao;


    // ====================================
    // ÁUDIO
    // ====================================

    let urlAudio = null;


    try {

        urlAudio =
            await carregarAudio(
                musica.audioId,
                musica.tipoAudio
            );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar áudio:",
            erro
        );
    }


    // ====================================
    // BOTÕES
    // ====================================

    const acoes =
        document.createElement(
            "div"
        );


    acoes.classList.add(
        "acoes-musica"
    );


    // ====================================
    // FAVORITO
    // ====================================

    const favorito =
        document.createElement(
            "button"
        );


    favorito.classList.add(
        "favoritar"
    );


    favorito.textContent =
        musica.favorito
            ? "❤️"
            : "♡";


    favorito.addEventListener(
        "click",
        () => {

            alternarFavorito(
                musica
            );
        }
    );


    // ====================================
    // EDITAR
    // ====================================

    const editar =
        document.createElement(
            "button"
        );


    editar.textContent =
        "✏️ Editar";


    editar.addEventListener(
        "click",
        () => {

            editarMusica(
                musica
            );
        }
    );


    // ====================================
    // EXCLUIR
    // ====================================

    const excluir =
        document.createElement(
            "button"
        );


    excluir.textContent =
        "🗑️ Excluir";


    excluir.addEventListener(
        "click",
        () => {

            excluirMusica(
                musica
            );
        }
    );


    // ====================================
    // SELECIONAR
    // ====================================

    const checkbox =
        document.createElement(
            "input"
        );


    checkbox.type =
        "checkbox";


    checkbox.classList.add(
        "selecionar-musica"
    );


    checkbox.dataset.id =
        musica.id;


    // ====================================
    // CLICAR NA CAPA PARA TOCAR
    // ====================================

    capa.style.cursor =
        "pointer";


    capa.addEventListener(
        "click",
        () => {

            if (!urlAudio) {

                alert(
                    "Não foi possível carregar o áudio."
                );

                return;
            }


            tocarNoPlayerPrincipal(
                musica,
                urlAudio
            );
        }
    );


    // ====================================
    // CLICAR NO TÍTULO PARA TOCAR
    // ====================================

    titulo.style.cursor =
        "pointer";


    titulo.addEventListener(
        "click",
        () => {

            if (!urlAudio) {

                alert(
                    "Não foi possível carregar o áudio."
                );

                return;
            }


            tocarNoPlayerPrincipal(
                musica,
                urlAudio
            );
        }
    );


    // ====================================
    // MONTAR AÇÕES
    // ====================================

    acoes.appendChild(
        favorito
    );


    acoes.appendChild(
        editar
    );


    acoes.appendChild(
        excluir
    );


    // ====================================
    // MONTAR CARD
    // ====================================

    card.appendChild(
        capa
    );


    card.appendChild(
        titulo
    );


    card.appendChild(
        genero
    );


    card.appendChild(
        checkbox
    );


    card.appendChild(
        tempo
    );


    card.appendChild(
        acoes
    );


    return card;
}


// ========================================
// PESQUISA
// ========================================

pesquisa.addEventListener(
    "input",
    aplicarFiltros
);


// ========================================
// FILTRO
// ========================================

filtroEstilo.addEventListener(
    "change",
    aplicarFiltros
);


// ========================================
// APLICAR PESQUISA + FILTRO
// ========================================

function aplicarFiltros() {

    const texto =
        pesquisa.value
            .toLowerCase()
            .trim();


    const estiloSelecionado =
        filtroEstilo.value;


    const resultado =
        todasMusicas.filter(
            musica => {

                const correspondeNome =
                    musica.nome
                        .toLowerCase()
                        .includes(
                            texto
                        );


                const correspondeEstilo =
                    estiloSelecionado ===
                        "todos"
                    ||
                    musica.estilo
                        .toLowerCase()
                        ===
                        estiloSelecionado;


                return (
                    correspondeNome &&
                    correspondeEstilo
                );
            }
        );


    mostrarMusicas(
        resultado
    );
}


// ========================================
// EDITAR MÚSICA
// ========================================

async function editarMusica(
    musica
) {

    const novoNome =
        prompt(
            "Nome da música:",
            musica.nome
        );


    if (
        novoNome === null
    ) {
        return;
    }


    const novoEstilo =
        prompt(
            "Estilo musical:",
            musica.estilo
        );


    if (
        novoEstilo === null
    ) {
        return;
    }


    const novaDuracao =
        prompt(
            "Duração:",
            musica.duracao
        );


    if (
        novaDuracao === null
    ) {
        return;
    }


    const referencia =
        doc(
            db,
            "musicas",
            musica.id
        );


    await updateDoc(
        referencia,
        {

            nome:
                novoNome,

            estilo:
                novoEstilo,

            duracao:
                novaDuracao
        }
    );


    alert(
        "Música atualizada!"
    );


    await carregarMusicas();
}


// ========================================
// EXCLUIR MÚSICA
// ========================================

async function excluirMusica(
    musica
) {

    const confirmar =
        confirm(
            `Deseja excluir "${musica.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "musicas",
                musica.id
            )
        );


        if (musica.audioId) {

            await remove(
                ref(
                    database,
                    `audios/${musica.audioId}`
                )
            );
        }


        alert(
            "Música excluída!"
        );


        await carregarMusicas();

    }

    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao excluir música."
        );
    }
}


// ========================================
// FAVORITOS
// ========================================

async function alternarFavorito(
    musica
) {

    const novoEstado =
        !musica.favorito;


    await updateDoc(
        doc(
            db,
            "musicas",
            musica.id
        ),
        {

            favorito:
                novoEstado
        }
    );


    await carregarMusicas();
}


// ========================================
// MOSTRAR FAVORITOS
// ========================================

async function mostrarFavoritos(
    musicas
) {

    listaFavoritos.innerHTML =
        "";


    const favoritos =
        musicas.filter(
            musica =>
                musica.favorito === true
        );


    if (
        favoritos.length === 0
    ) {

        listaFavoritos.innerHTML =
            "<p>Você ainda não possui favoritos.</p>";

        return;
    }


    for (
        const musica of favoritos
    ) {

        const card =
            await criarCardMusica(
                musica
            );


        listaFavoritos.appendChild(
            card
        );
    }
}


// ========================================
// ÁLBUNS
// ========================================

const modalAlbum =
    document.getElementById(
        "modalAlbum"
    );


const abrirCriarAlbum =
    document.getElementById(
        "abrirCriarAlbum"
    );


const abrirCriarAlbum2 =
    document.getElementById(
        "abrirCriarAlbum2"
    );


const fecharModal =
    document.getElementById(
        "fecharModal"
    );


const criarAlbum =
    document.getElementById(
        "criarAlbum"
    );


const nomeAlbum =
    document.getElementById(
        "nomeAlbum"
    );


const imagemAlbum =
    document.getElementById(
        "imagemAlbum"
    );


// ========================================
// ABRIR MODAL
// ========================================

function abrirModalAlbum() {

    modalAlbum.classList.add(
        "aberto"
    );
}


abrirCriarAlbum.addEventListener(
    "click",
    abrirModalAlbum
);


abrirCriarAlbum2.addEventListener(
    "click",
    abrirModalAlbum
);


// ========================================
// FECHAR MODAL
// ========================================

fecharModal.addEventListener(
    "click",
    () => {

        modalAlbum.classList.remove(
            "aberto"
        );
    }
);


// ========================================
// CRIAR ÁLBUM
// ========================================

criarAlbum.addEventListener(
    "click",
    async function () {

        const nome =
            nomeAlbum.value.trim();


        const imagem =
            imagemAlbum.value.trim();


        if (
            nome === "" ||
            imagem === ""
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;
        }


        try {

            await addDoc(
                collection(
                    db,
                    "albuns"
                ),
                {

                    nome:
                        nome,

                    imagem:
                        imagem,

                    musicas:
                        [],

                    criadoEm:
                        Date.now()
                }
            );


            alert(
                "Álbum criado com sucesso!"
            );


            nomeAlbum.value =
                "";


            imagemAlbum.value =
                "";


            modalAlbum.classList.remove(
                "aberto"
            );


            carregarAlbuns();

        }

        catch (erro) {

            console.error(
                erro
            );


            alert(
                "Erro ao criar álbum."
            );
        }
    }
);


// ========================================
// CARREGAR ÁLBUNS
// ========================================

async function carregarAlbuns() {

    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "albuns"
                )
            );


        listaAlbuns.innerHTML =
            "";


        if (
            resultado.empty
        ) {

            listaAlbuns.innerHTML =
                "<p>Nenhum álbum criado ainda.</p>";

            return;
        }


        resultado.forEach(
            documento => {

                const album =
                    documento.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.classList.add(
                    "album"
                );


                const capa =
                    document.createElement(
                        "img"
                    );


                capa.src =
                    album.imagem;


                capa.alt =
                    album.nome;


                const titulo =
                    document.createElement(
                        "h3"
                    );


                titulo.textContent =
                    album.nome;


                const quantidade =
                    document.createElement(
                        "p"
                    );


                quantidade.textContent =
                    `${album.musicas?.length || 0} músicas`;


                const acoes =
                    document.createElement(
                        "div"
                    );


                acoes.classList.add(
                    "acoes-album"
                );


                const adicionarMusica =
                    document.createElement(
                        "button"
                    );


                adicionarMusica.textContent =
                    "➕ Música";


                adicionarMusica.addEventListener(
                    "click",
                    () => {

                        adicionarMusicaAlbum(
                            documento.id,
                            album
                        );
                    }
                );


                const excluir =
                    document.createElement(
                        "button"
                    );


                excluir.textContent =
                    "🗑️ Excluir";


                excluir.addEventListener(
                    "click",
                    () => {

                        excluirAlbum(
                            documento.id,
                            album.nome
                        );
                    }
                );


                acoes.appendChild(
                    adicionarMusica
                );


                acoes.appendChild(
                    excluir
                );


                card.appendChild(
                    capa
                );


                card.appendChild(
                    titulo
                );


                card.appendChild(
                    quantidade
                );


                card.appendChild(
                    acoes
                );


                listaAlbuns.appendChild(
                    card
                );
            }
        );

    }

    catch (erro) {

        console.error(
            erro
        );
    }
}


// ========================================
// ADICIONAR MÚSICA AO ÁLBUM
// ========================================

async function adicionarMusicaAlbum(
    albumId,
    album
) {

    if (
        todasMusicas.length === 0
    ) {

        alert(
            "Cadastre uma música primeiro."
        );

        return;
    }


    let lista =
        "";


    todasMusicas.forEach(
        (musica, index) => {

            lista +=
                `${index + 1} - ${musica.nome}\n`;
        }
    );


    const escolha =
        prompt(
            `Escolha uma música:\n\n${lista}`
        );


    const numero =
        Number(
            escolha
        );


    if (
        !numero ||
        numero < 1 ||
        numero > todasMusicas.length
    ) {

        alert(
            "Escolha inválida."
        );

        return;
    }


    const musicaEscolhida =
        todasMusicas[
            numero - 1
        ];


    const musicasDoAlbum =
        album.musicas || [];


    if (
        musicasDoAlbum.includes(
            musicaEscolhida.id
        )
    ) {

        alert(
            "Essa música já está no álbum."
        );

        return;
    }


    musicasDoAlbum.push(
        musicaEscolhida.id
    );


    await updateDoc(
        doc(
            db,
            "albuns",
            albumId
        ),
        {

            musicas:
                musicasDoAlbum
        }
    );


    alert(
        "Música adicionada ao álbum!"
    );


    carregarAlbuns();
}


// ========================================
// EXCLUIR ÁLBUM
// ========================================

async function excluirAlbum(
    id,
    nome
) {

    const confirmar =
        confirm(
            `Excluir o álbum "${nome}"?`
        );


    if (!confirmar) {
        return;
    }


    await deleteDoc(
        doc(
            db,
            "albuns",
            id
        )
    );


    alert(
        "Álbum excluído!"
    );


    carregarAlbuns();
}


// ========================================
// PLAYER PRINCIPAL
// ========================================

function tocarNoPlayerPrincipal(
    musica,
    urlAudio
) {

    musicaAtual =
        musica;


    audioPlayer.src =
        urlAudio;


    const playerNome =
        document.getElementById(
            "playerNome"
        );


    const playerEstilo =
        document.getElementById(
            "playerEstilo"
        );


    const playerImagem =
        document.getElementById(
            "playerImagem"
        );


    playerNome.textContent =
        musica.nome;


    playerEstilo.textContent =
        musica.estilo;


    playerImagem.src =
        musica.imagem;


    audioPlayer.play();


    playerPlay.textContent =
        "⏸";
}


// ========================================
// PLAY / PAUSE
// ========================================

playerPlay.addEventListener(
    "click",
    () => {

        if (
            !musicaAtual
        ) {

            alert(
                "Escolha uma música primeiro."
            );

            return;
        }


        if (
            audioPlayer.paused
        ) {

            audioPlayer.play();


            playerPlay.textContent =
                "⏸";

        }

        else {

            audioPlayer.pause();


            playerPlay.textContent =
                "▶";
        }
    }
);


// ========================================
// QUANDO A MÚSICA TERMINAR
// ========================================

audioPlayer.addEventListener(
    "ended",
    () => {

        playerPlay.textContent =
            "▶";
    }
);


// ========================================
// MENU LATERAL
// ========================================

const botoesMenu =
    document.querySelectorAll(
        ".sidebar nav button[data-secao]"
    );


botoesMenu.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                const id =
                    botao.dataset.secao;


                const secao =
                    document.getElementById(
                        id
                    );


                if (secao) {

                    secao.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        );
    }
);


// ========================================
// EXCLUIR MÚSICAS SELECIONADAS
// ========================================

const excluirSelecionadas =
    document.getElementById(
        "excluirSelecionadas"
    );


excluirSelecionadas.addEventListener(
    "click",
    async function () {

        const selecionadas =
            document.querySelectorAll(
                ".selecionar-musica:checked"
            );


        if (
            selecionadas.length === 0
        ) {

            alert(
                "Selecione pelo menos uma música."
            );

            return;
        }


        const confirmar =
            confirm(
                `Deseja excluir ${selecionadas.length} música(s)?`
            );


        if (!confirmar) {
            return;
        }


        try {

            for (
                const checkbox of selecionadas
            ) {

                const id =
                    checkbox.dataset.id;


                const musica =
                    todasMusicas.find(
                        musica =>
                            musica.id === id
                    );


                if (!musica) {
                    continue;
                }


                await deleteDoc(
                    doc(
                        db,
                        "musicas",
                        musica.id
                    )
                );


                if (
                    musica.audioId
                ) {

                    await remove(
                        ref(
                            database,
                            `audios/${musica.audioId}`
                        )
                    );
                }
            }


            alert(
                "Músicas excluídas com sucesso!"
            );


            await carregarMusicas();

        }

        catch (erro) {

            console.error(
                "Erro ao excluir músicas:",
                erro
            );


            alert(
                "Erro ao excluir as músicas."
            );
        }
    }
);


// ========================================
// INICIALIZAR
// ========================================

carregarMusicas();

carregarAlbuns();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
        .then(() => {
            console.log("Service Worker registrado com sucesso!");
        })
        .catch((erro) => {
            console.log("Erro ao registrar o Service Worker:", erro);
        });
}