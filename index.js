const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []

// Pagination function to update pagination buttons
const updatePaginationDiv = (currentPage, numPages) => {
  // Clear the pagination div before adding new pagination buttons
  $('#pagination').empty()

  // Maximum number of pages to show in the pagination bar
  const maxPagesToShow = 5;

  // Calculate the start and end page numbers to show in the pagination bar
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(numPages, currentPage + Math.floor(maxPagesToShow / 2));

  // If the current page is not the first page, add a 'Prev' button to go back to the previous page
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">&laquo; Prev</button>
    `);
  }

  // Add numbered buttons for the pages between startPage and endPage, and add the 'active' class to the current page button
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i == currentPage ? 'active' : ''}" value="${i}">${i}</button>
    `)
  }

  // If the current page is not the last page, add a 'Next' button to go to the next page
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next &raquo;</button>
    `);
  }
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {

  // get selected pokemons based on current page and page size
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // clear out existing pokemon cards
  $('#pokeCards').empty()

  // loop through selected pokemons and add cards to page
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
        <div class="pokeCard card" pokeName=${res.data.name}   >
          <h3>${res.data.name.toUpperCase()}</h3> 
          <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
            More
          </button>
        </div>  
      `)
  })

  // update total pokemons counter
  $('#totalPokemons').html(
    `<h1>Viewing ${selected_pokemons.length} of ${pokemons.length} Pokemon </h1>`
  );
}

const setup = async () => {
  $('#pokeCards').empty();
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)

  paginate(currentPage, PAGE_SIZE, pokemons)
  updatePaginationDiv(currentPage, numPages)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
          <div style="width:200px">
          <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
          <div>
          <h3>Abilities</h3>
          <ul>
          ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
          </div>
  
          <div>
          <h3>Stats</h3>
          <ul>
          ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
  
          </div>
  
          </div>
            <h3>Types</h3>
            <ul>
            ${types.map((type) => `<li>${type}</li>`).join('')}
            </ul>
        
          `)
    $('.modal-title').html(`
          <h2>${res.data.name.toUpperCase()}</h2>
          <h5># ${res.data.id}</h5>
          `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })
}


$(document).ready(setup)