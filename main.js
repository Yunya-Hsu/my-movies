const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies'
const POSTER_URL = BASE_URL + '/posters'

const MOVIE_PER_PAGE = 12

const movies = []
let filteredMovies = []

const searchFrom = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const switchMode = document.querySelector("#switch-mode")
const dataPanel = document.querySelector("#data-panel")
const paginator = document.querySelector("#paginator")


// render movie list & pagination at beginning
axios.get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCardMode(getMovieByPage(1))
    paginator.dataset.currentPage = "1"
    switchMode.firstElementChild.classList.add("fa-active")
  })
  .catch((error) => {
    console.log(error)
  });


////////////////// event listener start from here ////////////////// 

// change to different display mode
switchMode.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.tagName !== "I") return
  else if (event.target.classList.contains("fa-bars")) {
    event.target.classList.add("fa-active")
    event.target.previousElementSibling.classList.remove("fa-active")
    renderMovieListMode(getMovieByPage(Number(paginator.dataset.currentPage)))
  } else {
    event.target.classList.add("fa-active")
    event.target.nextElementSibling.classList.remove("fa-active")
    renderMovieCardMode(getMovieByPage(Number(paginator.dataset.currentPage)))
  }
})


// onPnaelClicked, if button=more, then pop-up movie details; if button= +, add the movie to favorite
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.tagName !== "BUTTON") return
  else if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// onSearchFromSubmitted, re-render movie list
searchFrom.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  if (!keyword) {
    searchInput.value = ""
    return alert('Please enter valid keyword.')
  } else if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keywords: ' + searchInput.value)
  } else {
    paginator.dataset.currentPage = 1
    renderPaginator(filteredMovies.length)
    if (dataPanel.dataset.display === "card") {
      renderMovieCardMode(getMovieByPage(1))
    } else if (dataPanel.dataset.display === "list") {
      renderMovieListMode(getMovieByPage(1))
    }
  }
})


// when pagination is clicked, re-render the shown movie list
paginator.addEventListener('click', function jumpToThePage(event) {
  if (event.target.tagName !== "A") return
  else {
    const page = Number(event.target.dataset.page)
    const pageList = document.querySelectorAll(".page-item")
    for (const i of pageList) {
      i.classList.remove("active")
    }
    if (dataPanel.dataset.display === "card") {
      renderMovieCardMode(getMovieByPage(page))
    } else if (dataPanel.dataset.display === "list") {
      renderMovieListMode(getMovieByPage(page))
    }
    event.target.parentElement.classList.add("active")
    paginator.dataset.currentPage = page
  }
})


////////////////// functions start from here ////////////////// 

// input movie list to be shown, output render results (card mode)
function renderMovieCardMode(data) {
  let rawHTML = ''
  for (const i of data) {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL}/${i.image}" class="card-img-top" alt="Movie Poster"/>
          <div class="card-body">
            <h5 class="card-title">${i.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${i.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${i.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
  }
  dataPanel.innerHTML = rawHTML
  dataPanel.dataset.display = "card"
}

// input movie list to be shown, output render results (list mode)
function renderMovieListMode(data) {
  let rawHTML = `<ul class="list-group m-2 col-12">`
  for (const i of data) {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between">
      <h5 class="card-title">${i.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${i.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${i.id}">+</button>
        </div>
    </li>`
  }
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
  dataPanel.dataset.display = "list"
}


// input movie list amount(maybe all movie list or search results), output customized pagination 
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page += 1) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  paginator.firstElementChild.classList.add("active")
}


// input=page，output=sliced movie list of page x
function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies //如果filteredMovies 有東西，data=filteredMovies：若filteredMovies是空的，data=movies

  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, (startIndex + MOVIE_PER_PAGE))
}


// input=id, output=modal pop-up
function showMovieModal(id) {
  const movieModalTitle = document.querySelector("#movie-modal-title")
  const movieModalImage = document.querySelector("#movie-modal-image")
  const movieModalDate = document.querySelector("#movie-modal-date")
  const movieModalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + "/" + id)
    .then(response => {
      const data = response.data.results
      movieModalTitle.innerText = data.title
      movieModalImage.src = `${POSTER_URL}/${data.image}`
      movieModalDate.innerText = `Release at: ${data.release_date}`
      movieModalDescription.innerText = data.description
    })
    .catch(error => {
      console.log(error)
    })
}

// input=id, output=add THE movie into favorite list(localStorage)
function addToFavorite(theId) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find((movie) => movie.id === theId)

  if (list.some((movie) => movie.id === theId)) {
    return alert('This movie is already in your list.')
  }
  alert("Add successfully")
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}





