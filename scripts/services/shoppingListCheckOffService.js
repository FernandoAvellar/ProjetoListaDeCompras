angular.module('ShoppingList')
  .service('ShoppingListCheckOffService', ShoppingListCheckOffService);

////////////////////////////////////////////////////////////////////////////
// Service ShoppingListCheckOffService//
////////////////////////////////////////////////////////////////////////////
function ShoppingListCheckOffService($rootScope) {

  var service = this;

  var buyListItems = [];
  var boughtListItems = [];
  var newItemContent = { itemName: "", itemQuantity: "" };

  getInitialDataFromFirebase();

  service.getBuyList = function () {
    return buyListItems;
  };

  service.getBoughtList = function () {
    return boughtListItems;
  };

  service.getNewItemContent = function () {
    return newItemContent;
  }

  service.changeItemFromBuyListToBoughtList = function (itemIndex) {
    var removedItem = buyListItems.splice(itemIndex, 1);
    boughtListItems.push(removedItem[0]);
  };

  service.deleteItemFromBuyList = function (itemIndex) {
    buyListItems.splice(itemIndex, 1);
  }

  service.addToBuyList = function (newItemName, newItemQuantity) {
    var newItem =
      {
        itemName: newItemName,
        itemQuantity: newItemQuantity
      };
    buyListItems.push(newItem);
    saveItemToDatabase(newItemName, newItemQuantity);
  }

  service.returnSelectedItemToNewItemInput = function (itemIndex) {
    var editItem = buyListItems.splice(itemIndex, 1)[0];
    newItemContent = { itemName: editItem.itemName, itemQuantity: editItem.itemQuantity };
    $rootScope.$broadcast('refreshInputFields');
  }

  service.returnSelectedItemToBuyList = function (itemIndex) {
    var returnedItem = boughtListItems.splice(itemIndex, 1);
    buyListItems.push(returnedItem[0]);
  }

  function getInitialDataFromFirebase() {
    var databaseKeyRef = firebase.database().ref().child("buyListItems");
    databaseKeyRef.once('value', snapshot => {
      snapshot.forEach(function (childSnapshot) {
        buyListItems.push(childSnapshot.val());
      });
      $rootScope.$apply();
    });
  }

  function saveItemToDatabase(name, quantity) {
      // Get a new reference to the database service
      var databaseRef = firebase.database().ref().child("buyListItems");
      //Push Reference to create a new instant id for each new product inside buyListItems
      var databaseRefPush = databaseRef.push();

      databaseRefPush.set({
        itemName: name,
        itemQuantity: quantity,
      });
    }

}