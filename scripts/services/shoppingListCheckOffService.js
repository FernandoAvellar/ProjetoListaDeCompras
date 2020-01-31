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
    var removedItem = buyListItems.splice(itemIndex, 1)[0];
    deleteItemFromFirebase(removedItem.itemName, "buyListItems");
    boughtListItems.push(removedItem);
    saveItemToDatabase(removedItem.itemName, removedItem.itemQuantity, "boughtListItems");
  };

  service.deleteItemFromBuyList = function (itemIndex) {
    var removedItem = buyListItems.splice(itemIndex, 1)[0];
    deleteItemFromFirebase(removedItem.itemName, "buyListItems");
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
    deleteItemFromFirebase(editItem.itemName, "buyListItems");
  }

  service.returnSelectedItemToBuyList = function (itemIndex) {
    var returnedItem = boughtListItems.splice(itemIndex, 1)[0];
    deleteItemFromFirebase(returnedItem.itemName, "boughtListItems");
    buyListItems.push(returnedItem);
    saveItemToDatabase(returnedItem.itemName, returnedItem.itemQuantity, "buyListItems");
  }

  function getAndPopulateInitialDataFromBuyListInFirebase() {
    var databaseBuyListKeyRef = firebase.database().ref().child("buyListItems");
    databaseBuyListKeyRef.orderByChild("itemName").once('value', snapshot => {
      snapshot.forEach(function (childSnapshot) {
        buyListItems.push(childSnapshot.val());
      });
      $rootScope.$apply();
    });
  }

  function getAndPopulateInitialDataFromBoughtListInFirebase() {
    var databaseBoughtListKeyRef = firebase.database().ref().child("boughtListItems");
    databaseBoughtListKeyRef.orderByChild("itemName").once('value', snapshot => {
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

  function deleteItemFromFirebase(itemName, databaseName) {
    var databaseListKeyRef = firebase.database().ref().child(databaseName);
    databaseListKeyRef.orderByChild("itemName").equalTo(itemName).once("value", snapshot => {
      snapshot.forEach(function (childSnapshot) {
        firebase.database().ref(databaseName).child(childSnapshot.key).remove();
      });
    });
  }

}