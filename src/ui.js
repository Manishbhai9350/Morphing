import { Functions } from "./math/functions";

export function InitUI(onSelect) {
  const container = document.querySelector(".buttons");

  container.innerHTML = "";

  Object.keys(Functions).forEach((name, i) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.dataset.fn = name;

    if (i === 0) btn.classList.add("active");

    btn.addEventListener("click", () => {
      let result = onSelect(name, Functions[name]);

      if (result) {
        document
          .querySelectorAll(".buttons button")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });

    container.appendChild(btn);
  });
}
