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

  getAndPopulateInitialDataFromBuyListInFirebase();
  getAndPopulateInitialDataFromBoughtListInFirebase();

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

    saveItemToDatabase(removedItem[0].itemName, removedItem[0].itemQuantity, "boughtListItems");
    //TODO: Falta excluir o item do buyList no Firebase
  };

  service.deleteItemFromBuyList = function (itemIndex) {
    buyListItems.splice(itemIndex, 1);
    //TODO: Falta excluir o item do buyList no Firebase
  }

  service.addToBuyList = function (newItemName, newItemQuantity) {
    var newItem =
      {
        itemName: newItemName,
        itemQuantity: newItemQuantity
      };
    buyListItems.push(newItem);
    saveItemToDatabase(newItemName, newItemQuantity, "buyListItems");
  }

  service.returnSelectedItemToNewItemInput = function (itemIndex) {
    var editItem = buyListItems.splice(itemIndex, 1)[0];
    newItemContent = { itemName: editItem.itemName, itemQuantity: editItem.itemQuantity };
    $rootScope.$broadcast('refreshInputFields');
    //TODO: Apagar item removido do buyList do Firebase
  }

  service.returnSelectedItemToBuyList = function (itemIndex) {
    var returnedItem = boughtListItems.splice(itemIndex, 1);
    //TODO:Apagar o item do boughList no Firebase
    buyListItems.push(returnedItem[0]);
    saveItemToDatabase(returnedItem[0].itemName, returnedItem[0].itemQuantity, "buyListItems");

  }

  function getAndPopulateInitialDataFromBuyListInFirebase() {
    var databaseBuyListKeyRef = firebase.database().ref().child("buyListItems");
    databaseBuyListKeyRef.once('value', snapshot => {
      snapshot.forEach(function (childSnapshot) {
        buyListItems.push(childSnapshot.val());
      });
      $rootScope.$apply();
    });
  }

  function getAndPopulateInitialDataFromBoughtListInFirebase() {
    var databaseBoughtListKeyRef = firebase.database().ref().child("boughtListItems");
    databaseBoughtListKeyRef.once('value', snapshot => {
      snapshot.forEach(function (childSnapshot) {
        boughtListItems.push(childSnapshot.val());
      });
      $rootScope.$apply();
    });
  }

  function saveItemToDatabase(name, quantity, databaseName) {
    // Get a new reference to the database service
    var databaseRef = firebase.database().ref().child(databaseName);
    //Push Reference to create a new instant id for each new product inside databaseName
    var databaseRefPush = databaseRef.push();

    databaseRefPush.set({
      itemName: name,
      itemQuantity: quantity,
    });
  }

}