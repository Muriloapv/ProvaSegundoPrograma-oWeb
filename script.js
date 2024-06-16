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

function aplicarFilros(event) {
    event.preventDefault();

    const filtroQuantidade = document.getElementById('filtro-quantidade').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const dateDe = document.getElementById('filtro-de').value;
    const dateAte = document.getElementById('filtro-ate').value;
    const inputBusca = document.getElementById('textBusca').value;

    const url = new URL(window.location.href);
    url.searchParams.set('qtd', filtroQuantidade);
    url.searchParams.set('tipo', filtroTipo);
    url.searchParams.set('de', dateDe);
    url.searchParams.set('ate', dateAte);
    url.searchParams.set('busca', inputBusca);

    window.history.replaceState({}, '', url);
    contarFiltrosAtivos();
    logNoticias();

    modal.close();
}

async function logNoticias() {
    const url = new URL('https://servicodados.ibge.gov.br/api/v3/noticias');
    url.search = window.location.search;

    try {
        const response = await fetch(url.toString());
        const noticias = await response.json();
        displayNoticias(noticias.items);
        addPages(noticias.totalPages, noticias.page);
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
    }
}

function calcularTempoDecorrido(dataPublicacao) {
    const dataPublicacaoObj = new Date(dataPublicacao);
    const agora = new Date();
    const diffEmMilissegundos = agora - dataPublicacaoObj;
    const diffEmDias = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24));

    if (diffEmDias === 0) {
        return 'Publicado hoje';
    } else if (diffEmDias === 1) {
        return 'Publicado ontem';
    } else {
        return `Publicado há ${diffEmDias} dias`;
    }
}

const dataPublicacao = '2024-06-15T12:00:00Z';
const tempoDecorrido = calcularTempoDecorrido(dataPublicacao);
console.log(tempoDecorrido);

function filtros() {
    const url = new URL(window.location);
    inputBusca.value = url.searchParams.get('busca') ?? '';
    filtroTipo.value = url.searchParams.get('tipo') ?? '';
    filtroQuantidade.value = url.searchParams.get('qtd') ?? '10';
    dateDe.value = url.searchParams.get('de') ?? '';
    dateAte.value = url.searchParams.get('ate') ?? '';
    url.searchParams.set('qtd', filtroQuantidade.value);
    url.searchParams.set('page', url.searchParams.get('page') ?? '1');
    window.history.replaceState({}, '', url);
}

function displayNoticias(noticias) {
    const novaNoticia = document.getElementById('noticias-ul');
    novaNoticia.innerHTML = '';

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
        const tempoDecorrido = calcularTempoDecorrido(noticia.data_publicacao);
        dataPublicacao.innerHTML = `<strong>${tempoDecorrido}</strong>`;

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

function changePage(element) {
    const url = new URL(window.location);
    url.searchParams.set('page', element.textContent);
    window.history.pushState({}, '', url);
    
    logNoticias();
}

function realizarBusca(event) {
    event.preventDefault();

    const termoBusca = document.getElementById('textBusca').value.trim();

    const url = new URL(window.location.href);
    url.searchParams.set('busca', termoBusca);
    window.history.replaceState({}, '', url);

    logNoticias();
}

function contarFiltrosAtivos() {
    const urlParams = new URLSearchParams(window.location.search);
    let count = 0;

    for (const param of urlParams.keys()) {
        if (param !== 'page' && param !== 'busca') {
            count++;
        }
    }

    document.getElementById('qntdFiltros').textContent = count;
}

document.addEventListener('DOMContentLoaded', () => {
    filtros();
    contarFiltrosAtivos();
    logNoticias();
});
