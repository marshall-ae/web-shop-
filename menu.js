document.addEventListener('DOMContentLoaded', function() {
    // Burger menu toggle
    const burgerIcon = document.getElementById('burger-icon');
    const navContainer = document.getElementById('nav-container');
    
    if (burgerIcon && navContainer) {
      burgerIcon.addEventListener('click', function() {
        navContainer.classList.toggle('active');
      });
    }
    
    // Dropdown menu toggle
    const produktyBtn = document.getElementById('produkty-btn');
    const dropdown = produktyBtn ? produktyBtn.closest('.dropdown') : null;
    
    if (produktyBtn && dropdown) {
      produktyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('dropdown-active');
        
        // Close other dropdowns if any
        document.querySelectorAll('.dropdown-active').forEach(function(item) {
          if (item !== dropdown) {
            item.classList.remove('dropdown-active');
          }
        });
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('dropdown-active');
        }
      });
    }
    
    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && navContainer) {
        navContainer.classList.remove('active');
      }
    });
  });