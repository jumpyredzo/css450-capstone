var MAX_RESULTS_PER_PAGE = 9;
var LISTINGS = [];

$(loadData);

function loadData() {
    $.ajax({
        type: "GET",
        url: "../data.csv",
        dataType: "text",
        success: function(data) {createListingArray(data);}
    });
    setCartQuantity();
}

function setCartQuantity() {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    let cartQuantity = 0;
    if (cart !== null) {
        for (let i = 0; i < cart.length; i++) {
            cartQuantity += 1 * cart[i].quantity;
        }
    }
    if (cartQuantity == 0)
        $("a[href='cart.html']").text("Cart");
    else
        $("a[href='cart.html']").html(`Cart<sup>${cartQuantity}</sup>`);
}

function createListingArray(data) {
    data = data.replace("\r", "");
    data = data.split("\n");
    let headers = data[0].split(",");
    for (let i = 1; i < data.length; i++) 
        LISTINGS[i-1] = createJSONListing(headers, data[i].split(","));
    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page');
    if (page === null)
        page = 1;
    let searchValue = urlParams.get('search');
    if (searchValue !== null) {
        for (let i = 0; i < LISTINGS.length; i++) {
            if (!LISTINGS[i].animalName.toLowerCase().includes(searchValue) &&
                !LISTINGS[i].scienceName.toLowerCase().includes(searchValue)) {
                    LISTINGS.splice(i,1);
                    i--;
            }
        }
        $("#search").val(searchValue);
    }
    let filterStr = urlParams.get('filter');
    if (filterStr !== null) {
        let filter = filterStr.split(" ");
        //filters breeders
        if (filter.includes("0") || filter.includes("1") ||
            filter.includes("2") || filter.includes("3")) {
            for (let i = 0; i < LISTINGS.length; i++) {
                if (!filter.includes(LISTINGS[i].breederID)) {
                        LISTINGS.splice(i,1);
                        i--;
                }
            }
        }
        //now filters experience level
        if (filter.includes("beginner") || filter.includes("intermediate") ||
            filter.includes("expert")) {
            for (let i = 0; i < LISTINGS.length; i++) {
                if (!filter.includes(LISTINGS[i].experienceLvl.toLowerCase().trim())) {
                        LISTINGS.splice(i,1);
                        i--;
                }
            }
        }
        for (let i = 0; i < filter.length; i++) {
            $(`input[type='checkbox'][value=${filter[i]}]`).prop("checked", true);
        }
    }
    $("#clearSearch").on("click", function(event) {
        searchMarketplace("");
    });
    $("input[type='checkbox']").on("change", function(event) {filterMarketplace(event);});
    $("#search").on("keyup", function(event) {
        if (event.which == 13)
            searchMarketplace($(event.target).val().toLowerCase());
    });
    loadMarketplace(page);
}


function createJSONListing(headers, row) {
    let listing = {};
    for (let i = 0; i < headers.length; i++)
        listing[headers[i]] = row[i];
    return listing;
}

function loadMarketplace(page) {
    const PAGE_BUFFER = (page-1) * MAX_RESULTS_PER_PAGE;
    for (let i = 0+PAGE_BUFFER; i < MAX_RESULTS_PER_PAGE+PAGE_BUFFER && i < LISTINGS.length; i++) {
        createDOMListing(LISTINGS[i]);
    }
    if (LISTINGS.length == 0) {
        let noMatches = document.createElement("div");
        $(noMatches).attr("class", "listing");
        $(noMatches).text("No Matching Listings");
        $("#results").append(noMatches);
    }
    createPageSelectors(page);
}

function searchMarketplace(searchValue) {
    let queryStr = "?";
    const urlParams = new URLSearchParams(window.location.search);
    let currFilter = urlParams.get("filter");
    if (currFilter !== null) {
        queryStr += `filter=${currFilter}&`;
    }
    if (searchValue == "") {
        if (queryStr == "?")
            window.location.assign("/");
        else
            window.location.assign(queryStr.slice(0,queryStr.length-1));
    }
    else
        window.location.assign(queryStr + `search=${searchValue}`);
}

function filterMarketplace(event) {
    const urlParams = new URLSearchParams(window.location.search);
    let searchVal = urlParams.get("search");
    let queryStr = "?";
    if (searchVal !== null)
        queryStr += `search=${searchVal}&`;
    let currFilter = urlParams.get("filter");
    if (currFilter !== null && event.target.checked) 
        queryStr += `filter=${currFilter} ${$(event.target).val()}`;
    else if (currFilter !== null && !event.target.checked) {
        currFilter = currFilter.split(" ");
        
        if (currFilter.length == 1)
            currFilter = [];
        
        for (let i = 0; i < currFilter.length; i++) {
            if (currFilter[i] == $(event.target).val()) {
                currFilter.splice(i, 1);
                break;
            }
        }
        currFilter = currFilter.join(" ");
        if (currFilter.length > 0)
            queryStr += `filter=${currFilter}`;
        else
            queryStr = queryStr.slice(0, queryStr.length - 1);
    }
    else
        queryStr += `filter=${$(event.target).val()}`;
    if (queryStr == "?" || queryStr == "")
        window.location.assign("/");    
    else
        window.location.assign(queryStr);
}

function createDOMListing(listing) {
    let DOMlisting = document.createElement("div");
    DOMlisting.setAttribute("class", "listing");
    $(DOMlisting).append(
        $(document.createElement("div")).append(
            $(document.createElement("a")).attr("href", `listing.html?id=${listing.listingID}`).append(
                $(document.createElement("img")).attr("src", "placeholder.jpg").attr("style", "width:250px;height:250px;")
            )
        )
    );
    $(DOMlisting).append($(document.createElement("p")).text(`${listing.animalName}`));
    $(DOMlisting).append($(document.createElement("p")).text(`$${listing.price}`).attr("class", "price"));
    $(DOMlisting).append($(document.createElement("p")).text(`${listing.breeder}`));

    $("#results").append(DOMlisting);
}

function createPageSelectors(page) {
    const numPages = Math.ceil(LISTINGS.length / 9);
    const urlParams = new URLSearchParams(window.location.search);
    let searchVal = urlParams.get("search");
    let queryStr = "?";
    if (searchVal !== null)
        queryStr += `search=${searchVal}&`;
    let currFilter = urlParams.get("filter");
    if (currFilter !== null) {
        queryStr += `filter=${currFilter}&`;
    }
    for (let i = 1; i <= numPages; i++) {
        let pageLink = document.createElement("a");
        $(pageLink).attr("href", queryStr + `page=${i}`).text(i);
        if (i == page)
            $(pageLink).attr("id", "currentPage");
        $("#pages").append(pageLink);
    }
    if (numPages > 1 && page != 1) {
        let prevPageSelector = document.createElement("a");
        $(prevPageSelector).attr("href", queryStr + `page=${1*page-1}`).text("<");
        $("#pages").prepend(prevPageSelector);
    }
    if (numPages > 1 && numPages != page) {
        let nextPageSelector = document.createElement("a");
        $(nextPageSelector).attr("href", queryStr + `page=${1*page+1}`).text(">");
        $("#pages").append(nextPageSelector);
    }
}