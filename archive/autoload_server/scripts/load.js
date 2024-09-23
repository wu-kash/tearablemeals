// Function to load the recipe list
async function loadListOfRecipes() {

    showMainMenu();
    
    const response = await fetch('/api/recipes');
    const files = await response.json();
    const recipeList = document.getElementById('recipe-list');

    files.forEach(file => {
        // Extract the file name from the path (removing the folder path)
        const fullFileName = file.split('\\').pop();
        const fileName = fullFileName.replace('.yaml', ''); // This gets the last part after "/"
        const displayName = fileName.replace('_', ' ');

        console.log(fileName);

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = displayName;
        link.setAttribute('data-title', displayName)
        link.style.textTransform = 'capitalize';
        link.onclick = () => loadRecipe(file); // Use the full path to load the recipe
        li.appendChild(link);
        recipeList.appendChild(li);
    });
    showMainMenu();
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
    showRecipe();
}

// Function to show the recipe list and hide the recipe content
function showMainMenu() {
    document.getElementById('main-menu-content').style.display = 'block'; // Hide recipe list
    document.getElementById('recipe-content').style.display = 'none'; // Hide recipe content
}

function showRecipe() {
    document.getElementById('main-menu-content').style.display = 'none'; // Hide recipe list
    document.getElementById('recipe-content').style.display = 'block'; // Show recipe content
}

// Attach the showMainMenu function to the back button
document.getElementById('back-button').onclick = showMainMenu;