
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            async function loginUser(email, password) {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

               if (response.ok) {
                    const data = await response.json();

                    // write a persistent cookie for this origin
                    document.cookie =`token=${encodeURIComponent(data.access_token)}; Path=/; Max-Age=86400; SameSite=Lax`;

                    // then redirect
                    window.location.assign('/');   // or '/index' if that route exists
                } else {
                    alert('Login failed: ' + response.statusText);
                }
            }
            
            loginUser(email, password);
        });
    }
});