/* Filter function in recipe index */
const filterInput = document.getElementById('filterInput');
const pageList = document.getElementById('pageList');
const pages = pageList.getElementsByTagName('li');

filterInput.addEventListener('input', function() {
    const filter = filterInput.value.toLowerCase();
    for (let i = 0; i < pages.length; i++) {
        const a = pages[i].getElementsByTagName('a')[0];
        const title = a.getAttribute('data-title');
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes(filter)) {
            pages[i].classList.remove('hidden');

            // Highlight the matched text
            const regex = new RegExp(`(${filter})`, 'gi');
            a.innerHTML = title.replace(regex, '<span class="highlight">$1</span>');
        } else {
            pages[i].classList.add('hidden');
            a.innerHTML = title; // Remove any previous highlighting
        }
    }
});

/* Order recipes alphabetically in recipe index list */
document.addEventListener('DOMContentLoaded', function() {
    // Get the container of the spans
    const container = document.getElementById('pageList');

    // Get all the span elements as an array
    const spans = Array.from(container.getElementsByTagName('li'));
    
    // Sort the spans alphabetically by their text content
    spans.sort((a, b) => a.textContent.localeCompare(b.textContent));
    
    // Clear the container
    container.innerHTML = '';
    
    // Append the sorted spans back to the container
    spans.forEach(span => container.appendChild(span));
});
