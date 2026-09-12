document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('accessToken');

    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const headerName = document.getElementById('user-name');
    const headerPosition = document.getElementById('user-position');

    const cardFullName = document.getElementById('card-full-name');
    const cardRoleTag = document.getElementById('card-role-tag');
    const cardPositionDisplay = document.getElementById('card-position-display');

    const formFirstName = document.getElementById('profile-firstname');
    const formLastName = document.getElementById('profile-lastname');
    const formUsername = document.getElementById('profile-username');
    const formEmail = document.getElementById('profile-email');
    const formPosition = document.getElementById('profile-position');
    const formBio = document.getElementById('profile-bio');
    const profileForm = document.getElementById('profileForm');

    const adminPanel = document.getElementById('admin-actions-panel');

    let profileData;

    try {
        const response = await fetch(`${API_URL}/profile/`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        profileData = await response.json();

        localStorage.setItem('user', JSON.stringify(profileData));

        const firstName = profileData.first_name || 'Пользователь';
        const lastName = profileData.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (headerName) {
            headerName.textContent = fullName;
        }

        if (headerPosition) {
            headerPosition.textContent =
                profileData.position || 'Сотрудник';
        }

        if (cardFullName) {
            cardFullName.textContent = fullName;
        }

        if (cardPositionDisplay) {
            cardPositionDisplay.textContent =
                profileData.position || 'Должность не указана';
        }

        if (cardRoleTag) {
            if (profileData.user_role === 'admin') {
                cardRoleTag.textContent = '// Администратор';
            } else {
                cardRoleTag.textContent = '// Сотрудник';
            }
        }

        if (formFirstName) {
            formFirstName.value = profileData.first_name || '';
        }

        if (formLastName) {
            formLastName.value = profileData.last_name || '';
        }

        if (formUsername) {
            formUsername.value = profileData.username || '';
        }

        if (formEmail) {
            formEmail.value = profileData.email || '';
        }

        if (formPosition) {
            formPosition.value = profileData.position || '';
        }

        if (formBio) {
            formBio.value = profileData.bio || '';
        }

        if (profileData.user_role === 'admin' && adminPanel) {
            adminPanel.innerHTML = `
                <button id="members-btn" class="btn-admin-panel">
                    Участники проекта
                </button>

                <a href="../task/task_create.html"
                   class="btn-admin-panel btn-admin-amber">
                    Создать задачу
                </a>
            `;

            adminPanel.style.display = 'flex';
        }

    } catch (error) {
        console.error(error);
        alert('Не удалось загрузить профиль.');
        return;
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const updatedData = {
                first_name: formFirstName ? formFirstName.value.trim() : '',
                last_name: formLastName ? formLastName.value.trim() : '',
                username: formUsername ? formUsername.value.trim() : '',
                position: formPosition ? formPosition.value.trim() : '',
                bio: formBio ? formBio.value.trim() : ''
            };

            try {
                const response = await fetch(`${API_URL}/profile/`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    const errorData =
                        await response.json().catch(() => ({}));

                    throw new Error(JSON.stringify(errorData));
                }

                window.location.reload();

            } catch (error) {
                console.error(error);
                alert('Не удалось сохранить изменения.');
            }
        });
    }

    if (profileData.user_role === 'admin') {
        createMembersModal();
    }

    function createMembersModal() {
        const membersButton =
            document.getElementById('members-btn');

        if (!membersButton) {
            return;
        }

        const modal = document.createElement('div');

        modal.id = 'members-modal';

        modal.innerHTML = `
            <div class="members-modal-content">

                <button id="members-close" class="members-close">
                    ×
                </button>

                <h2>Участники проекта</h2>

                <div class="members-add">

                    <input
                        type="number"
                        id="project-id"
                        placeholder="ID проекта"
                    >

                    <input
                        type="number"
                        id="member-user-id"
                        placeholder="ID пользователя"
                    >

                    <input
                        type="text"
                        id="member-role"
                        placeholder="Роль в проекте"
                    >

                    <button id="add-member-btn">
                        Добавить
                    </button>

                </div>

                <div id="member-add-error"></div>

                <div id="members-list">
                    Загрузка...
                </div>

            </div>
        `;

        document.body.appendChild(modal);

        membersButton.onclick = async () => {
            modal.classList.add('active');
            await loadProjectMembers();
        };

        document.getElementById('members-close').onclick = () => {
            modal.classList.remove('active');
        };

        document.getElementById('add-member-btn').onclick = addMember;
    }

    async function loadProjectMembers() {
        const projectId =
            document.getElementById('project-id').value.trim();

        const membersList =
            document.getElementById('members-list');

        if (!projectId) {
            membersList.innerHTML =
                '<p>Сначала укажи ID проекта.</p>';
            return;
        }

        membersList.innerHTML = 'Загрузка...';

        try {
            const response = await fetch(
                `${API_URL}/project_members/`,
                {
                    method: 'GET',
                    headers: headers
                }
            );

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}`);
            }

            const data = await response.json();

            const members = Array.isArray(data)
                ? data
                : data.results || [];

            const projectMembers = members.filter(member => {
                return Number(member.project) === Number(projectId);
            });

            renderMembers(projectMembers);

        } catch (error) {
            console.error(error);

            membersList.innerHTML =
                '<p>Не удалось загрузить участников.</p>';
        }
    }

    function renderMembers(members) {
        const membersList =
            document.getElementById('members-list');

        membersList.innerHTML = '';

        if (members.length === 0) {
            membersList.innerHTML =
                '<p>В этом проекте пока нет участников.</p>';

            return;
        }

        members.forEach(member => {
            const item = document.createElement('div');

            item.className = 'member-item';

            const user = member.user || {};

            const fullName =
                `${user.first_name || ''} ${user.last_name || ''}`.trim();

            item.innerHTML = `
                <div class="member-info">

                    <strong>
                        ${fullName || user.username || `Пользователь #${member.user_id}`}
                    </strong>

                    <span>
                        @${user.username || 'unknown'}
                    </span>

                    <span>
                        ${user.position || 'Должность не указана'}
                    </span>

                    <span>
                        Роль: ${member.role_in_project || 'Участник'}
                    </span>

                </div>

                <button class="delete-member-btn">
                    Удалить
                </button>
            `;

            const deleteButton =
                item.querySelector('.delete-member-btn');

            deleteButton.onclick = async () => {
                await deleteMember(member.id);
            };

            membersList.appendChild(item);
        });
    }

    async function addMember() {
        const projectId =
            document.getElementById('project-id').value.trim();

        const userId =
            document.getElementById('member-user-id').value.trim();

        const role =
            document.getElementById('member-role').value.trim();

        const errorBlock =
            document.getElementById('member-add-error');

        errorBlock.textContent = '';

        if (!projectId) {
            errorBlock.textContent =
                'Укажи ID проекта.';

            return;
        }

        if (!userId) {
            errorBlock.textContent =
                'Укажи ID пользователя.';

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/project_members/`,
                {
                    method: 'POST',
                    headers: headers,

                    body: JSON.stringify({
                        project: Number(projectId),
                        user_id: Number(userId),
                        role_in_project: role
                    })
                }
            );

            const data =
                await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error(data);

                errorBlock.textContent =
                    JSON.stringify(data);

                return;
            }

            document.getElementById('member-user-id').value = '';
            document.getElementById('member-role').value = '';

            await loadProjectMembers();

        } catch (error) {
            console.error(error);

            errorBlock.textContent =
                'Ошибка соединения с сервером.';
        }
    }

    async function deleteMember(memberId) {
        try {
            const response = await fetch(
                `${API_URL}/project_members/${memberId}/`,
                {
                    method: 'DELETE',
                    headers: headers
                }
            );

            if (!response.ok) {
                const data =
                    await response.json().catch(() => ({}));

                console.error(data);

                throw new Error(
                    `Ошибка удаления: ${response.status}`
                );
            }

            await loadProjectMembers();

        } catch (error) {
            console.error(error);
            alert('Не удалось удалить участника.');
        }
    }

    const logoutButton =
        document.getElementById('logout-btn');

    if (logoutButton) {
        logoutButton.onclick = async (event) => {
            event.preventDefault();

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userRole');

            window.location.href = '../dls/auth.html';
        };
    }
});