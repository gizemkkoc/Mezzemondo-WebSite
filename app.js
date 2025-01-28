const panels = document.querySelectorAll(".panel-link");

panels.forEach(panel => {
    panel.addEventListener("click", (e) => {
        if (!e.target.classList.contains('panel')) {
            removeActive();
            panel.classList.add("active");
        }
    })
})

function removeActive(){
    panels.forEach(panel => {
        panel.classList.remove("active");
    })
}