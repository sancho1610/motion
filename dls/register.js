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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let adminToken = localStorage.getItem('accessToken') || getCookie('accessToken');
    const wrapper = document.querySelector('.auth-wrapper');

    if (!adminToken) {
        alert('Ошибка: Вы не авторизованы. Пожалуйста, сначала войдите под учетной записью администратора.');
        if (wrapper) wrapper.classList.add('shake-animation');
        return;
    }

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const usernameInput = document.getElementById('usernameInput');
    const positionInput = document.getElementById('positionInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    const allInputBlocks = document.querySelectorAll('.input-block');
    allInputBlocks.forEach(block => block.classList.remove('error-active'));
    if (wrapper) wrapper.classList.remove('shake-animation');

    const firstNameValue = firstNameInput.value.trim();
    const lastNameValue = lastNameInput.value.trim();
    const usernameValue = usernameInput.value.trim();
    const positionValue = positionInput.value.trim();
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;
    const confirmPasswordValue = confirmPasswordInput.value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstNameValue) {
        triggerValidationError(firstNameInput.closest('.input-block'), wrapper);
        return;
    }

    if (!lastNameValue) {
        triggerValidationError(lastNameInput.closest('.input-block'), wrapper);
        return;
    }

    if (!usernameValue) {
        triggerValidationError(usernameInput.closest('.input-block'), wrapper);
        return;
    }

    if (!positionValue) {
        triggerValidationError(positionInput.closest('.input-block'), wrapper);
        return;
    }

    if (!emailPattern.test(emailValue)) {
        triggerValidationError(emailInput.closest('.input-block'), wrapper);
        return;
    }

    if (passwordValue.length < 6) {
        triggerValidationError(passwordInput.closest('.input-block'), wrapper);
        return;
    }

    if (passwordValue !== confirmPasswordValue) {
        triggerValidationError(confirmPasswordInput.closest('.input-block'), wrapper);
        return;
    }

    try {
        const registerUrl = 'http://127.0.0.1:8000/register/'; 
        const csrftoken = getCookie('csrftoken');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        };

        if (csrftoken) {
            headers['X-CSRFToken'] = csrftoken;
        }

        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                username: usernameValue,
                email: emailValue,
                password: passwordValue,
                first_name: firstNameValue,
                last_name: lastNameValue,
                position: positionValue,
                bio: ""
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(JSON.stringify(errorData) || 'Ошибка регистрации. Проверьте права доступа.');
        }

        showToast(`Пользователь ${usernameValue} успешно зарегистрирован!`);

        firstNameInput.value = '';
        lastNameInput.value = '';
        usernameInput.value = '';
        positionInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';

    } catch (error) {
        console.error(error);
        alert(error.message);
        if (wrapper) wrapper.classList.add('shake-animation');
    }
});

function triggerValidationError(inputBlock, wrapperElement) {
    setTimeout(() => {
        if (inputBlock) inputBlock.classList.add('error-active');
        if (wrapperElement) wrapperElement.classList.add('shake-animation');
    }, 10);
}
