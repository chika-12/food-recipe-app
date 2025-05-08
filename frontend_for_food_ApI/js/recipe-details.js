// Parse recipe ID from URL
const params = new URLSearchParams(window.location.search);
const recipeId = params.get('id');
const token = localStorage.getItem('token');

if (!recipeId || !token) {
  alert('Missing recipe ID or not authenticated.');
  window.location.href = 'recipes.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecipeDetail();
  document
    .getElementById('comment-form')
    .addEventListener('submit', submitComment);
});

// Fetch and render recipe detail (including comments) using GET /recipes/:id
async function loadRecipeDetail() {
  try {
    const res = await fetch(
      `https://food-recipe-app-1-kwbr.onrender.com/api/v1/recipes/${recipeId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Failed to fetch recipe details');
    const json = await res.json();
    const r = json.specificRecipe;

    // Populate main details
    const detail = document.getElementById('recipe-detail');
    detail.innerHTML = `
      <h2>${r.title}</h2>
      ${r.image ? `<img src="${r.image}" alt="${r.title}"/>` : ''}
      <p>${r.description}</p>
      <h3>Ingredients:</h3>
      <ul>${(r.ingredients || []).map((i) => `<li>${i}</li>`).join('')}</ul>
      <h3>Instructions:</h3>
      <ol>${(r.instructions || [])
        .map((step) => `<li>${step}</li>`)
        .join('')}</ol>
      <div class="meta">Cooking Time: ${r.cookingTime} mins | Serves: ${
      r.servings
    }</div>
    `;

    // Render comments from recipe-specific field
    const container = document.getElementById('comments-container');
    const comments = r.comment || [];
    container.innerHTML = comments.length
      ? comments
          .map(
            (c) => `
          <div class="comment">
            <p><strong>${c.user?.name || 'Anonymous'}</strong> (${
              c.ratings
            }/5)</p>
            <p>${c.comment}</p>
          </div>
        `
          )
          .join('')
      : '<p>No comments yet.</p>';
  } catch (err) {
    console.error(err);
    document.getElementById('recipe-detail').innerHTML =
      '<p>Error loading recipe.</p>';
  }
}

// Submit a new comment using POST /recipes/:id/review
async function submitComment(event) {
  event.preventDefault();
  const text = document.getElementById('comment-text').value;
  const rating = Number(document.getElementById('comment-rating').value);
  try {
    const res = await fetch(
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
    if (!res.ok) throw new Error('Failed to post comment');
    document.getElementById('comment-form').reset();
    // Use recipeDetail reload to fetch updated comment array
    loadRecipeDetail();
  } catch (err) {
    console.error(err);
    alert('Error submitting comment.');
  }
}
