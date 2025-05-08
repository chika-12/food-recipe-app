document.addEventListener('DOMContentLoaded', () => {
  const userDetailsContainer = document.getElementById('user-details');
  const userRecipesContainer = document.getElementById('user-recipes');
  const userFavoritesContainer = document.getElementById('user-favorites');
  const editProfileButton = document.getElementById('edit-profile');
  const logoutButton = document.getElementById('logout');

  const authToken = localStorage.getItem('authToken');

  // if (!authToken) {
  //   window.location.href = 'login.html';
  //   return;
  // }

  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // Fetch user profile data
  fetch('https://food-recipe-app-1-kwbr.onrender.com/api/v1/users/profile', {
    method: 'GET',
    headers,
  })
    .then((response) => response.json())
    .then((data) => {
      const user = data.profile;
      userDetailsContainer.innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Bio:</strong> ${user.bio || 'No bio available'}</p>
      `;
    })
    .catch((error) => console.error('Error fetching user profile:', error));

  // Fetch user's recipes
  fetch('https://food-recipe-app-1-kwbr.onrender.com/api/v1/recipes', {
    method: 'GET',
    headers,
  })
    .then((response) => response.json())
    .then((data) => {
      const recipes = data.recipes;
      if (recipes.length > 0) {
        userRecipesContainer.innerHTML = recipes
          .map(
            (recipe) => `
          <div class="recipe-card">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <a href="recipe-detail.html?id=${recipe.id}">View Recipe</a>
          </div>
        `
          )
          .join('');
      } else {
        userRecipesContainer.innerHTML = '<p>No recipes found.</p>';
      }
    })
    .catch((error) => console.error('Error fetching user recipes:', error));

  // Fetch user's favorite recipes
  fetch('https://food-recipe-app-1-kwbr.onrender.com/api/v1/users/favorites', {
    method: 'GET',
    headers,
  })
    .then((response) => response.json())
    .then((data) => {
      const favorites = data.favorites;
      if (favorites.length > 0) {
        userFavoritesContainer.innerHTML = favorites
          .map(
            (favorite) => `
          <div class="favorite-card">
            <h3>${favorite.name}</h3>
            <p>${favorite.description}</p>
            <a href="recipe-detail.html?id=${favorite.id}">View Recipe</a>
          </div>
        `
          )
          .join('');
      } else {
        userFavoritesContainer.innerHTML = '<p>No favorite recipes found.</p>';
      }
    })
    .catch((error) => console.error('Error fetching user favorites:', error));

  // Edit profile functionality
  editProfileButton.addEventListener('click', () => {
    window.location.href = 'edit-profile.html';
  });

  // Logout functionality
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  });
});
