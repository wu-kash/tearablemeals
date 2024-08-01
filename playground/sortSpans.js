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
