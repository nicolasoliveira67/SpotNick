self.addEventListener("install", function () {
    console.log("Service Worker instalado!");
});

self.addEventListener("activate", function () {
    console.log("Service Worker ativado!");
});