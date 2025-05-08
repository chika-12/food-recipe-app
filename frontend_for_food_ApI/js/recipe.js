document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const container = document.getElementById('recipes-container');

  if (!token) {
    alert('You are not logged in. Redirecting to login...');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(
      'https://food-recipe-app-1-kwbr.onrender.com/api/v1/recipes/search',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch recipes.');
    }

    const recipes = data.data;

    if (!recipes || recipes.length === 0) {
      container.innerHTML = '<p class="error">No recipes found.</p>';
      return;
    }

    container.innerHTML = recipes
      .map(
        (recipe) => `
          <div class="card">
            <div class="card-content">
              <h2>${recipe.title}</h2>
              <p>${recipe.description || 'No description available.'}</p>
              <div class="meta">Cooking Time: ${
                recipe.cookingTime
              } mins | Serves: ${recipe.servings}</div>
            </div>
          </div>
        `
      )
      .join('');
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
});
