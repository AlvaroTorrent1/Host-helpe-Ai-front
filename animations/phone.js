/* Intersection Observer JavaScript */
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
  
    document.querySelector('.chat-demo-section')?.classList.add('visible');
    document.querySelector('.iphone-frame')?.classList.add('visible');
    
    observer.observe(document.querySelector('.chat-demo-section'));
    observer.observe(document.querySelector('.iphone-frame'));
  });
  /* Add this JavaScript to your script */
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('.animate-section');
  const phones = document.querySelectorAll('.animate-phone');
  
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('show');
          }
      });
  }, { threshold: 0.2 });
  
  sections.forEach(section => observer.observe(section));
  phones.forEach(phone => observer.observe(phone));
});