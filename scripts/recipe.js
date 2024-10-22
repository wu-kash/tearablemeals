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
    const fracRegex = /FRACTION\{(\d+)\}\{(\d+)\}/g;
    text = text.replace(fracRegex, (match, numerator, denominator) => {
        // return `<sup>${numerator}</sup>&frasl;<sub>${denominator}</sub>`;
        // return `&frac${numerator}${denominator}`;

        return `<sup>${numerator}</sup>&#x2044;<sub>${denominator}</sub>`;
        
    });

    // \ingredient{text}
    const ingredientRegex = /INGREDIENT\{(.*?)\}/g;
    text = text.replace(ingredientRegex, (match, ingredient) => {
        return `<span class="highlight">${ingredient}</span>`;
    });

    

    return text;
}


function formatIngredient(ingredientName, amount=null, units=null) {

    /* NOTE The margin-right is added to seperate the ingredients from the steps on the right */
    if (amount==null || amount=='') {
        return `${ingredientName}`;
    } else if (units==null || units=='') {
        return `${ingredientName} <span style="font-size: 0.75em; margin-right: 1em;">(${amount})</span>`;
    } else {
        return `${ingredientName} <span style="font-size: 0.75em; margin-right: 1em;">(${amount} ${units})</span>`;
    }
}

function formatHeading(headingName) {
    return `<b>${headingName}</b>`;
}

function addIngredientToList(ingredientName, amount, units) {

    console.log('Add ingredient');

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
    calculateDocumentHeight(); // Call the function before printing
};

window.onafterprint = function() {
    calculateDocumentHeight(); // Call the function before printing
};

function resizeElement() {

    const currentWidth = document.body.style.width
    document.body.style.width = '359px'; // Do one less pixel than min width

    // Fix positioning for Preparation and Cooking headings by
    // Cooking: Offset Cooking heading by setting left margin to width of ingredients list
    const ingredientsListWidth = document.querySelector('.div-ingredients').offsetWidth;
    const ingredientsTitleWidth = document.querySelector('.title-ingredients').offsetWidth;
    const stepTextOffset = document.getElementById('step-text').offsetWidth;
    document.querySelector('.title-instructions').style.marginLeft  = ingredientsListWidth + 'px';
    document.querySelector('.title-preparation').style.marginLeft  = (ingredientsListWidth-ingredientsTitleWidth) + 'px';
    
    // NOTE Where does this 40 come from???
    document.querySelector('.text-preparation-list').style.marginLeft  = (ingredientsListWidth-40) + 'px';

    // Return to original width
    document.body.style.width = currentWidth;
}

window.onload = function() {

    /* NOTE This somehow fixes the random gap in the Cooking title border when loading the page*/
    document.querySelector('.title-instructions').style.borderWidth = 'var(--h2-border-width)';
    document.querySelector('.title-ingredients').style.borderWidth = 'var(--h2-border-width)';
    document.querySelector('.title-preparation').style.borderWidth = 'var(--h2-border-width)';
};

document.addEventListener('DOMContentLoaded', function() {

    const params = new URLSearchParams(window.location.search);
    const recipeFileName = params.get('recipe');
    loadRecipe(recipeFileName);
});

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}


async function loadRecipe(recipeToLoad) {

    console.log(`Recipe To Load: ${recipeToLoad}`);

    const response = await fetch(`/api/recipes/${recipeToLoad}.yaml`);
    const recipe = await response.json();

    const recipeTitle = recipeToLoad.replace(/_/g, ' ');

    document.title = `Tearable ${toTitleCase(recipeTitle)}`;
    document.getElementById('recipe-title').textContent = recipeTitle;
    document.getElementById('recipe-preparation-time').textContent = `${recipe.PreparationTime.Value} ${recipe.PreparationTime.Units}`;
    document.getElementById('recipe-cooking-time').textContent = `${recipe.CookingTime.Value} ${recipe.CookingTime.Units}`;
    document.getElementById('recipe-portions').textContent =  `${recipe.Portions.Value} Servings`;
    document.getElementById('qr-link').href =  `${recipe.Source}`;

    const ingredientsList = document.getElementById('ingredientList');
    ingredientsList.innerHTML = ''; // Clear previous content

    recipe.Ingredients.forEach(item => {
        const ingredientName = item.Name;
        const ingredientQty = item.Value;
        const ingredientUnits = item.Units;

        if (item.Heading) {
            console.log(`Heading: ${ingredientName}`);
            addIngredientHeadingToList(ingredientName);
        } else {
            console.log(`Ingredient: ${ingredientName} [${ingredientQty} ${ingredientUnits}]`);
            addIngredientToList(ingredientName, ingredientQty, ingredientUnits);
        }
    });

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

    // Convert  placeholders when the document is ready
    formatSelector('li');
    formatSelector('b');

    resizeElement();
}