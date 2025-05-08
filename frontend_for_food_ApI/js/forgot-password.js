// js/forgot-password.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-password-form');
  const emailInput = document.getElementById('email');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
      alert('Please enter your email address.');
      return;
    }

    try {
      const response = await fetch(
        'https://food-recipe-app-1-kwbr.onrender.com/api/v1/users/forgotpassword',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          'If that email is registered, you will receive a reset link shortly.'
        );
        window.location.href = 'login.html';
      } else {
        // Display server-provided message or generic error
        alert(data.message || 'Failed to initiate password reset.');
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
