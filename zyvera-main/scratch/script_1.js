

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "";
}

        // Setup mobile sidebar toggle behavior
        const toggleBtn = document.getElementById('mobile-sidebar-toggle');
        const sidebarEl = document.querySelector('.sidebar');
        if (toggleBtn && sidebarEl) {
            toggleBtn.onclick = function(e) {
                e.stopPropagation();
                sidebarEl.classList.toggle('mobile-active');
                if (sidebarEl.classList.contains('mobile-active')) {
                    toggleBtn.textContent = "✖ Close Menu";
                    toggleBtn.style.background = "#0f172a";
                } else {
                    toggleBtn.textContent = "📚 Open Course Menu";
                    toggleBtn.style.background = "var(--accent-red)";
                }
            };
            
            // Close sidebar when tapping elsewhere on mobile
            document.addEventListener('click', function(e) {
                if (window.innerWidth < 768 && sidebarEl.classList.contains('mobile-active')) {
                    if (!sidebarEl.contains(e.target) && e.target !== toggleBtn) {
                        sidebarEl.classList.remove('mobile-active');
                        toggleBtn.textContent = "📚 Open Course Menu";
                        toggleBtn.style.background = "var(--accent-red)";
                    }
                }
            });
            
            // Close sidebar when clicking any navigation link on mobile
            sidebarEl.addEventListener('click', function(e) {
                if (window.innerWidth < 768 && e.target.classList.contains('nav-item')) {
                    sidebarEl.classList.remove('mobile-active');
                    toggleBtn.textContent = "📚 Open Course Menu";
                    toggleBtn.style.background = "var(--accent-red)";
                }
            });
        }
    