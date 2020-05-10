(() => {  
  const DOMAIN = 'https://pgmgent-1920-students.github.io/atwork2-case1-baas';

  const loadBlog = async () => {
    const response = await fetch(`${DOMAIN}/data/blog/index.json`);
    const jsonData = await response.json();
    console.log(jsonData);
  }

  loadBlog();
})();