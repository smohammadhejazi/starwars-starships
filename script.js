const FILMS_API = "https://swapi.dev/api/films/"

// number of films in each page
const SHIPS_IN_EACH_PAGE = 5;

// saved table of films of the first page
// this is for showing the table after going back to main page
let savedTable;

// saved ships json, saved after fetching all the ships json of a film
let savedShips = [];

// page index of ships list
let pageIndex = 0;

// fetch json from api, this returns a promise
const fetchJson = async (api) => {
    return fetch(api)
    .then(response => response.json());
}

// fetch starships info fro list of starship apis
// this list is provided when clicking the starships button
// of each film in the main table
const fetchStarShipsJson = async (starshipsAPIs) => {
    // first fetch all the infos and wait for the promises to
    // be resolved
    let ships = await Promise.all(
        starshipsAPIs.map(api => fetch(api)
        .then(response => response.json())
        )
    );

    // after we have the ships jsons, fetch the films apis provided
    // in the films key
    for (let i = 0; i < ships.length; i++){
        if (ships[i]["films"].length > 0){
            // wait for all fetches of films and return the title
            thisShipFilmTitles = await Promise.all(
                ships[i]["films"].map(api => fetch(api)
                .then(response => response.json())
                .then(json => json["title"])
                )
            );
            // alter the films key of ships json to the titles that we fetched
            ships[i]["films"] = thisShipFilmTitles;
        }
    }

    // return the ships json with the films titles added to films key
    return ships;
}

// enevt listener of back button, going to the main page
// showing the films table
const goBackEventListenter = () => {
    const contentBox = document.getElementById("content-box");
    contentBox.textContent = ""
    contentBox.appendChild(savedTable);
}

// check wheter next and prev buttons should be disabled considering
// the number of ships in each page and the page index
const checkNextPrevButton = () => {
    if (savedShips.length < (pageIndex + 1) * SHIPS_IN_EACH_PAGE) {
        document.getElementById("next-button").disabled = true;
    }
    else {
        document.getElementById("next-button").disabled = false;
    }
    if (pageIndex == 0) {
        document.getElementById("prev-button").disabled = true;
    }
    else {
        document.getElementById("prev-button").disabled = false;
    }
}

// next page button action listerner
const nextPageEventListener = () => {
    if ((savedShips.length - (pageIndex + 1) * SHIPS_IN_EACH_PAGE) >= 0)
        pageIndex++
    checkNextPrevButton();
    updateShipsList();
}

// prev page button action listerner
const prevPageEventListener = () => {
    if (pageIndex - 1 >= 0)
        pageIndex--
    checkNextPrevButton();
    updateShipsList();
}

// update the ships list which is in the left side of the content box
const updateShipsList = () => {
    const shipsList = document.getElementById("ships-list");
    const shipInfo = document.getElementById("ship-info");
    const rightHeading = document.getElementById("right-heading");

    // clear ships list
    shipsList.textContent = "";

    // for each ship in the page, add their names to the left side
    // and make the info text to show in right side after clicking them
    for (let i = pageIndex * SHIPS_IN_EACH_PAGE; i < Math.min((pageIndex + 1) * SHIPS_IN_EACH_PAGE, savedShips.length); i++) {
        // make list item
        let listItem = document.createElement("li");
        let infoText = "";

        shipJson = savedShips[i];

        listItem.textContent = shipJson["name"];

        // make the info text by iterating on json key values
        Object.keys(shipJson).forEach(key => {
            infoText += key;
            infoText += ": ";
            infoText += shipJson[key];
            infoText += "\n";
        });

        // add event listener to each list item for shoing the info text
        // when clicking them
        listItem.addEventListener("click", () => {
            shipInfo.textContent = infoText;
            rightHeading.textContent = listItem.textContent;
        });

        // add the list item to ships list
        shipsList.appendChild(listItem);
    }

    // update the page index div showing the number of the page
    document.getElementById("page-index").textContent = pageIndex + 1;
}

// make all the elements for the starships page; this page shows the starships
// names and when clicking on them shows their infos
const makeStarshipsPage = async (starshipsAPIs) => {
    const contentBox = document.getElementById("content-box");
    contentBox.textContent = "loading...";

    // save the ships list that consists of all the ships jsons
    // this variable is global and is used for page indexing and making the info text
    // for action listeners of each ship
    savedShips = await fetchStarShipsJson(starshipsAPIs);

    // left side elements of the content box
    let leftSide = document.createElement("div");
    let leftHeading = document.createElement("p");
    let shipsList = document.createElement("ul");
    let controlBox = document.createElement("div");
    let backButton = document.createElement("button");
    let nextButton = document.createElement("button");
    let prevButton = document.createElement("button");
    let pageIndexBox = document.createElement("div");

    // right side elements of the content box
    let rightSide = document.createElement("div");
    let rightHeading = document.createElement("p");
    let shipInfo = document.createElement("div");

    // set id for left side elements
    leftSide.id = "left-box";
    leftHeading.textContent = "StarShips";
    shipsList.id = "ships-list";
    controlBox.id = "control-box";
    nextButton.textContent = "Next";
    nextButton.class = "control-button";
    nextButton.id = "next-button";
    prevButton.textContent = "Previous";
    prevButton.class = "control-button";
    prevButton.id = "prev-button";
    backButton.textContent = "Back";
    backButton.class = "control-button";
    pageIndexBox.id = "page-index"

    // set id for right side elements
    rightSide.id = "right-box";
    rightHeading.id = "right-heading";
    shipInfo.id = "ship-info";

    // add event listeners to buttons
    backButton.addEventListener("click", goBackEventListenter);
    nextButton.addEventListener("click", nextPageEventListener)
    prevButton.addEventListener("click", prevPageEventListener)

    // append elements to control box
    controlBox.appendChild(prevButton);
    controlBox.appendChild(pageIndexBox);
    controlBox.appendChild(nextButton);

    // append elements to left side
    leftSide.appendChild(leftHeading);
    leftSide.appendChild(shipsList);
    leftSide.appendChild(controlBox);
    leftSide.appendChild(backButton);

    // append elements to right side
    rightSide.appendChild(rightHeading);
    rightSide.appendChild(shipInfo);

    contentBox.textContent = "";
    // append left and right side to content box
    contentBox.appendChild(leftSide);
    contentBox.appendChild(rightSide);

    // update elements to show
    pageIndex = 0;
    checkNextPrevButton();
    updateShipsList()
}

// set the films name, episode id, date and starships button in content box
// this function makes the first page of the website
const setFilmsInContentBox = (filmsJson) => {
    const contentBox = document.getElementById("content-box");
    const results = filmsJson["results"];

    // alert user that we are loading the page
    contentBox.textContent = "";
    
    // make a table and table body to store films information and buttons
    let table = document.createElement("table");
    let tbody = document.createElement("tbody");

    // make each row of table
    // each row has title, episode id, date and starships button
    results.forEach(element => {
        let row = document.createElement("tr");
        let title = document.createElement("td");
        let episode_id = document.createElement("td");
        let release_date = document.createElement("td");
        let button_cell = document.createElement("td");
        let button = document.createElement("button");
        let starshipsAPIs;
        
        // starships api in each film json that we use later in button
        // event listener
        starshipsAPIs = element["starships"];

        // set each cell text
        title.textContent = element["title"];
        episode_id.textContent = element["episode_id"];
        release_date.textContent = element["release_date"];

        // button text and class
        button.textContent = "Starships";
        button.className = "table-button";


        // add starships button event listener
        button.addEventListener("click", () => makeStarshipsPage(starshipsAPIs));
        button_cell.appendChild(button);

        // add cells to each row
        row.appendChild(title);
        row.appendChild(episode_id);
        row.appendChild(release_date);
        row.appendChild(button_cell);

        //add row to table body
        tbody.appendChild(row);
    });

    // add table body to table
    table.appendChild(tbody);

    // save this table for when we go back to this page via back button
    savedTable = table;

    // add this table to content box
    contentBox.appendChild(table);
}

// start the website
const run = () => {
    // alert user that we are loading the page
    const contentBox = document.getElementById("content-box");
    contentBox.textContent = "Loading...";

    // fetch all films json and update the content box
    fetchJson(FILMS_API)
    .then(filmsJson => setFilmsInContentBox(filmsJson));
}

// runner function
run()
