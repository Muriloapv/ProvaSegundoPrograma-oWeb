const buttonFiltros = document.getElementById('nav-bar');
const filtroQuantidade = document.getElementById('filtro-quantidade');
const filtroTipo = document.getElementById('filtro-tipo');
const dateDe = document.getElementById('filtro-de');
const dateAte = document.getElementById('filtro-ate');
const inputBusca = document.getElementById('textBusca');

const paginacao = document.getElementById('paginacao-ul');

const modal = document.querySelector('dialog');
const buttonCloseDialog = document.getElementById('closeDialog');

buttonFiltros.onclick = function() {
    modal.showModal();
};

buttonCloseDialog.onclick = function() {
    modal.close();
};

async function logNoticias() {
    const endpoint = `https://servicodados.ibge.gov.br/api/v3/noticias${window.location.search}`;
    console.log(endpoint);
    try {
        const response = await fetch(endpoint);
        const noticias = await response.json();
        console.log(noticias);
        displayNoticias(noticias.items);
        addPages(noticias.totalPages, noticias.page);
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
    }
}

function filtros() {
    const url = new URL(window.location);
    inputBusca.value = url.searchParams.get('busca') ?? '';
    filtroTipo.value = url.searchParams.get('tipo') ?? '';
    filtroQuantidade.value = url.searchParams.get('qtd') ?? '10';
    dateDe.value = url.searchParams.get('de') ?? '';
    dateAte.value = url.searchParams.get('ate') ?? '';
    url.searchParams.set('qtd', filtroQuantidade.value);
    url.searchParams.set('page', url.searchParams.get('page') ?? '1');
    window.history.replaceState({}, '', url);  // Use replaceState em vez de pushState para inicializar a URL sem criar um novo histórico
}

function displayNoticias(noticias) {
    const novaNoticia = document.getElementById('noticias-ul');
    novaNoticia.innerHTML = ''; // Limpar lista de notícias

    noticias.forEach(noticia => {
        const noticias_li = document.createElement('li');
        noticias_li.classList.add('noticia-li');

        const noticiaImage = document.createElement('img');
        const urlImagem = JSON.parse(noticia.imagens).image_intro;
        noticiaImage.src = `https://agenciadenoticias.ibge.gov.br/${urlImagem}`;
        noticiaImage.alt = noticia.titulo;

        const divConteudo = document.createElement('div');
        divConteudo.classList.add('conteudo');

        const divConteudoSecundario = document.createElement('div');
        divConteudoSecundario.classList.add('subConteudo');

        const divEditora = document.createElement('div');
        divEditora.classList.add('editoras');

        const divPublic = document.createElement('div');
        divPublic.classList.add('public');

        const noticiaTitulo = document.createElement('h2');
        noticiaTitulo.textContent = noticia.titulo;

        const introducaoNoticia = document.createElement('p');
        introducaoNoticia.textContent = noticia.introducao;

        const dataPublicacao = document.createElement('p');
        dataPublicacao.innerHTML = `<strong>${noticia.data_publicacao.split(' ')[0]}</strong>`;

        const editorasAplicadas = document.createElement('p');
        editorasAplicadas.innerHTML = `<strong>#${noticia.editorias}</strong>`;

        const saibaMais = document.createElement('button');
        saibaMais.textContent = 'Saiba mais';
        saibaMais.onclick = () => window.open(noticia.link, '_blank');

        divPublic.appendChild(dataPublicacao);
        divEditora.appendChild(editorasAplicadas);

        divConteudoSecundario.appendChild(divEditora);
        divConteudoSecundario.appendChild(divPublic);

        divConteudo.appendChild(noticiaTitulo);
        divConteudo.appendChild(introducaoNoticia);
        divConteudo.appendChild(divConteudoSecundario);
        divConteudo.appendChild(saibaMais);

        noticias_li.appendChild(noticiaImage);
        noticias_li.appendChild(divConteudo);
        novaNoticia.appendChild(noticias_li);
    });
}

function addPages(totalPages, pageAtual) {
    let pages = '';
    let i = 1;

    if (pageAtual >= 7 && totalPages > 10) {
        i = pageAtual - 5;
    }
    if (pageAtual >= totalPages - 4 && totalPages > 10) {
        i = totalPages - 9;
    }
    const pageFim = i + 9;
    while (i <= pageFim && i !== totalPages + 1) {
        pages += criarPagina(i);
        i++;
    }
    paginacao.innerHTML = pages;
}

function criarPagina(index) {
    const url = new URL(window.location);
    const isAtiva = url.searchParams.get('page') === index.toString();
    return `
        <li>
            <button 
                class="${isAtiva ? 'pagina-ativa' : 'pagina'} width100 pointer" 
                type="button" 
                onclick="changePage(this)">${index}</button>
        </li>
    `;
}
/* const pageButton = document.getElementById('pagina')
let link = document.getElementsByClassName('pagina-ativa');
let pageValue = 1;

function activeLink(){
    for (l of link){
        l.classList.remove('active')
    }
    event.target.classList.add("active")
    pageValue = event.target.value;
}

pageButton.addEventListener('click', () => {
    activeLink();
}) */
function changePage(element) {
    const url = new URL(window.location);
    url.searchParams.set('page', element.textContent);
    window.history.pushState({}, '', url);
    
    logNoticias();
}

// Chama a função para configurar filtros e buscar notícias quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    filtros();
    logNoticias();
});
