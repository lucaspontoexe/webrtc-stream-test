export default function darkenBackground() {
  // makes the background black (or transparent if the page is in an OBS browser source)
  const body = window.document.body;
  const isOBS = window.obsstudio;
  body.style.setProperty("--bg-color", isOBS ? "rgba(0,0,0,0)" : "black");
}
