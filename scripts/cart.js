const LISTINGS = [];

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
    for (let i = 0; i < cart.length; i++) {
        cartQuantity += 1 * cart[i].quantity;
    }
    if (cartQuantity == 0)
        $("a[href='cart.html']").text("Cart");
    else
        $("a[href='cart.html']").html(`Cart<sup>${cartQuantity}</sup>`);
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
        removeCartDisplay();
    else {
        let total = 0;
        for (let i = 0; i < cart.length; i++) {
            let currListing = LISTINGS[cart[i].listingID];
            total += currListing.price * cart[i].quantity;
            let row = document.createElement("tr");
            $(row).attr("data-id", `${currListing.listingID}`);
            $(row).append($(document.createElement("td")).append(
                $(document.createElement("img")).attr("src", "placeholder.jpg").attr("style", "width:50px;height:50px;")
            ));
            $(row).append($(document.createElement("td")).text(
                currListing.animalName + "\n" + currListing.breeder
            ));
            $(row).append($(document.createElement("td")).text(`$${currListing.price}`));
            let quantitySelector = document.createElement("input");
            $(quantitySelector).attr("type", "number").attr("value", cart[i].quantity).attr("min", "1");
            $(quantitySelector).on("change", {id: `${currListing.listingID}`}, function(event) { updateQuantity(event); });
            $(row).append($(document.createElement("td")).append(quantitySelector));

            let removeBtn = document.createElement("button");
            $(removeBtn).text("Remove from Cart");
            $(removeBtn).on("click", {id: `${currListing.listingID}`}, function(event) { removeFromCart(event); });
            $(row).append(removeBtn);

            $("#cart").append(row);
        }
        let totalRow = document.createElement("tr");
        for (let i = 0; i < 3; i++) {
            $(totalRow).append(document.createElement("td"));
        }
        $(totalRow).append($(document.createElement("td")).text("Subtotal:"));
        $(totalRow).append($(document.createElement("td")).text("$0").attr("id", "subtotal"));
        $("#cart").append(totalRow);
        changeSubtotal(total);
    }
}

function removeCartDisplay() {
    $("#cart").remove();
    $("#checkout").remove();
    $("#cartLabel").text("Your Cart is Empty");
}

function changeSubtotal(change) {
    let currTotal = $("#subtotal").text().slice(1) * 1;
    currTotal += change;
    $("#subtotal").text("$" + currTotal);
}

function removeFromCart(event) {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    let currListingID = event.data.id;
    $(`tr[data-id=${currListingID}]`).remove();
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].listingID == currListingID) {
            changeSubtotal(-1 * cart[i].quantity * LISTINGS[cart[i].listingID].price);
            cart.splice(i,1);
            break;
        }
    }
    if (cart.length == 0)
        removeCartDisplay();
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
    setCartQuantity();
}

function updateQuantity(event) {
    let cart = JSON.parse(window.sessionStorage.getItem("cart"));
    let currQuantity = $(event.target).val();
    if (currQuantity > 0) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].listingID == event.data.id) {
                changeSubtotal((currQuantity - cart[i].quantity) * LISTINGS[cart[i].listingID].price);
                cart[i].quantity = currQuantity;
                break;
            }
        }
        window.sessionStorage.setItem("cart", JSON.stringify(cart));
    }
    setCartQuantity();
}

function createJSONListing(headers, row) {
    let listing = {};
    for (let i = 0; i < headers.length; i++)
        listing[headers[i]] = row[i];
    return listing;
}