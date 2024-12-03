const LISTINGS = [];

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
    loadCart();
}

function loadCart() {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    if (cart == null || cart.length == 0)
        console.log("cart empty");
    else {
        for (let i = 0; i < cart.length; i++) {
            let row = document.createElement("tr");
            let currListing = LISTINGS[cart[i].listingID];
            $(row).append($(document.createElement("td")).append(
                $(document.createElement("img")).attr("src", "placeholder.jpg").attr("style", "width:50px;height:50px;")
            ));
            $(row).append($(document.createElement("td")).text(
                currListing.animalName + "\n" + currListing.breeder
            ));
            $(row).append($(document.createElement("td")).text(`$${currListing.price}`));
            let quantitySelector = document.createElement("input");
            $(quantitySelector).attr("type", "number").attr("value", cart[i].quantity).attr("min", "1");
            $(row).append($(document.createElement("td")).append(quantitySelector));

            $("#cart").append(row);
        }
    }
}

function createJSONListing(headers, row) {
    let listing = {};
    for (let i = 0; i < headers.length; i++)
        listing[headers[i]] = row[i];
    return listing;
}