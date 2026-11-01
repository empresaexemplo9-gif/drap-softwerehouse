/* Aplica o tema salvo antes da renderização (evita "piscar"). Padrão: claro. */
try { if (localStorage.getItem("drap-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark"); } catch (e) {}
