const ctaButton =
document.getElementById("ctaBtn");

ctaButton.addEventListener("click", () => {

    document
    .getElementById("features")
    .scrollIntoView({
        behavior:"smooth"
    });

});