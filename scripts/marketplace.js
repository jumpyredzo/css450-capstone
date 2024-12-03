var MAX_RESULTS_PER_PAGE = 9;
var LISTINGS = [];

$(loadData);

function loadData() {
    $.ajax({
        type: "GET",
        url: "data.csv",
        dataType: "text",
        success: function(data) {createListingArray(data);}
    });
}

function createListingArray(data) {
    data = data.split("\r\n");
    let headers = data[0].split(",");
    for (let i = 1; i < data.length; i++) 
        LISTINGS[i-1] = createJSONListing(headers, data[i].split(","));
    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page');
    if (page === null)
        page = 1;
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
    createPageSelectors(page);
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
    for (let i = 1; i <= numPages; i++) {
        let pageLink = document.createElement("a");
        $(pageLink).attr("href", `?page=${i}`).text(i);
        if (i == page)
            $(pageLink).attr("id", "currentPage");
        $("#pages").append(pageLink);
    }
}