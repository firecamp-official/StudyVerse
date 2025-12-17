import { supabase } from "./supabase.js";
import { requireAdmin } from "./adminGuard.js";

const user = await requireAdmin();

const courseForm = document.getElementById("courseForm");
const sectionsContainer = document.getElementById("sections");
const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");
const addSectionBtn = document.getElementById("addSection");

const courseList = document.getElementById("courseList");
const searchInput = document.getElementById("searchCourse");
const filterClass = document.getElementById("filterClass");
const filterSubject = document.getElementById("filterSubject");

// --------------------
// LOAD CLASSES & SUBJECTS
// --------------------
async function loadClassesSubjects() {
  const { data: classes } = await supabase.from("classes").select("*");
  classes.forEach(c => {
    const option1 = document.createElement("option");
    option1.value = c.id;
    option1.textContent = c.name;
    classSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = c.id;
    option2.textContent = c.name;
    filterClass.appendChild(option2);
  });

  const { data: subjects } = await supabase.from("subjects").select("*");
  subjects.forEach(s => {
    const option1 = document.createElement("option");
    option1.value = s.id;
    option1.textContent = s.name;
    subjectSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = s.id;
    option2.textContent = s.name;
    filterSubject.appendChild(option2);
  });
}

// --------------------
// LOAD COURSES
// --------------------
async function loadCourses() {
  let query = supabase.from("courses").select("*").order("created_at", { ascending: false });

  const search = searchInput.value.trim();
  if (search) query = query.ilike("title", `%${search}%`);

  const classFilter = filterClass.value;
  if (classFilter) query = query.eq("class_id", classFilter);

  const subjectFilter = filterSubject.value;
  if (subjectFilter) query = query.eq("subject_id", subjectFilter);

  const { data: courses, error } = await query;
  if (error) return console.error(error);

  courseList.innerHTML = courses.map(c => `
    <div class="courseCard" data-id="${c.id}">
      <h3>${c.title}</h3>
      <p>Classe: ${c.class_id} | Matière: ${c.subject_id}</p>
      <button class="editCourse">Éditer</button>
      <button class="deleteCourse">Supprimer</button>
    </div>
  `).join("");

  document.querySelectorAll(".editCourse").forEach(btn => {
    btn.onclick = () => editCourse(btn.closest(".courseCard").dataset.id);
  });
  document.querySelectorAll(".deleteCourse").forEach(btn => {
    btn.onclick = () => deleteCourse(btn.closest(".courseCard").dataset.id);
  });
}

// --------------------
// ADD SECTION
// --------------------
addSectionBtn.onclick = () => {
  const div = document.createElement("div");
  div.className = "section card";
  div.innerHTML = `
    <input placeholder="Titre section" required>
    <textarea placeholder="Contenu" required></textarea>
    <input placeholder="Image URL (optionnel)">
  `;
  sectionsContainer.appendChild(div);
};

// --------------------
// SUBMIT COURSE
// --------------------
courseForm.onsubmit = async e => {
  e.preventDefault();

  const sections = [...sectionsContainer.querySelectorAll(".section")];
  if (!sections.length) return alert("Ajoute au moins une section");

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title: courseForm.title.value,
      class_id: classSelect.value,
      subject_id: subjectSelect.value,
      author: user.id,
      validated: true
    })
    .select("id")
    .single();

  if (error || !course) {
    console.error(error);
    return alert("Erreur création cours");
  }

  const sectionsData = sections.map((s, i) => ({
    course_id: course.id,
    title: s.querySelector("input").value,
    content: s.querySelector("textarea").value,
    image_url: s.querySelectorAll("input")[1]?.value || null,
    position: i
  }));

  const { error: sectionError } = await supabase.from("course_sections").insert(sectionsData);
  if (sectionError) {
    console.error(sectionError);
    return alert("Erreur sections");
  }

  alert("Cours publié 🚀");
  courseForm.reset();
  sectionsContainer.innerHTML = "";
  loadCourses();
};

// --------------------
// EDIT & DELETE FUNCTIONS
// --------------------
async function editCourse(id) {
  const { data: course } = await supabase.from("courses").select("*,course_sections(*)").eq("id", id).single();
  if (!course) return alert("Cours introuvable");

  courseForm.title.value = course.title;
  classSelect.value = course.class_id;
  subjectSelect.value = course.subject_id;

  sectionsContainer.innerHTML = "";
  course.course_sections.forEach(s => {
    const div = document.createElement("div");
    div.className = "section card";
    div.dataset.id = s.id;
    div.innerHTML = `
      <input value="${s.title}" required>
      <textarea required>${s.content}</textarea>
      <input value="${s.image_url || ''}">
    `;
    sectionsContainer.appendChild(div);
  });

  courseForm.onsubmit = async e => {
    e.preventDefault();

    // Update course
    const { error: cError } = await supabase.from("courses").update({
      title: courseForm.title.value,
      class_id: classSelect.value,
      subject_id: subjectSelect.value
    }).eq("id", id);

    if (cError) return alert("Erreur update course");

    // Update sections
    for (let s of sectionsContainer.querySelectorAll(".section")) {
      const sectionId = s.dataset.id;
      await supabase.from("course_sections").update({
        title: s.querySelector("input").value,
        content: s.querySelector("textarea").value,
        image_url: s.querySelectorAll("input")[1]?.value || null
      }).eq("id", sectionId);
    }

    alert("Cours mis à jour ✅");
    courseForm.reset();
    sectionsContainer.innerHTML = "";
    courseForm.onsubmit = async e => { /* remettre submit initial */ };
    loadCourses();
  };
}

async function deleteCourse(id) {
  if (!confirm("Supprimer ce cours ?")) return;
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return alert("Erreur suppression");
  loadCourses();
}

// --------------------
// INIT
// --------------------
await loadClassesSubjects();
await loadCourses();
searchInput.oninput = loadCourses;
filterClass.onchange = loadCourses;
filterSubject.onchange = loadCourses;
