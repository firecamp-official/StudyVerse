import { supabase } from "./supabase.js";

/* ELEMENTS */
const classFilter = document.getElementById("classFilter");
const subjectFilter = document.getElementById("subjectFilter");
const courseList = document.getElementById("courseList");
const latestContainer = document.getElementById("latestCourses");

/* ==========================
   LOAD FILTERS
========================== */

const { data: classes } = await supabase.from("classes").select("*");
classFilter.innerHTML += `<option value="">Toutes les classes</option>`;
classes.forEach(c => {
  classFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
});

const { data: subjects } = await supabase.from("subjects").select("*");
subjectFilter.innerHTML += `<option value="">Toutes les matières</option>`;
subjects.forEach(s => {
  subjectFilter.innerHTML += `<option value="${s.id}">${s.name}</option>`;
});

/* ==========================
   LOAD COURSES (LISTE)
========================== */

async function loadCourses() {
  let query = supabase
    .from("courses")
    .select(`
      id,
      title,
      classes(name),
      subjects(name)
    `)
    .eq("validated", true);

  if (classFilter.value) query = query.eq("class_id", classFilter.value);
  if (subjectFilter.value) query = query.eq("subject_id", subjectFilter.value);

  const { data: courses, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  courseList.innerHTML = courses.map(c => `
    <div class="card course-card" onclick="location.href='course.html?id=${c.id}'">
      <h3>${c.title}</h3>
      <small>${c.classes?.name ?? "—"} – ${c.subjects?.name ?? "—"}</small>
    </div>
  `).join("");
}

classFilter.onchange = subjectFilter.onchange = loadCourses;
loadCourses();

/* ==========================
   🆕 DERNIERS COURS
========================== */

async function loadLatestCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      created_at,
      classes(name),
      subjects(name)
    `)
    .eq("validated", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error(error);
    return;
  }

  latestContainer.innerHTML = data.map(course => `
    <div class="latest-card" onclick="location.href='course.html?id=${course.id}'">
      <span class="badge subject">${course.subjects?.name ?? "—"}</span>
      <span class="badge class">${course.classes?.name ?? "—"}</span>
      <h3>${course.title}</h3>
    </div>
  `).join("");
}

loadLatestCourses();
