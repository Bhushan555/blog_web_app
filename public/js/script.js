document.addEventListener('DOMContentLoaded',()=>{
    const button=document.querySelector('.search_btn');
    const searchBar=document.querySelector('.search_bar');
    const searchInput=document.getElementById('searchInput');
    const searchClose=document.getElementById('searchClose');

    button.addEventListener('click',()=>{
        searchBar.classList.add('open');
        searchInput.focus();
    })
    searchClose.addEventListener('click',()=>{
        searchBar.classList.remove('open');
    })
})