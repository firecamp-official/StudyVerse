import { supabase } from "./supabase.js";

/* LOAD FILTERS */
const classFilter = document.getElementById("classFilter");
const subjectFilter = document.getElementById("subjectFilter");

const { data: classes } = await supabase.from("classes").select("*");
classes.forEach(c => classFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`);

const { data: subjects } = await supabase.from("subjects").select("*");
subjects.forEach(s => subjectFilter.innerHTML += `<option value="${s.id}">${s.name}</option>`);

/* LOAD COURSES */
async function loadCourses() {
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      classes(name),
      subjects(name)
    `)
    .eq("class_id", classFilter.value)
    .eq("subject_id", subjectFilter.value)
    .eq("validated", true);

  courseList.innerHTML = courses.map(c => `
    <div class="card" onclick="location.href='course.html?id=${c.id}'">
      <h3>${c.title}</h3>
      <small>${c.classes.name} – ${c.subjects.name}</small>
    </div>
  `).join("");
}

classFilter.onchange = subjectFilter.onchange = loadCourses;
