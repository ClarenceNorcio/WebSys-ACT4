const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const initialMessageDiv = document.getElementById('initialMessage');
const DATA_URL = 'https://clarencenorcio.github.io/libara/data.json';

let allBooks = [];

async function fetchBooks() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        allBooks = await response.json();
        if (!Array.isArray(allBooks)) {
           console.warn("Fetched data is not an array, attempting to use as single item array.");
           allBooks = [allBooks];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsDiv.innerHTML = `
            <div class="no-results text-danger">
                <strong>Error loading book data:</strong> ${error.message} <br> Please try refreshing the page.
            </div>`;
         if (initialMessageDiv) initialMessageDiv.classList.add('d-none');
    } finally {
         loadingDiv.classList.add('d-none');
    }
}

function displayBooks(books) {
    if (initialMessageDiv) initialMessageDiv.classList.add('d-none');
    loadingDiv.classList.add('d-none');

    if (!Array.isArray(books)) {
        console.error("Invalid data passed to displayBooks. Expected an array.");
        resultsDiv.innerHTML = `<div class="no-results text-danger">Error displaying data.</div>`;
        return;
    }

    if (books.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                No books found matching your criteria.
            </div>`;
        return;
    }

    const headers = ["Title", "Author", "Genre", "Status"];

    let tableHTML = `
        <div class="table-responsive">
            <table class="table book-table table-hover align-middle">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Genre</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

    books.forEach(book => {
        const title = book.title || 'N/A';
        const author = book.author || 'N/A';
        const genre = book.genre || 'N/A';
        const isAvailable = book.isAvailable; 


        const statusText = isAvailable === true ? "Available" : "Check Out";
        const statusClass = isAvailable === true ? "status-available" : "status-checked-out";

        tableHTML += `
            <tr>
                <td data-label="Title">${title}</td>
                <td data-label="Author">${author}</td>
                <td data-label="Genre">${genre}</td>
                <td data-label="Status">
                    <span class="status ${statusClass}">${statusText}</span>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    resultsDiv.innerHTML = tableHTML;
}

function searchBooks() {
    const searchTerm = searchInput.value.trim().toLowerCase(); 

    loadingDiv.classList.remove('d-none');
    resultsDiv.innerHTML = ''; 
    if (initialMessageDiv) initialMessageDiv.classList.add('d-none');

    setTimeout(() => {
        if (!searchTerm) {
            resultsDiv.innerHTML = '';
             if (initialMessageDiv) initialMessageDiv.classList.remove('d-none');
            loadingDiv.classList.add('d-none');
            return;
        }

        const filteredBooks = allBooks.filter(book => {
            const titleMatch = book.title && book.title.toLowerCase().includes(searchTerm);
            const authorMatch = book.author && book.author.toLowerCase().includes(searchTerm);
            const genreMatch = book.genre && book.genre.toLowerCase().includes(searchTerm);
            return titleMatch || authorMatch || genreMatch;
        });

        displayBooks(filteredBooks); 
    }, 50);

}

searchButton.addEventListener('click', searchBooks);

searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchBooks();
    }
});

document.addEventListener('DOMContentLoaded', fetchBooks);