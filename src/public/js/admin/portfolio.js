// Load portfolio data
async function loadPortfolio() {
    try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        
        if (response.ok) {
            // Populate general information
            document.getElementById('siteTitle').value = data.data.siteTitle;
            document.getElementById('headerCaption').value = data.data.headerCaption;
            document.getElementById('shortDescription').value = data.data.shortDescription;
            document.getElementById('aboutMe').value = data.data.aboutMe;

            // Populate skills
            const skillsList = document.getElementById('skillsList');
            skillsList.innerHTML = data.data.skills.map(skill => `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <img src="${skill.iconUrl}" alt="${skill.name}" width="24" height="24" class="me-2">
                        ${skill.name} (${skill.proficiency}%)
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="removeSkill('${skill._id}')">Remove</button>
                </div>
            `).join('');

            // Populate projects
            const projectsList = document.getElementById('projectsList');
            projectsList.innerHTML = data.data.projects.map(project => `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <img src="${project.coverImageUrl}" class="card-img-top" alt="${project.title}">
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <p class="card-text">${project.caption}</p>
                            <button class="btn btn-danger btn-sm" onclick="removeProject('${project._id}')">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
        alert('Error loading portfolio data');
    }
}

// Save general information
document.getElementById('generalInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/portfolio', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                siteTitle: document.getElementById('siteTitle').value,
                headerCaption: document.getElementById('headerCaption').value,
                shortDescription: document.getElementById('shortDescription').value,
                aboutMe: document.getElementById('aboutMe').value
            })
        });

        if (response.ok) {
            alert('Portfolio updated successfully');
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating portfolio');
        }
    } catch (error) {
        console.error('Error updating portfolio:', error);
        alert('Error updating portfolio');
    }
});

// Add skill
document.getElementById('addSkillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/portfolio/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                iconUrl: e.target.iconUrl.value,
                name: e.target.name.value,
                proficiency: parseInt(e.target.proficiency.value)
            })
        });

        if (response.ok) {
            e.target.reset();
            loadPortfolio();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding skill');
        }
    } catch (error) {
        console.error('Error adding skill:', error);
        alert('Error adding skill');
    }
});

// Add project
document.getElementById('addProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/portfolio/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                coverImageUrl: e.target.coverImageUrl.value,
                title: e.target.title.value,
                caption: e.target.caption.value,
                description: e.target.description.value,
                repoLink: e.target.repoLink.value
            })
        });

        if (response.ok) {
            e.target.reset();
            loadPortfolio();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding project');
        }
    } catch (error) {
        console.error('Error adding project:', error);
        alert('Error adding project');
    }
});

// Remove skill
async function removeSkill(skillId) {
    if (!confirm('Are you sure you want to remove this skill?')) return;
    
    try {
        const response = await fetch(`/api/portfolio/skills/${skillId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadPortfolio();
        } else {
            const data = await response.json();
            alert(data.message || 'Error removing skill');
        }
    } catch (error) {
        console.error('Error removing skill:', error);
        alert('Error removing skill');
    }
}

// Remove project
async function removeProject(projectId) {
    if (!confirm('Are you sure you want to remove this project?')) return;
    
    try {
        const response = await fetch(`/api/portfolio/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadPortfolio();
        } else {
            const data = await response.json();
            alert(data.message || 'Error removing project');
        }
    } catch (error) {
        console.error('Error removing project:', error);
        alert('Error removing project');
    }
}

// Load portfolio data on page load
document.addEventListener('DOMContentLoaded', loadPortfolio); 