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
    console.log('Prep BEFORE print');
    console.log(document.body.style.backgroundColor);
    calculateDocumentHeight(); // Call the function before printing
};

window.onafterprint = function() {
    console.log('Prep AFTER print');
    console.log(document.body.style.backgroundColor);
    calculateDocumentHeight(); // Call the function before printing

};

window.onload = function() {

    // Convert  placeholders when the document is ready
    formatSelector('li');
    formatSelector('b');

    resizeElement();

    /* This somehow fixes the random gap in the Cooking title border when loading the page*/
    document.querySelector('.title-instructions').style.borderWidth = 'var(--h2-border-width)';
    document.querySelector('.title-ingredients').style.borderWidth = 'var(--h2-border-width)';
    document.querySelector('.title-preparation').style.borderWidth = 'var(--h2-border-width)';

    
};


