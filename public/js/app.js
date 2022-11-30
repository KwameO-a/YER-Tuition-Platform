
const fetchCourses = () =>
fetch("https://api.airtable.com/v0/appLuIZdcNMmDwsS6/Products", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer keyJdPQHjKs3itqpY"
  },
});

/**
 * Retrieves the courses from the server
 */
const getCourses = async () => {
  const response = await fetchCourses();
  const courses = await response.json();
  localStorage.setItem("courses", JSON.stringify(courses));
};


// Will run when page finishes loading
window.onload = async () => {

  await getCourses();
  updateUI();
 
};
