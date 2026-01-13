document.addEventListener('DOMContentLoaded', () => {

const stepsContainer = document.getElementById('steps-container');
const addStepBtn = document.getElementById('add-step');

let stepCount = 1;

addStepBtn.addEventListener('click', () => {
    stepCount++;
    const newStep = document.createElement('div');
    newStep.classList.add('step');
    newStep.innerHTML = `<input type="text" name="steps[]" placeholder="Step ${stepCount}" required>`;
    stepsContainer.appendChild(newStep);
});

const ingredientsContainer = document.getElementById('ingredients-container');
const addIngredientBtn = document.getElementById('add-ingredient');

let ingredientCount = 1;

addIngredientBtn.addEventListener('click', () => {
    ingredientCount++;
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('ingredient');
    newIngredient.innerHTML = `<input type="text" name="ingredients[]" placeholder="Ingredient ${ingredientCount}" required>`
    ingredientsContainer.appendChild(newIngredient); 
});
});

