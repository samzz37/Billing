    </div>
    <footer class="bg-dark text-white text-center py-3 mt-5">
        <p>© <?php echo date('Y'); ?> Shop Billing System. All rights reserved.<br>
				Created By Sam
	</p>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/script.js"></script>
    <script>
        function goBack() {
            // Check if we came from another page in this site
            if (document.referrer && document.referrer.indexOf(window.location.hostname) !== -1) {
                window.history.back();
            } else {
                // If came from external site or no referrer, go to home
                window.location.href = '../index.php';
            }
        }
        
        // Prevent form resubmission on refresh/back
        if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
        }
        
        // Add active class to current navigation item
        document.addEventListener('DOMContentLoaded', function() {
            const currentPage = window.location.pathname.split('/').pop();
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
            
            navLinks.forEach(link => {
                const linkPage = link.getAttribute('href').split('/').pop();
                if (currentPage === linkPage || (currentPage === '' && linkPage === 'index.php')) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        });
    </script>
</body>
</html>