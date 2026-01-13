const express = require('express');
const fs = require('fs');
const path = require ('path');
const multer = require ('multer');
const app = express();


const recipesFile = path.join(__dirname, 'public', 'recipes.json');
if (!fs.existsSync(recipesFile)) fs.writeFileSync(recipesFile, JSON.stringify([]));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({storage});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

app.get('/addrecipe', (req,res) => {
    res.render('addrecipe');
});

app.get('/', (req,res) => {
    let recipes = [];
    try {
        const data = fs.readFileSync(recipesFile);
        recipes = JSON.parse(data);
    } catch (err) {
        console.log("You have no recipes");
        recipes = [];
    }
    res.render('index', {recipes});
});

app.post('/add-recipe', upload.single('image'), (req,res) => {
    const {title, description, time, portions} = req.body;
    const steps = req.body.steps;
    const ingredients = req.body.ingredients;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const fileName = title.toLowerCase().replace(/\s+/g, '-') + '.html';
    const filePath = path.join(__dirname, 'public', fileName);

    const stepsHtml = steps
        .map((step, index) => `<li>${step}</li>`)
        .join('');

    const ingredientsHtml = ingredients
        .map((ingredient, index) => `<li>${ingredient}</li>`)
        .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <div class="container">
        <header>
        <h1>Foodie Diary</h1>
        </header>
        <main>
         <div class="title-bar">
        <button type="button" onclick="window.location.href='/'" class="btn back"><<</button>
        <h1>${title}</h1>
    </div>
        ${imagePath ? `<img src="${imagePath}" class="recipe-image">` : ''}
        <p class="description">${description}</p>
        <p>Time: ${time}</p>
        <p>Portions: ${portions}</p>
        <h2>Ingredients</h2>
        <ul class="ingredient-list">${ingredientsHtml}</ul>
        <h2 class="instructions">Instructions</h2>
        <ul class="step-list">${stepsHtml}</ul>
        </main>
        <footer>
        <h2>Foodie Diary 2026</h2>
        </footer>
        </div>
    </body>
    </html>
    `;

    fs.writeFileSync(filePath, htmlContent);

    let recipes = [];

    try{
        const data = fs.readFileSync(recipesFile);
        recipes = JSON.parse(data);
    } catch (err) {
        console.log("We have an error now.");
        recipes = [];
    }

    recipes.push({ title, file: fileName, image: imagePath, description, time, portions, ingredients, steps});
    fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2));

    res.redirect('/');
});

app.post('/delete-recipe', (req, res) => {
    const {file} = req.body;

    let recipes =[];
    try{
        const data = fs.readFileSync(recipesFile);
        recipes = JSON.parse(data);
    } catch (err) {
        console.log("Error reading the file");
    }

    recipes = recipes.filter(recipe => recipe.file !== file);

    fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2));

    const filePath = path.join(__dirname, 'public', file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }

    res.redirect('/');
});

app.get('/edit/:file', (req, res) =>{
    const {file} = req.params;

    let recipes = [];
    try {
        const data = fs.readFileSync(recipesFile);
        recipes = JSON.parse(data);
     } catch (err) {
        recipes = [];
     }

     const recipe = recipes.find(r => r.file === file);
     if (!recipe) return res.send("Not found");

    recipe.ingredients = recipe.ingredients || [];
    recipe.steps = recipe.steps || [];

     res.render('editrecipe', {recipe});
});

app.post('/edit-recipe', upload.single('image'), (req, res) => {
    const { originalFile, title, description, time, portions } = req.body;
    const ingredients = req.body.ingredients || [];
    const steps = req.body.steps || [];

    if (!Array.isArray(ingredients)) ingredients = [ingredients];
    if (!Array.isArray(steps)) steps = [steps];


    let recipes = [];
    try{
        const data = fs.readFileSync(recipesFile);
        recipes = JSON.parse(data);
    } catch (err) {
        console.log("An error occured");
    }

    const recipeIndex = recipes.findIndex(r => r.file === originalFile);
    if (recipeIndex === -1) {
        return res.send("Recipe not found");
    }

    const imagePath = req.file
    ? `/uploads/${req.file.filename}`
    : recipes[recipeIndex].image;

    const newFileName = title.toLowerCase().replace(/\s+/g, '-') + '.html';
    const newFilePath = path.join(__dirname, 'public', newFileName);

    recipes[recipeIndex] = {
        title,
        file: newFileName,
        image: imagePath,
        description,
        time,
        portions,
        ingredients,
        steps
    };

    fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2));

    const ingredientsHtml = ingredients.map(i => `<li>${i}</li>`).join('');
    const stepsHtml = steps.map(s => `<li>${s}</li>`).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <div class="container">
        <header>
        <h1>Foodie Diary</h1>
        </header>
        <main>
         <div class="title-bar">
        <button type="button" onclick="window.location.href='/'" class="btn back"><<</button>
        <h1>${title}</h1>
    </div>
        <p class="description">${description}</p>
        <p class="time">Time: ${time}</p>
        <p class="portions">Portions: ${portions}</p>
        <h2 class="ingredients">Ingredients</h2>
        <ul class="ingredient-list">${ingredientsHtml}</ul>
        <h2 class="instructions">Instructions</h2>
        <ul class="step-list">${stepsHtml}</ul>
        </main>
        <footer>
        <h2>Foodie Diary 2026</h2>
        </footer>
        </div>
    </body>
    </html>
    `;

    fs.writeFileSync(newFilePath, htmlContent);

    const oldPath = path.join(__dirname, 'public', originalFile);
    if (originalFile !== newFileName && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
    }

    res.redirect('/');
});


app.listen(process.env.PORT || 4000)