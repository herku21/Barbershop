// referenciak.js

// Dinamikus referenciak.css betöltés, ha még nincs bent
(function(){
    const cssId = 'referenciak-css';
    if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'referenciak.css';
        document.head.appendChild(link);
    }
})();

// Galéria szekció betöltése
function loadReferenciaSection(container) {
    container.innerHTML = `
        <section>
            <h2><span>REFERENCIÁK</span></h2>
            <div class="referencia-galeria">
                <div class="referencia-thumb">
                    <img src="referenciak/david/ref_01.jpeg" alt="Referencia 1">
                </div>
                <div class="referencia-thumb">
                    <img src="referenciak/david/ref_02.jpeg" alt="Referencia 2">
                </div>
                <div class="referencia-thumb">
                    <img src="referenciak/david/ref_03.jpeg" alt="Referencia 3">
                </div>
                <div class="referencia-thumb">
                    <img src="referenciak/b5/frici_munka1.jpg" alt="Referencia 4">
                </div>
                <div class="referencia-thumb">
                    <img src="referenciak/b2/misi_munka1.jpg" alt="Referencia 5">
                </div>
                <div class="referencia-thumb">
                    <img src="referenciak/b6/vili_munka1.jpg" alt="Referencia 6">
                </div>
            </div>
            <p class="back-to-services-link-container" style="text-align:center; margin-top:20px;">
                <a href="#" class="vissza-link-belul" data-action="go-to-main-menu">Vissza a főmenühöz</a>
            </p>
        </section>
    `;

    // Vissza a főmenühöz link működés
    const backLink = container.querySelector('.vissza-link-belul');
    if (backLink) {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof visszaGomb !== "undefined" && visszaGomb) {
                visszaGomb.click();
            }
        });
    }
}