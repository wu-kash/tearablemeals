/* Filter function in recipe index */
const filterInput = document.getElementById('filterInput');
const recipeList = document.getElementById('recipe-list');
const pages = recipeList.getElementsByTagName('li');

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

// Function to load the recipe list
async function loadListOfRecipes() {
    
    const response = await fetch('/api/recipes');
    const files = await response.json();
    const recipeList = document.getElementById('recipe-list');

    files.forEach(file => {
        // Extract the file name from the path (removing the folder path)
        const fullFileName = file.split('\\').pop();
        const fileName = fullFileName.replace('.yaml', ''); // This gets the last part after "/"
        const displayName = fileName.replace(/_/g, ' ');

        console.log(`Full File Name: ${fileName} [${displayName}]`);

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `recipe.html?recipe=${fileName}`;
        link.textContent = displayName;
        link.setAttribute('data-title', displayName)
        link.style.textTransform = 'capitalize';
        link.onclick = () => loadRecipe(file); // Use the full path to load the recipe
        li.appendChild(link);
        recipeList.appendChild(li);
    });
}

// Function to load and display a recipe
async function loadRecipe(file) {
    const response = await fetch(`/api/recipes/${file}`);
    const recipe = await response.json();

    document.getElementById('recipe-title').textContent = recipe.title;

    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = ''; // Clear previous content
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });

    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = ''; // Clear previous content
    recipe.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
    });
}

/* Order recipes alphabetically in recipe index list */
document.addEventListener('DOMContentLoaded', function() {
    // Get the container of the spans
    const container = document.getElementById('recipe-list');
    const spans = Array.from(container.getElementsByTagName('li'));
    
    // Sort the spans alphabetically by their text content
    spans.sort((a, b) => a.textContent.localeCompare(b.textContent));
    
    // Clear the container
    container.innerHTML = '';
    
    // Append the sorted spans back to the container
    spans.forEach(span => container.appendChild(span));

    loadListOfRecipes();
});