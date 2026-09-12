document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    const loginBtn = document.getElementById('login-btn');
    const profileBlock = document.getElementById('user-profile-block');

    if (token && userData) {
        const user = JSON.parse(userData);

        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBlock) profileBlock.style.display = 'flex';

        const nameElement = document.getElementById('user-name');
        const positionElement = document.getElementById('user-position');
        const avatarElement = document.getElementById('user-avatar');

        if (nameElement) nameElement.textContent = `${user.first_name} ${user.last_name || ''}`;
        if (positionElement) positionElement.textContent = user.position || 'Сотрудник';
        if (avatarElement) avatarElement.src = `http://127.0.0.1:8000${user.avatar}`;

        const hubName = document.querySelector('.hub-name');
        const hubAvatar = document.querySelector('.user-badge-avatar');
        const ratingWidget = document.querySelector('.widget-num');

        if (hubName && user.team) {
            hubName.textContent = user.team;
        }

        if (hubAvatar) {
            if (user.avatar) {
                hubAvatar.innerHTML = `<img src="http://127.0.0.1:8000${user.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                hubAvatar.style.background = 'transparent';
            } else {
                hubAvatar.textContent = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'M';
            }
        }

        if (ratingWidget && user.average_rating) {
            ratingWidget.innerHTML = `${user.average_rating} <span class="max-num">/ 100</span>`;
        }
    }

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();

            const refreshToken = localStorage.getItem('refreshToken');

            try {
                await fetch('http://127.0.0', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({
                        refresh: refreshToken
                    })
                });
            } catch (error) {
                console.error('Ошибка запроса на бэкенд при логауте:', error);
            }

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            window.location.reload();
        });
    }
});
    

document.addEventListener('DOMContentLoaded', async () => {
    const footer = document.createElement('footer');

    footer.className = 'cyber-footer';
    footer.id = 'contacts';

    footer.innerHTML = `
        <div class="footer-container">

            <div class="footer-brand">

                <a href="/" class="footer-logo">

                    <div class="footer-logo-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>

                    <div class="footer-brand-text">
                        <span>Motion Community</span>
                        <small>DIGITAL ECOSYSTEM</small>
                    </div>

                </a>

                <p>
                    Интеллектуальная среда для команд,
                    проектов и развития IT-специалистов.
                </p>

            </div>


            <div class="footer-column">

                <span class="footer-title">
                    Навигация
                </span>

                <a href="/">
                    Главная
                </a>

                <a href="#about">
                    О нас
                </a>

                <a href="project/project.html">
                    Проекты
                </a>

                <a href="team/team.html">
                    Сотрудники
                </a>

            </div>


            <div class="footer-column">

                <span class="footer-title">
                    Система
                </span>

                <a href="dls/auth.html">
                    Личный кабинет
                </a>

                <a href="profile/profile.html">
                    Профиль
                </a>

                <a href="#contacts">
                    Контакты
                </a>

            </div>


            <div class="footer-column footer-contacts">

                <span class="footer-title">
                    Контакты
                </span>

                <a
                    href="#"
                    id="footer-email"
                    class="footer-contact"
                >
                    <span class="footer-contact-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                            <path d="m3 7 9 6 9-6"/>
                        </svg>
                    </span>

                    <span id="footer-email-text">
                        Загрузка...
                    </span>
                </a>


                <a
                    href="#"
                    id="footer-telegram"
                    class="footer-contact"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span class="footer-contact-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 3 3 10.5l7 2.5L12.5 20 16 14l5-11z"/>
                            <path d="m10 13 5-5"/>
                        </svg>
                    </span>

                    <span id="footer-telegram-text">
                        Загрузка...
                    </span>
                </a>


                <a
                    href="#"
                    id="footer-instagram"
                    class="footer-contact"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span class="footer-contact-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="5"/>
                            <circle cx="12" cy="12" r="4"/>
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                        </svg>
                    </span>

                    <span id="footer-instagram-text">
                        Загрузка...
                    </span>
                </a>


                <div class="footer-contact">

                    <span class="footer-contact-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"/>
                            <circle cx="12" cy="10" r="2.5"/>
                        </svg>
                    </span>

                    <span id="footer-location">
                        Загрузка...
                    </span>

                </div>

            </div>

        </div>


        <div class="footer-bottom">

            <span>
                © <span id="footer-year"></span> Motion Community
            </span>

            <span class="footer-line"></span>

            <span>
                ALL SYSTEMS OPERATIONAL
            </span>

        </div>
    `;

    document.body.appendChild(footer);


    try {
        const response = await fetch(
            'http://127.0.0.1:8000/site-info/'
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();


        const emailText =
            document.getElementById('footer-email-text');

        const emailLink =
            document.getElementById('footer-email');

        if (emailText && data.contact_email) {
            emailText.textContent =
                data.contact_email;
        }

        if (emailLink && data.contact_email) {
            emailLink.href =
                `mailto:${data.contact_email}`;
        }


        const telegramText =
            document.getElementById('footer-telegram-text');

        const telegramLink =
            document.getElementById('footer-telegram');

        if (telegramText && data.telegram) {
            telegramText.textContent =
                data.telegram;
        }

        if (telegramLink && data.telegram) {
            let telegram =
                data.telegram.trim();

            if (telegram.startsWith('@')) {
                telegram =
                    telegram.substring(1);
            }

            telegramLink.href =
                `https://t.me/${telegram}`;
        }


        const instagramText =
            document.getElementById('footer-instagram-text');

        const instagramLink =
            document.getElementById('footer-instagram');

        if (instagramText && data.instagram) {
            instagramText.textContent =
                data.instagram;
        }

        if (instagramLink && data.instagram) {
            let instagram =
                data.instagram.trim();

            if (instagram.startsWith('@')) {
                instagram =
                    instagram.substring(1);
            }

            instagramLink.href =
                `https://instagram.com/${instagram}`;
        }


        const location =
            document.getElementById('footer-location');

        if (location && data.location) {
            location.textContent =
                data.location;
        }

    } catch (error) {
        console.error(
            'Ошибка загрузки site-info:',
            error
        );
    }


    const footerYear =
        document.getElementById('footer-year');

    if (footerYear) {
        footerYear.textContent =
            new Date().getFullYear();
    }
});