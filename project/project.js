document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'http://127.0.0.1:8000';

    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    const portfolioGrid = document.getElementById('portfolio-grid');

    const backdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');

    const mLoader = document.getElementById('modal-loader');
    const mMainData = document.getElementById('modal-main-data');

    const loginBtn = document.getElementById('login-btn');
    const profileBlock = document.getElementById('user-profile-block');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (token && userData) {
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
                if (user.avatar.startsWith('http')) {
                    headerAvatar.src = user.avatar;
                } else {
                    headerAvatar.src = `${API_URL}${user.avatar}`;
                }
            }

        } catch (error) {
            console.error(error);
        }
    } else {
        if (loginBtn) {
            loginBtn.style.display = 'flex';
        }

        if (profileBlock) {
            profileBlock.style.display = 'none';
        }
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

    const logoutButton = document.getElementById('logout-btn');

    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userRole');

            window.location.href = '../dls/auth.html';
        });
    }

    let projects = [];

    try {
        const response = await fetch(`${API_URL}/projects/`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Ошибка загрузки проектов: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            projects = data;
        } else if (Array.isArray(data.results)) {
            projects = data.results;
        }

    } catch (error) {
        console.error(error);
    }

    if (!portfolioGrid) {
        return;
    }

    portfolioGrid.innerHTML = '';

    if (projects.length === 0) {
        portfolioGrid.innerHTML = `
            <p style="
                color: #64748b;
                grid-column: 1/-1;
                text-align: center;
            ">
                Проекты не найдены.
            </p>
        `;

        return;
    }

    projects.forEach(project => {

        const projectCard = document.createElement('div');

        projectCard.className = 'project-card';
        projectCard.style.cursor = 'pointer';

        projectCard.innerHTML = `
            <div class="card-top-meta">

                <div class="card-custom-icon">
                    ${project.icon || '🚀'}
                </div>

                <span class="card-category-tag">
                    ${project.category_display || 'Разработка'}
                </span>

            </div>

            <div class="card-body-content">

                <h3>
                    ${project.title || 'Без названия'}
                </h3>

                <p class="card-desc">
                    Статус:
                    ${project.status_display || 'В разработке'}
                    <br>
                    Участников:
                    ${project.members_count || 0}
                </p>

            </div>
        `;

        projectCard.addEventListener('click', async () => {

            if (!backdrop) {
                return;
            }

            backdrop.style.display = 'flex';

            if (mLoader) {
                mLoader.style.display = 'block';
                mLoader.innerHTML = `
                    <p style="color: #6366f1; font-weight: 600;">
                        Загрузка проекта...
                    </p>
                `;
            }

            if (mMainData) {
                mMainData.style.display = 'none';
            }

            try {

                const response = await fetch(
                    `${API_URL}/projects/${project.id}/`,
                    {
                        method: 'GET',
                        headers: headers
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Ошибка проекта: ${response.status}`
                    );
                }

                const data = await response.json();

                const icon = document.getElementById('m-icon');
                const category = document.getElementById('m-category');
                const title = document.getElementById('m-title');
                const description = document.getElementById('m-desc');
                const status = document.getElementById('m-status');
                const tasks = document.getElementById('m-tasks');
                const participants =
                    document.getElementById('m-participants');

                if (icon) {
                    icon.textContent = data.icon || '🚀';
                }

                if (category) {
                    category.textContent =
                        data.category_display || 'Разработка';
                }

                if (title) {
                    title.textContent =
                        data.title || 'Без названия';
                }

                if (description) {
                    description.textContent =
                        data.description ||
                        'Описание отсутствует.';
                }

                if (status) {
                    status.textContent =
                        data.status_display || 'В работе';
                }

                if (tasks) {
                    tasks.textContent =
                        data.tasks_count || 0;
                }

                if (participants) {
                    participants.innerHTML = '';

                    try {

                        const membersResponse = await fetch(
                            `${API_URL}/project_members/`,
                            {
                                method: 'GET',
                                headers: headers
                            }
                        );

                        if (membersResponse.ok) {

                            const membersData =
                                await membersResponse.json();

                            let members = [];

                            if (Array.isArray(membersData)) {
                                members = membersData;
                            } else if (
                                Array.isArray(membersData.results)
                            ) {
                                members = membersData.results;
                            }

                            const projectMembers =
                                members.filter(member => {

                                    let projectId = null;

                                    if (
                                        typeof member.project === 'number'
                                    ) {
                                        projectId =
                                            member.project;
                                    }

                                    if (
                                        typeof member.project === 'object' &&
                                        member.project
                                    ) {
                                        projectId =
                                            member.project.id;
                                    }

                                    return Number(projectId) ===
                                        Number(data.id);
                                });

                            projectMembers.forEach(member => {

                                const memberName =
                                    member.user?.first_name ||
                                    member.user?.username ||
                                    `Пользователь ${member.user_id}`;

                                const memberRole =
                                    member.role_in_project ||
                                    'Участник';

                                const memberElement =
                                    document.createElement('div');

                                memberElement.style.cssText = `
                                    padding: 8px 12px;
                                    border-radius: 10px;
                                    background: rgba(99,102,241,0.08);
                                    border: 1px solid rgba(99,102,241,0.15);
                                    color: #cbd5e1;
                                `;

                                memberElement.textContent =
                                    `${memberName} — ${memberRole}`;

                                participants.appendChild(
                                    memberElement
                                );
                            });

                            if (projectMembers.length === 0) {
                                participants.textContent =
                                    'Участники не указаны';
                            }
                        }

                    } catch (error) {
                        console.error(
                            'Ошибка загрузки участников:',
                            error
                        );

                        participants.textContent =
                            'Участники не загружены';
                    }
                }

                if (mLoader) {
                    mLoader.style.display = 'none';
                }

                if (mMainData) {
                    mMainData.style.display = 'block';
                }

            } catch (error) {

                console.error(error);

                if (mLoader) {
                    mLoader.innerHTML = `
                        <p style="color: #ef4444;">
                            Не удалось загрузить проект
                        </p>
                    `;
                }
            }
        });

        portfolioGrid.appendChild(projectCard);
    });
});