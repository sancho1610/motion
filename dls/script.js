function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-icon">👋</div>
        <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const wrapper = document.querySelector('.auth-wrapper');
    
    const emailBlock = emailInput.closest('.input-block');
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailBlock.classList.remove('error-active');
    wrapper.classList.remove('shake-animation');

    if (!emailPattern.test(emailValue)) {
        setTimeout(() => {
            emailBlock.classList.add('error-active');
            wrapper.classList.add('shake-animation');
        }, 10);
        return;
    }

    try {
        const loginUrl = 'http://127.0.0.1:8000/login/'; 

        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailValue,
                password: passwordValue
            })
        });

        if (!response.ok) {
            throw new Error('Неверный логин или пароль');
        }

        const data = await response.json();

        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        showToast(`Добро пожаловать, ${data.user.first_name}!`);

        setTimeout(() => {
            if (data.user.is_staff || data.user.is_superuser) {
                window.location.href = 'register.html';
            } else {
                window.location.href = '../index.html'; 
            }
        }, 2500);

    } catch (error) {
        console.error('Ошибка авторизации:', error);
        alert(error.message || 'Произошла ошибка при входе в систему.');
        wrapper.classList.add('shake-animation');
    }
});
