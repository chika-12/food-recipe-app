document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const bio = document.getElementById('bio').value.trim();

    // Construct the payload
    const data = {
      name,
      email,
      password,
      confirmPassword,
      bio,
    };

    try {
      const response = await fetch(
        'https://food-recipe-app-1-kwbr.onrender.com/api/v1/users/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(`Signup failed: ${result.message || 'Unknown error'}`);
        return;
      }

      localStorage.setItem('token', result.token);
      // Success
      alert('Signup successful!');
      window.location.href = 'recipes.html'; // redirect to recipes page
    } catch (error) {
      console.error('Error signing up:', error);
      alert('An error occurred. Please try again.');
    }
  });
});
