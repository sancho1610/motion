document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'http://127.0.0.1:8000';

    const token = localStorage.getItem('accessToken');

    console.log('Есть accessToken:', !!token);

    const teamGrid = document.getElementById('team-grid');
    const backdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalContent = document.getElementById('modal-content');

    const loginBtn = document.getElementById('login-btn');
    const profileBlock = document.getElementById('user-profile-block');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    if (!token) {
        console.log('accessToken отсутствует');

        if (teamGrid) {
            teamGrid.innerHTML = `
                <p style="color:#ef4444;text-align:center;">
                    Необходимо войти в аккаунт.
                </p>
            `;
        }

        return;
    }

    const userData = localStorage.getItem('user');

    if (userData) {
        try {
            const user = JSON.parse(userData);

            if (loginBtn) {
                loginBtn.style.display = 'none';
            }

            if (profileBlock) {
                profileBlock.style.display = 'flex';
            }

            const headerName = document.getElementById('user-name');
            const headerPosition = document.getElementById('user-position');
            const headerAvatar = document.getElementById('user-avatar');

            if (headerName) {
                headerName.textContent =
                    `${user.first_name || ''} ${user.last_name || ''}`.trim();
            }

            if (headerPosition) {
                headerPosition.textContent =
                    user.position || 'Сотрудник';
            }

            if (headerAvatar && user.avatar) {
                headerAvatar.src =
                    user.avatar.startsWith('http')
                        ? user.avatar
                        : API_URL + user.avatar;
            }

        } catch (error) {
            console.error('Ошибка пользователя:', error);
        }
    }
const logoutButton = document.getElementById('logout-btn');

if (logoutButton) {
    logoutButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const refreshToken = localStorage.getItem('refreshToken');

        try {
            const response = await fetch(`${API_URL}/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            console.log('Logout status:', response.status);

        } catch (error) {
            console.error('Ошибка выхода:', error);
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        window.location.href = '../dls/auth.html';
    });
}
    if (modalClose && backdrop) {
        modalClose.addEventListener('click', () => {
            backdrop.style.display = 'none';
        });

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                backdrop.style.display = 'none';
            }
        });
    }

    try {
        const response = await fetch(`${API_URL}/team_members/`, {
            method: 'GET',
            headers: headers
        });

        console.log('team_members status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();

            console.log('Ответ сервера:', errorText);

            throw new Error(`Сервер вернул статус: ${response.status}`);
        }

        const data = await response.json();

        console.log('Данные team_members:', data);

        const members = Array.isArray(data)
            ? data
            : data.results || [];

        teamGrid.innerHTML = '';

        if (members.length === 0) {
            teamGrid.innerHTML = `
                <p style="
                    color:#64748b;
                    grid-column:1/-1;
                    text-align:center;
                ">
                    Список сотрудников пуст.
                </p>
            `;

            return;
        }

        const gradients = [
            'grad-1',
            'grad-2',
            'grad-3',
            'grad-4'
        ];

        members.forEach((member, index) => {

            const targetUser = member.user;

            if (!targetUser) {
                return;
            }

            const card = document.createElement('div');

            card.className = 'team-card';
            card.style.cursor = 'pointer';

            const gradient =
                gradients[index % gradients.length];

            let avatarHTML = '';

            if (targetUser.avatar) {

                const avatarUrl =
                    targetUser.avatar.startsWith('http')
                        ? targetUser.avatar
                        : API_URL + targetUser.avatar;

                avatarHTML = `
                    <img
                        src="${avatarUrl}"
                        alt="Avatar"
                        class="avatar-img-cyber"
                    >
                `;

            } else {

                const firstName =
                    targetUser.first_name || '';

                const lastName =
                    targetUser.last_name || '';

                const firstLetter =
                    firstName.charAt(0).toUpperCase() || 'M';

                const secondLetter =
                    lastName.charAt(0).toUpperCase() ||
                    firstName.charAt(1).toUpperCase() ||
                    '';

                avatarHTML = `
                    <div class="avatar-bg ${gradient}">
                        ${firstLetter}${secondLetter}
                    </div>
                `;
            }

            const fullName =
                `${targetUser.first_name || 'Сотрудник'} ${targetUser.last_name || ''}`.trim();

            const position =
                targetUser.position || 'Сотрудник';

            card.innerHTML = `
                <div class="avatar-wrapper">
                    ${avatarHTML}

                    <div class="team-socials">
                        <a href="#tg" class="social-icon">TG</a>
                        <a href="#gh" class="social-icon">GH</a>
                        <a href="#ln" class="social-icon">LN</a>
                    </div>
                </div>

                <div class="team-info">
                    <h3>${fullName}</h3>
                    <span class="team-role">${position}</span>
                </div>
            `;

            card.addEventListener('click', () => {

                if (!backdrop || !modalContent) {
                    return;
                }

                let avatarModal = avatarHTML;

                if (targetUser.avatar) {

                    const avatarUrl =
                        targetUser.avatar.startsWith('http')
                            ? targetUser.avatar
                            : API_URL + targetUser.avatar;

                    avatarModal = `
                        <img
                            src="${avatarUrl}"
                            class="modal-avatar-img"
                            alt="Avatar"
                        >
                    `;
                }

                modalContent.innerHTML = `
                    <div class="modal-profile-header">

                        <div class="modal-avatar-box">
                            ${avatarModal}
                        </div>

                        <div class="modal-profile-info">

                            <h2>${fullName}</h2>

                            <span class="modal-profile-role">
                                ${position}
                            </span>

                        </div>

                    </div>

                    <div class="modal-profile-body">

                        <h4>Роль в команде</h4>

                        <p>
                            ${member.role_in_team || 'Участник'}
                        </p>

                        <h4>О себе</h4>

                        <p>
                            ${targetUser.bio || 'Описание отсутствует.'}
                        </p>

                    </div>
                `;

                backdrop.style.display = 'flex';
            });

            teamGrid.appendChild(card);
        });

    } catch (error) {

        console.error('Ошибка:', error);

        if (teamGrid) {
            teamGrid.innerHTML = `
                <p style="
                    color:#ef4444;
                    grid-column:1/-1;
                    text-align:center;
                ">
                    Ошибка загрузки сотрудников: ${error.message}
                </p>
            `;
        }
    }
});