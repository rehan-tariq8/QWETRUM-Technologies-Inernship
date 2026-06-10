const countriesContainer =
document.getElementById("countriesContainer");

const searchInput =
document.getElementById("searchInput");

const loader =
document.getElementById("loader");

const errorMessage =
document.getElementById("errorMessage");

let countriesData = [];

async function fetchCountries() {

    try {

        loader.style.display = "block";
        errorMessage.textContent = "";

        const response = await fetch(
            "https://restcountries.com/v3.1/all?fields=name,flags,population,capital,region"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const data = await response.json();

        countriesData = data
            .sort((a, b) =>
                a.name.common.localeCompare(
                    b.name.common
                )
            )
            .slice(0, 10);

        displayCountries(countriesData);

    }

    catch (error) {

        errorMessage.textContent =
            "Unable to load countries. Please try again later.";

        console.error(error);
    }

    finally {

        loader.style.display = "none";
    }
}

function displayCountries(countries) {

    countriesContainer.innerHTML = "";

    countries.forEach(country => {

        const card =
        document.createElement("div");

        card.classList.add("country-card");

        card.innerHTML = `

            <img src="${country.flags.png}" alt="${country.name.common}">

            <div class="country-info">

                <h3>${country.name.common}</h3>

                <p><strong>Population:</strong>
                ${country.population.toLocaleString()}</p>

                <p><strong>Capital:</strong>
                ${country.capital ? country.capital[0] : "N/A"}</p>

                <p><strong>Region:</strong>
                ${country.region}</p>

            </div>
        `;

        countriesContainer.appendChild(card);
    });
}

searchInput.addEventListener("input", () => {

    const searchValue =
    searchInput.value.toLowerCase();

    const filteredCountries =
    countriesData.filter(country =>
        country.name.common
        .toLowerCase()
        .includes(searchValue)
    );

    displayCountries(filteredCountries);
});

fetchCountries();