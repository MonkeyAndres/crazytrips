document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');
  
  let menu = document.getElementById('menu');
  let sidebar = document.getElementsByClassName('userInfo')[0];
  let shadow = document.getElementById('shadow')

  menu.addEventListener('click', (event) => {
    event.preventDefault();
    sidebar.style.left = "0";
    shadow.style.pointerEvents = "all";
    shadow.style.opacity = 1;
  })

  shadow.addEventListener('click', (event) => {
    sidebar.style.left = "-300px";
    shadow.style.pointerEvents = "none";
    shadow.style.opacity = 0;
  })

}, false);
