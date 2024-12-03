$(loadData);

function loadData() {
    $.ajax({
        type: "GET",
        url: "data.csv",
        dataType: "text",
        success: function(data) {createListing(data);}
    });
}

function createListing(data) {
    data = data.split("\r\n");
    let headers = data[0].split(",");
    const urlParams = new URLSearchParams(window.location.search);
    let listingID = urlParams.get('id') * 1;
    let listing = createJSONListing(headers, data[listingID + 1].split(","));

    document.title = `${listing.animalName}`;
    $("#name").text(listing.animalName).attr("data-id", listing.listingID);
    $("#price").text("$"+listing.price);
    $("#sName").text(listing.scienceName);
    $("#breeder").text(listing.breeder);
    $("#expLvl").text(listing.experienceLvl);
    if (window.sessionStorage.getItem("cart") != null) {
        let cart = JSON.parse(window.sessionStorage.getItem("cart"));
        let inCart = false;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].listingID == listing.listingID) {
                inCart = true;
                $("#addCart").attr("type", "number").attr("min", "0").attr("value", cart[i].quantity);
                $("#addCart").on("change", changeQuantity);
                break;
            }
        }
        if (!inCart)
            $("#addCart").on("click", function(event) {addToCart(event)});
    } 
    else
        $("#addCart").on("click", function(event) {addToCart(event)});
}

function addToCart(event) {
    event.preventDefault();
    let cartItem = {
        listingID: $("#name").attr("data-id"),
        quantity: 1
    }
    if (window.sessionStorage.getItem("cart") == null)
        window.sessionStorage.setItem("cart", "[]");
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    cart.push(cartItem);
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
    $("#addCart").off("click")
    $("#addCart").attr("type", "number").attr("min", "0").attr("value", "1");
    $("#addCart").on("change", changeQuantity);
}

function changeQuantity() {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    if ($("#addCart").val() == 0) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].listingID == $("#name").attr("data-id")) {
                cart.splice(i,1);
                break;
            }
        }
        $("#addCart").attr("type", "button").attr("value", "Add to Cart")
        $("#addCart").off("change");
        $("#addCart").on("click", function(event) {addToCart(event)});
    }
    else {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].listingID == $("#name").attr("data-id")) {
                cart[i].quantity = $("#addCart").val();
                break;
            }
        }
    }
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
}

function createJSONListing(headers, row) {
    let listing = {};
    for (let i = 0; i < headers.length; i++)
        listing[headers[i]] = row[i];
    return listing;
}