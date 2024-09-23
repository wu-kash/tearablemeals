/// RECIPE FUNCTIONS ///
function formatSelector(selector) {
    const elements = document.querySelectorAll(selector);

    Array.from(elements).forEach(element => {
        let text = element.innerHTML;
        text = processText(text);
        element.innerHTML = text;
    });
}

function processText(text) {

    const stylingStart = `<span>`;
    const stylingEnd = `</span>`;

    // \tempFToC{ValueF}
    const regexTempFToC = /tempFToC\{(\d+)\}/g;
    text = text.replace(regexTempFToC, (match, p1) => {
        const fahrenheit = parseFloat(p1);
        const celsius = fahrenheitToCelsius(fahrenheit);
        return `${stylingStart}${celsius}°C${stylingEnd}`;
    });

    // \tempC{ValueC}
    const regexTempC = /tempC\{(\d+)\}/g;
    text = text.replace(regexTempC, (match, p1) => {
        const celsius = parseFloat(p1);
        return `${stylingStart}${celsius}°C${stylingEnd}`;
    });

    // \sfrac{Value1}{Value2}
    const fracRegex = /sfrac\{(\d+)\}\{(\d+)\}/g;
    text = text.replace(fracRegex, (match, numerator, denominator) => {
        return `${stylingStart}${numerator}/${denominator}${stylingEnd}`;
    });

    return text;
}

function formatIngredient(ingredientName, amount=null, units=null) {

    if (amount==null || amount=='') {
        return `${ingredientName}`;
    } else if (units==null || units=='') {
        return `${ingredientName} <span style="font-size: 90%">(${amount})</span>`;
    } else {
        return `${ingredientName} <span style="font-size: 90%">(${amount} ${units})</span>`;
    }
}

function formatHeading(headingName) {
    return `<b>${headingName}</b>`;
}

function addIngredientToList(ingredientName, amount, units) {
    if (units == 'Oz') {
        amount = convertOzToGrams(amount);
        units = 'g';
    } else if (units == 'Lb') {
        amount = convertLbToGrams(amount);
        units = 'g';
    }

    const formattedIngredient = formatIngredient(ingredientName, amount, units);
    const li = document.createElement('li');
    li.className = 'text-ingredient-item';
    li.innerHTML = processText(formattedIngredient);
    document.getElementById('ingredientList').appendChild(li);
}

function addIngredientHeadingToList(headingName) {
    const formattedHeading = formatHeading(headingName);
    const li = document.createElement('li');
    li.className = 'text-ingredient-heading';
    li.innerHTML = formattedHeading;
    document.getElementById('ingredientList').appendChild(li);
}

function addPreparationStepToList(step) {
    const li = document.createElement('li');
    li.className = 'preparation-step';
    li.id = 'step-text';
    li.textContent = step;
    document.getElementById('preparationList').appendChild(li);
}

function addCookingStepToList(step) {
    const li = document.createElement('li');
    li.className = 'cooking-step';
    li.id = 'step-text';
    li.textContent = step;
    document.getElementById('cookingList').appendChild(li);
}

function convertOzToGrams(ounces) {
    const gramsPerOunce = 28.3495;
    return roundOffValue(ounces * gramsPerOunce);
}

function convertLbToGrams(pounds) {
    const gramsPerPound = 453.592;
    return roundOffValue(pounds * gramsPerPound);
}

function roundOffValue(value) {
    if (value > 500) {
        return Math.round(value / 50) * 50;
    } else if (value > 200) {
        return Math.round(value / 25) * 25;
    } else {
        return Math.round(value / 10) * 10;
    }
}

function roundOffTemperature(value) {
    return Math.round(value / 5) * 5;
}

function fahrenheitToCelsius(fahrenheit) {
    return roundOffTemperature(((fahrenheit - 32) * 5 / 9));
}

function resizeElement() {

    console.log("resizeElement called");

    // Fix positioning for Preparation and Cooking headings by
    // Cooking: Offset Cooking heading by setting left margin to width of ingredients list
    const ingredientsListWidth = document.querySelector('.div-ingredients').offsetWidth;
    const ingredientsTitleWidth = document.querySelector('.title-ingredients').offsetWidth;
    document.querySelector('.title-instructions').style.marginLeft  = ingredientsListWidth + 'px';
    document.querySelector('.title-preparation').style.marginLeft  = (ingredientsListWidth-ingredientsTitleWidth) + 'px';
    
    // Where does this 40 come from???
    document.querySelector('.text-preparation-list').style.marginLeft  = (ingredientsListWidth-40) + 'px';
}

function calculateDocumentHeight() {
    // Calculate total document height in pixels
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, 
        html.clientHeight, html.scrollHeight, html.offsetHeight );
    
    height = Math.max( body.scrollHeight);

    // Assuming a standard DPI of 96
    const dpi = 96;

    // Convert pixels to inches
    var totalHeightInches = height / dpi;
    totalHeightInches = totalHeightInches.toFixed(2);

    console.log(body.scrollHeight/dpi);
    console.log(body.offsetHeight/dpi);
    console.log(html.clientHeight/dpi);
    console.log(html.scrollHeight/dpi);
    console.log(html.offsetHeight/dpi);

    console.log(`${totalHeightInches} inches`);

    if (totalHeightInches > 8.4) {
        document.body.style.backgroundColor = 'red';
        console.log('Recipe is too long!');
    } else {
        document.body.style.backgroundColor = ''; // Reset to default
    }

    window.printHeight = {
        inches: totalHeightInches
    };

    return totalHeightInches;
}

window.onbeforeprint = function() {
    console.log(document.body.style.backgroundColor);
    calculateDocumentHeight(); // Call the function before printing
};

window.onafterprint = function() {
    console.log(document.body.style.backgroundColor);
    calculateDocumentHeight(); // Call the function before printing

};

window.onload = function() {

    // Convert placeholders when the document is ready
    formatSelector('li');
    formatSelector('b');

    resizeElement();

    /* This somehow fixes the random gap in the Cooking title border when loading the page*/
    document.querySelector('.title-instructions').style.borderWidth = 'var(--h2-border-width)';
    document.querySelector('.title-ingredients').style.borderWidth = 'var(--h2-border-width)';
    document.querySelector('.title-preparation').style.borderWidth = 'var(--h2-border-width)';

    
};


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////






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

    document.getElementById('recipe-title').textContent = recipe.Title;
    document.getElementById('recipe-preparation-time').textContent = recipe.PreparationTime.Value + ` ` + recipe.PreparationTime.Units;
    document.getElementById('recipe-cooking-time').textContent = recipe.CookingTime.Value + ` ` + recipe.CookingTime.Units;
    document.getElementById('recipe-portions').textContent = recipe.Portions.Value + ` Serving(s)`;

    const ingredientsList = document.getElementById('ingredientList');
    ingredientsList.innerHTML = ''; // Clear previous content

    for (let ingredient in recipe.Ingredients) {
        const ingredientName = ingredient;
        const ingredientQty = recipe.Ingredients[ingredient].Quantity;
        const ingredientUnits = recipe.Ingredients[ingredient].Units;

        if (Object.hasOwn(recipe.Ingredients[ingredient], 'Heading')) {
            console.log(`Heading: ${ingredientName}`);
            addIngredientHeadingToList(ingredientName);
        } else {
            console.log(`Ingredient: ${ingredientName} [${ingredientQty} ${ingredientUnits}]`);
            addIngredientToList(ingredientName, ingredientQty, ingredientUnits);
        }
    }

    const preparationList = document.getElementById('preparationList');
    preparationList.innerHTML = ''; // Clear previous content
    recipe.Preparations.forEach(step => {
        console.log(`Prep Step: ${step}`);
        addPreparationStepToList(step);
    });

    const instructionsList = document.getElementById('cookingList');
    instructionsList.innerHTML = ''; // Clear previous content
    recipe.Instructions.forEach(step => {
        console.log(`Cooking Step: ${step}`);
        addCookingStepToList(step);
    });

    showRecipe();
    resizeElement();
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

