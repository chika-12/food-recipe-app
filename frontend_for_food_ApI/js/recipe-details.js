document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id');
  const token = localStorage.getItem('token');

  if (!recipeId || !token) {
    alert(
      'Missing recipe ID or authentication token. Redirecting to recipes page.'
    );
    window.location.href = 'recipes.html';
    return;
  }

  // Cache DOM elements
  const titleEl = document.getElementById('detail-title');
  const detailEl = document.getElementById('recipe-detail');
  const commentsContainer = document.getElementById('comments-container');
  const commentForm = document.getElementById('comment-form');
  const commentTextInput = document.getElementById('comment-text');
  const commentRatingInput = document.getElementById('comment-rating');

  // Load recipe details and render
  async function loadRecipeDetail() {
    try {
      const response = await fetch(
        `https://food-recipe-app-1-kwbr.onrender.com/api/v1/recipes/${recipeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch recipe details');

      const result = await response.json();
      const recipe = result.data; // Adjusted for new format

      // Set page title
      titleEl.textContent = recipe.title;

      // Render main recipe info
      detailEl.innerHTML = `
        ${
          recipe.image
            ? `<img src="${recipe.image}" alt="${recipe.title}">`
            : ''
        }
        <p>${recipe.description}</p>
        <h3>Ingredients:</h3>
        <ul>
          ${(recipe.ingredients || [])
            .map((item) => `<li>${item}</li>`)
            .join('')}
        </ul>
        <h3>Instructions:</h3>
        <ol>
          ${(recipe.instructions || [])
            .map((step) => `<li>${step}</li>`)
            .join('')}
        </ol>
        <div class="meta">
          Cooking Time: ${recipe.cookingTime} mins | Serves: ${recipe.servings}
        </div>
      `;

      // Render comments
      const comments = recipe.comment || [];
      commentsContainer.innerHTML = comments.length
        ? comments
            .map((c) => {
              const userName = c.user?.[0]?.name || 'Anonymous';
              return `
              <div class="comment">
                <p><strong>${userName}</strong> (${c.ratings}/5)</p>
                <p>${c.comment}</p>
              </div>
            `;
            })
            .join('')
        : '<p>No comments yet.</p>';
    } catch (err) {
      console.error(err);
      detailEl.innerHTML =
        '<p>Error loading recipe. Please try again later.</p>';
    }
  }

  // Submit a new comment
  async function submitComment(event) {
    event.preventDefault();
    const text = commentTextInput.value.trim();
    const rating = Number(commentRatingInput.value);

    if (!text || rating < 1 || rating > 5) {
      alert('Please provide a valid comment and rating between 1 and 5.');
      return;
    }

    try {
      const response = await fetch(
        `https://food-recipe-app-1-kwbr.onrender.com/api/v1/recipes/${recipeId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: text, ratings: rating }),
        }
      );
      if (!response.ok) throw new Error('Failed to post comment');

      // Reset form and reload comments
      commentForm.reset();
      loadRecipeDetail();
    } catch (err) {
      console.error(err);
      alert('Error submitting comment. Please try again.');
    }
  }

  commentForm.addEventListener('submit', submitComment);
  loadRecipeDetail();
});
