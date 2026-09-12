document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    const loginBtn = document.getElementById('login-btn');
    const profileBlock = document.getElementById('user-profile-block');

    if (token && userData) {
        try {
            const user = JSON.parse(userData);

            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBlock) profileBlock.style.display = 'flex';

            const nameElement = document.getElementById('user-name');
            const positionElement = document.getElementById('user-position');
            const avatarElement = document.getElementById('user-avatar');

            if (nameElement) {
                nameElement.textContent = [
                    user.first_name,
                    user.last_name
                ].filter(Boolean).join(' ') || 'Пользователь';
            }

            if (positionElement) {
                positionElement.textContent = user.position || 'Сотрудник';
            }

            if (avatarElement) {
                if (user.avatar) {
                    avatarElement.src = `${API_URL}${user.avatar}`;
                    avatarElement.style.display = 'block';
                } else {
                    avatarElement.style.display = 'none';
                }
            }

            const hubName = document.querySelector('.hub-name');
            const hubAvatar = document.querySelector('.user-badge-avatar');
            const ratingWidget = document.querySelector('.widget-num');

            if (hubName && user.team) {
                hubName.textContent = user.team;
            }

            if (hubAvatar) {
                if (user.avatar) {
                    hubAvatar.innerHTML = `
                        <img
                            src="${API_URL}${user.avatar}"
                            style="width:100%;height:100%;border-radius:50%;object-fit:cover;"
                        >
                    `;
                    hubAvatar.style.background = 'transparent';
                } else {
                    hubAvatar.innerHTML = '';
                    hubAvatar.textContent = user.first_name
                        ? user.first_name.charAt(0).toUpperCase()
                        : 'M';
                }
            }

            if (
                ratingWidget &&
                user.average_rating !== undefined &&
                user.average_rating !== null
            ) {
                ratingWidget.innerHTML = `
                    ${user.average_rating}
                    <span class="max-num">/ 100</span>
                `;
            }

        } catch (error) {
            console.error(error);
        }
    } else {
        if (profileBlock) profileBlock.style.display = 'none';
        if (loginBtn) loginBtn.style.display = '';
    }

    const logoutButton = document.getElementById('logout-btn');

    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();

            const refreshToken = localStorage.getItem('refreshToken');

            try {
                if (refreshToken) {
                    await fetch(`${API_URL}/logout/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            refresh: refreshToken
                        })
                    });
                }
            } catch (error) {
                console.error(error);
            }

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            window.location.reload();
        });
    }

    const modal = document.getElementById('admin-modal-backdrop');
    const closeButton = document.getElementById('admin-modal-close');

    const memberForm = document.getElementById('member-form');
    const projectForm = document.getElementById('project-form');
    const taskForm = document.getElementById('task-form');

    const openMember = document.getElementById('open-member-modal');
    const openProject = document.getElementById('open-project-modal');
    const openTask = document.getElementById('open-task-modal');

    const message = document.getElementById('admin-message');

    if (!token) {
        const panel = document.getElementById('admin-panel');

        if (panel) {
            panel.style.display = 'none';
        }

        return;
    }

    function openModal(form) {
        if (!form || !modal) return;

        if (memberForm) memberForm.classList.remove('active');
        if (projectForm) projectForm.classList.remove('active');
        if (taskForm) taskForm.classList.remove('active');

        form.classList.add('active');
        modal.classList.add('active');

        if (message) {
            message.textContent = '';
            message.className = 'admin-message';
        }
    }

    if (openMember && memberForm) {
        openMember.addEventListener('click', () => {
            openModal(memberForm);
        });
    }

    if (openProject && projectForm) {
        openProject.addEventListener('click', () => {
            openModal(projectForm);
        });
    }

    if (openTask && taskForm) {
        openTask.addEventListener('click', () => {
            openModal(taskForm);
        });
    }

    if (closeButton && modal) {
        closeButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    function showMessage(text, type) {
        if (!message) return;

        message.textContent = text;
        message.className = `admin-message ${type}`;
    }

    if (memberForm) {
        memberForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const userId = Number(
                document.getElementById('member-user-id').value
            );

            const teamId = Number(
                document.getElementById('member-team-id').value
            );

            const role =
                document.getElementById('member-role').value;

            try {
                const response = await fetch(
                    `${API_URL}/team_members/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            team: teamId,
                            user_id: userId,
                            role_in_team: role
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || 'Не удалось добавить участника'
                    );
                }

                showMessage(
                    'Участник успешно добавлен',
                    'success'
                );

                memberForm.reset();

            } catch (error) {
                console.error(error);

                showMessage(
                    error.message,
                    'error'
                );
            }
        });
    }

    if (projectForm) {
        projectForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title =
                document.getElementById('project-title').value;

            const description =
                document.getElementById('project-description').value;

            const status =
                document.getElementById('project-status').value;

            try {
                const response = await fetch(
                    `${API_URL}/projects_manage/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            status
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || 'Не удалось создать проект'
                    );
                }

                showMessage(
                    'Проект успешно создан',
                    'success'
                );

                projectForm.reset();

            } catch (error) {
                console.error(error);

                showMessage(
                    error.message,
                    'error'
                );
            }
        });
    }

    if (taskForm) {
        taskForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title =
                document.getElementById('task-title').value;

            const description =
                document.getElementById('task-description').value;

            const priority =
                document.getElementById('task-priority').value;

            const status =
                document.getElementById('task-status').value;

            const project =
                Number(
                    document.getElementById('task-project').value
                );

            const userId =
                document.getElementById('task-user').value;

            const assignedTo = [];

            if (userId) {
                assignedTo.push(Number(userId));
            }

            try {
                const response = await fetch(
                    `${API_URL}/tasks_manage/`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            priority,
                            status,
                            project,
                            assigned_to: assignedTo
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || 'Не удалось создать задачу'
                    );
                }

                showMessage(
                    'Задача успешно создана',
                    'success'
                );

                taskForm.reset();

            } catch (error) {
                console.error(error);

                showMessage(
                    error.message,
                    'error'
                );
            }
        });
    }
});
