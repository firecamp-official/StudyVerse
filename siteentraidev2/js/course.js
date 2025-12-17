import { supabase } from "./supabase.js";
/* LOAD FILTERS */
const classFilter = document.getElementById("classFilter");
const subjectFilter = document.getElementById("subjectFilter");

const { data: classes } = await supabase.from("classes").select("*");
classes.forEach(c => classFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`);

const { data: subjects } = await supabase.from("subjects").select("*");
subjects.forEach(s => subjectFilter.innerHTML += `<option value="${s.id}">${s.name}</option>`);
/* LOAD COURSE */
async function loadCourse() {
  const id = new URLSearchParams(location.search).get("id");
  const courseDiv = document.getElementById("course");

  if (!id) {
    courseDiv.innerHTML = "<p>Cours introuvable.</p>";
    return;
  }

  // Récupérer le cours
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single();

  if (courseError || !course) {
    console.error(courseError);
    courseDiv.innerHTML = "<p>Erreur chargement du cours.</p>";
    return;
  }

  // Récupérer les sections
  const { data: sections, error: sectionError } = await supabase
    .from("course_sections")
    .select("*")
    .eq("course_id", id)
    .order("position", { ascending: true });

  if (sectionError) {
    console.error(sectionError);
    courseDiv.innerHTML = "<p>Erreur chargement des sections.</p>";
    return;
  }

  // Affichage
  courseDiv.innerHTML = `
    <h1>${course.title}</h1>
    ${sections.map(s => `
      <section>
        <h3>${s.title}</h3>
        <p>${s.content}</p>
        ${s.image_url ? `<img src="${s.image_url}" alt="">` : ""}
      </section>
    `).join("")}
  `;
}

// Exécuter la fonction
loadCourse();
