// Your code here
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements to variables
    const movieTitle = document.getElementById('films');
    const poster = document.getElementById('poster');
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const description = document.getElementById('film-info');
    const showtime = document.getElementById('showtime');
    const ticketNum = document.getElementById('ticket-num');
    const buyButton = document.getElementById('buy-ticket');

    // Fetch film data from the server provided
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(films => {
            // Clear the existing movie title list
            movieTitle.innerHTML = '';
            // Render each film
            films.forEach(renderFilm);
            // Display details of the first film in the list by default
            if (films.length > 0) {
                displayFilmDetails(films[0]);
            }
        })
        .catch(error => console.error('Error fetching films:', error));

    // Render a film item
    function renderFilm(film) {
        const li = document.createElement('li');
        li.classList.add('film', 'item');
        li.textContent = film.title;
        li.dataset.id = film.id;
        if (film.capacity - film.tickets_sold === 0) {
            li.classList.add('sold-out');
        }
        li.addEventListener('click', () => displayFilmDetails(film));
        const deleteButton = createDeleteButton(film.id);
        li.appendChild(deleteButton);
        movieTitle.appendChild(li);
    }

    // Create a delete button for a film
    function createDeleteButton(filmId) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteFilm(filmId);
        });
        return deleteButton;
    }

    // Display the film details
    function displayFilmDetails(film) {
        poster.src = film.poster;
        title.textContent = film.title;
        runtime.textContent = `${film.runtime} minutes`;
        description.textContent = film.description;
        showtime.textContent = film.showtime;
        ticketNum.textContent = film.capacity - film.tickets_sold;
        updateBuyButton(film);
    }

    // Update buy button based on availability
    function updateBuyButton(film) {
        if (film.capacity - film.tickets_sold > 0) {
            buyButton.textContent = 'Buy Ticket';
            buyButton.disabled = false;
        } else {
            buyButton.textContent = 'Sold Out';
            buyButton.disabled = true;
        }
        buyButton.removeEventListener('click', buyTicket);
        buyButton.addEventListener('click', (event) => buyTicket(event, film));
    }

    // Function to buy tickets
    function buyTicket(event, film) {
        event.preventDefault(); // Prevent default form submission behavior
        let availableTickets = parseInt(ticketNum.textContent);
        if (availableTickets > 0) {
            availableTickets--;
            ticketNum.textContent = availableTickets;
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickets_sold: film.tickets_sold + 1
                })
            })
            .then(response => response.json())
            .then(updatedFilm => {
                film.tickets_sold = updatedFilm.tickets_sold;
                console.log('Ticket purchased successfully!');
                if (availableTickets === 0) {
                    updateBuyButton(film);
                }
            })
            .catch(error => console.error('Error purchasing ticket:', error));
        } else {
            alert('There are no available tickets for this film. Please try another film.');
        }
    }

    // Function to delete a film
    function deleteFilm(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            const filmItem = document.querySelector(`li[data-id="${filmId}"]`);
            if (filmItem) {
                filmItem.remove();
            }
            console.log('Film deleted successfully!');
        })
        .catch(error => console.error('Error deleting film:', error));
    }
});
0