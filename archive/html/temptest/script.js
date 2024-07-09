function processText(text) {

    const stylingStart = `<b style="font-size: 90%">`;
    const stylingEnd = `</b>`;

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
        return `<i>${ingredientName}</i>`;
    } else if (units==null || units=='') {
        return `<i>${ingredientName}</i> <b>(${amount})</b>`;
    } else {
        return `<i>${ingredientName}</i> <b>(${amount} ${units})</b>`;
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

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Function to resize the element
    function resizeElement() {
        // Fix positioning for Preparation and Cooking headings by
        // Cooking: Offset Cooking heading by setting left margin to width of ingredients list
        const ingredientsListWidth = document.querySelector('.div-ingredients').offsetWidth;
        const ingredientsTitleWidth = document.querySelector('.title-ingredients').offsetWidth;
        document.querySelector('.title-cooking').style.marginLeft  = ingredientsListWidth + 'px';
        document.querySelector('.title-preparation').style.marginLeft  = (ingredientsListWidth-ingredientsTitleWidth) + 'px';
        
        // Where does this 40 come from???
        document.querySelector('.text-preparation-list').style.marginLeft  = (ingredientsListWidth-40) + 'px';
    }

    // Initial resize
    resizeElement();

    // Optional: Resize the element if the window is resized
    window.addEventListener('resize', resizeElement);
});

window.onload = function() {
    // Parse for temperature conversions
    

    // Function to parse and convert temperature placeholders
    function convertTemperaturePlaceholders(selector) {
        const paragraphs = document.querySelectorAll(selector);

        // Look for \tempFToC{Value} tags
        Array.from(paragraphs).forEach(paragraph => {
            let text = paragraph.innerHTML;

            text = processText(text);

            paragraph.innerHTML = text;
        });
    }

    // Convert temperature placeholders when the document is ready
    convertTemperaturePlaceholders('li');
    convertTemperaturePlaceholders('b');

    
};