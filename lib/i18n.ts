export type Language = "fr" | "en"

export const translations = {
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    projects: "Projets",
    messages: "Messages",
    payments: "Paiements",
    reviews: "Évaluations",
    profile: "Profil",
    admin: "Administration",
    logout: "Déconnexion",
    login: "Connexion",
    signup: "Inscription",

    // Dashboard
    welcome: "Bienvenue sur FreelanceHub",
    activeProjects: "Projets actifs",
    totalEarnings: "Gains totaux",
    completedProjects: "Projets terminés",
    averageRating: "Note moyenne",
    recentActivity: "Activité récente",

    // Projects
    createProject: "Créer un projet",
    browseProjects: "Parcourir les projets",
    projectTitle: "Titre du projet",
    projectDescription: "Description du projet",
    budget: "Budget",
    deadline: "Date limite",
    skills: "Compétences",
    category: "Catégorie",
    submit: "Soumettre",
    apply: "Postuler",

    // Messages
    newMessage: "Nouveau message",
    sendMessage: "Envoyer le message",

    // Common
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    projects: "Projects",
    messages: "Messages",
    payments: "Payments",
    reviews: "Reviews",
    profile: "Profile",
    admin: "Admin",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",

    // Dashboard
    welcome: "Welcome to FreelanceHub",
    activeProjects: "Active Projects",
    totalEarnings: "Total Earnings",
    completedProjects: "Completed Projects",
    averageRating: "Average Rating",
    recentActivity: "Recent Activity",

    // Projects
    createProject: "Create Project",
    browseProjects: "Browse Projects",
    projectTitle: "Project Title",
    projectDescription: "Project Description",
    budget: "Budget",
    deadline: "Deadline",
    skills: "Skills",
    category: "Category",
    submit: "Submit",
    apply: "Apply",

    // Messages
    newMessage: "New Message",
    sendMessage: "Send Message",

    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
}

export type TranslationKey = keyof typeof translations.fr
