document.addEventListener('DOMContentLoaded', function() {
    console.log('Админка загружена');
    loadApplications();
});

function loadApplications() {
    fetch('/admin_data')
        .then(response => response.json())
        .then(data => {
            console.log('Получены данные:', data);
            displayApplications(data);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            document.querySelector('.applications').innerHTML = 
                'Ошибка загрузки: ' + error.message;
        });
}

function displayApplications(applications) {
    const container = document.querySelector('.applications');
    
    if (!applications || applications.length === 0) {
        container.innerHTML = '<p>Нет заявок</p>';
        return;
    }

    let html = `
        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; border: 1px solid #ddd;">ID</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Имя</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Email</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Услуга</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Сообщение</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Дата</th>
                </tr>
            </thead>
            <tbody>
    `;

    applications.forEach(app => {
        html += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${app.id || ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${app.c_name || ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${app.email || ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${app.serv_type || ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${app.c_message || ''}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${app.created_at || ''}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <p><strong>Всего заявок: ${applications.length}</strong></p>
    `;

    container.innerHTML = html;
}

function clearApplications() {
    if (confirm('Вы уверены что хотите удалить ВСЕ заявки? Это действие нельзя отменить!')) {
        fetch('/admin_data/clear', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            alert(data.message + ' (удалено: ' + data.deleted_count + ' заявок)');
            loadApplications(); 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при очистке: ' + error.message);
        });
    }
}