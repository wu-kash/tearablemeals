function formatIngredient(ingredientName, amount=null, units=null) {
    if (amount == null) {
        return `<i>${ingredientName}</i>`;
    } else {
        return `<i>${ingredientName}</i> <b>(${amount} ${units})</b>`;
    }


    
}

function addIngredientToList(ingredientName, amount, units) {
    const formattedIngredient = formatIngredient(ingredientName, amount, units);
    const li = document.createElement('li');
    li.className = 'text-ingredient-item';
    li.innerHTML = formattedIngredient;
    document.getElementById('ingredientList').appendChild(li);
}


// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Select the reference and resized elements

    // Function to resize the element
    function resizeElement() {
        // Fix positioning for Preparation and Cooking headings by
        // Cooking: Offset Cooking heading by setting left margin to width of ingredients list
        const ingredientsListWidth = document.querySelector('.div-ingredients').offsetWidth;
        const ingredientsTitleWidth = document.querySelector('.title-ingredients').offsetWidth;
        document.querySelector('.title-cooking').style.marginLeft  = ingredientsListWidth + 'px';

        document.querySelector('.title-preparation').style.marginLeft  = (ingredientsListWidth-ingredientsTitleWidth) + 'px';

        
    }

    // Initial resize
    resizeElement();

    // Optional: Resize the element if the window is resized
    window.addEventListener('resize', resizeElement);
});
