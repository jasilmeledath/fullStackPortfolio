// DOM Elements
const addUserBtn = document.getElementById('addUserBtn');
const addUserModal = document.getElementById('addUserModal');
const cancelAddUser = document.getElementById('cancelAddUser');
const addUserForm = document.getElementById('addUserForm');
const resetPasswordModal = document.getElementById('resetPasswordModal');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const cancelReset = document.getElementById('cancelReset');
const resetUserId = document.getElementById('resetUserId');

// Show Add User Modal
addUserBtn.addEventListener('click', () => {
    addUserModal.classList.remove('hidden');
    addUserModal.classList.add('flex');
});

// Hide Add User Modal
cancelAddUser.addEventListener('click', () => {
    addUserModal.classList.add('hidden');
    addUserModal.classList.remove('flex');
    addUserForm.reset();
});

// Add New Admin User
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addUserForm);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Admin user added successfully');
            window.location.reload();
        } else {
            alert(data.message || 'Failed to add admin user');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add admin user');
    }
});

// Delete User
document.querySelectorAll('.delete-user').forEach(button => {
    button.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        const userId = button.dataset.id;
        
        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('User deleted successfully');
                window.location.reload();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    });
});

// Show Reset Password Modal
document.querySelectorAll('.reset-password').forEach(button => {
    button.addEventListener('click', () => {
        resetUserId.value = button.dataset.id;
        resetPasswordModal.classList.remove('hidden');
        resetPasswordModal.classList.add('flex');
    });
});

// Hide Reset Password Modal
cancelReset.addEventListener('click', () => {
    resetPasswordModal.classList.add('hidden');
    resetPasswordModal.classList.remove('flex');
    resetPasswordForm.reset();
});

// Reset Password
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = resetUserId.value;
    const newPassword = resetPasswordForm.querySelector('[name="newPassword"]').value;
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });
        
        if (response.ok) {
            alert('Password reset successfully');
            resetPasswordModal.classList.add('hidden');
            resetPasswordModal.classList.remove('flex');
            resetPasswordForm.reset();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to reset password');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('Failed to reset password');
    }
}); 