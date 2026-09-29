// ==========================================
// FIREBASE
// ==========================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// CONFIGURAÇÃO FIREBASE
// ==========================================

const firebaseConfig = {

    apiKey: "SUA_API_KEY",

    authDomain: "spotnick-17492.firebaseapp.com",

    projectId: "spotnick-17492",

    storageBucket: "spotnick-17492.firebasestorage.app",

    messagingSenderId: "403990405276",

    appId: "1:403990405276:web:69307737bdd01dc23f4d59"
};


// ==========================================
// INICIANDO FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ==========================================
// ELEMENTOS HTML
// ==========================================

const nome = document.getElementById("nome");

const estilo = document.getElementById("estilo");

const duracao = document.getElementById("duracao");

const imagem = document.getElementById("imagem");

const audio = document.getElementById("audio");

const adicionar = document.getElementById("adicionar");

const listaMusicas = document.getElementById("listaMusicas");


// ==========================================
// CREATE
// ==========================================

adicionar.addEventListener("click", async function () {

    // Criamos o objeto da música

    const musica = {

        nome: nome.value,

        estilo: estilo.value,

        duracao: duracao.value,

        imagem: imagem.value,

        audio: audio.value
    };


    // Mandamos o objeto para o Firestore

    await addDoc(
        collection(db, "musicas"),
        musica
    );


    alert("Música adicionada!");

    
    // Limpamos os campos

    nome.value = "";

    estilo.value = "";

    duracao.value = "";

    imagem.value = "";

    audio.value = "";


    // Atualiza a lista

    carregarMusicas();

});


// ==========================================
// READ
// ==========================================

async function carregarMusicas() {

    // Busca a coleção "musicas"

    const resultado = await getDocs(
        collection(db, "musicas")
    );


    // Limpa a tela antes de mostrar novamente

    listaMusicas.innerHTML = "";


    // Percorre todas as músicas

    resultado.forEach(function (documento) {

        // Pegamos os dados do documento

        const musica = documento.data();


        // Criamos o card

        const card = document.createElement("div");

        card.classList.add("musica");


        // Colocamos o conteúdo dentro do card

        card.innerHTML = `

            <img
                src="${musica.imagem}"
                alt="Capa da música"
            >

            <h3>${musica.nome}</h3>

            <p>${musica.estilo}</p>

            <p>${musica.duracao}</p>

            <audio
                controls
                src="${musica.audio}"
            ></audio>

        `;


        // Coloca o card na página

        listaMusicas.appendChild(card);

    });

}


// ==========================================
// CARREGAR AO ABRIR A PÁGINA
// ==========================================

carregarMusicas();