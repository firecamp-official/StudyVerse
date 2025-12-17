import { supabase } from "./supabase.js";

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

/* ======================
   CONNEXION
====================== */
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "dashboard.html";
});

/* ======================
   INSCRIPTION + PROFILE
====================== */
registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // À ce stade, l'utilisateur est CONNECTÉ (email confirmation OFF)
  const userId = data.user.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username
    });

  if (profileError) {
    alert("Erreur création profil : " + profileError.message);
    return;
  }

  window.location.href = "dashboard.html";
});
