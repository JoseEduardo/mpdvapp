var db = null;
var sqlite = angular.module('sqlite', ['ionic', 'ngCordova']);

sqlite.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if (window.cordova) {
      db = $cordovaSQLite.openDB({ name: "magepdv.db", location: 'default' }); //device
    }else{
      db = window.openDatabase("magepdv.db", '1', 'magepdv', 1024 * 1024 * 100); // browser
    }
/*
    $cordovaSQLite.execute(db, "DROP TABLE SALESORDER");
    $cordovaSQLite.execute(db, "DROP TABLE CUSTOMER");
    $cordovaSQLite.execute(db, "DROP TABLE CUSTOMER_ADDR");
    $cordovaSQLite.execute(db, "DROP TABLE SALESORDER_ITEM");
    $cordovaSQLite.execute(db, "DROP TABLE PRODUCT");
*/
//    $cordovaSQLite.execute(db, "DROP TABLE CONFIGURATION");
//  $cordovaSQLite.execute(db, "DROP TABLE LOGIN");


    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS PRODUCT (ID integer primary key, PRODUCT_ID integer, NAME varchar(250), IMG_1 varchar(250), IMG_2 varchar(250), SKU varchar(30), PRICE real, STOCK real)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS CONFIGURATION (ID integer primary key, WS_URL varchar(250), WS_LOGIN varchar(250), WS_PASS varchar(250), STOCK real, IMG_IMP varchar(5), STORE_ID integer)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS CUSTOMER (ID integer primary key, ID_CUSTOMER integer, FIRSTNAME varchar(250), LASTNAME varchar(250), EMAIL varchar(250), TAXVAT varchar(250))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS CUSTOMER_ADDR (ID integer primary key, CUSTOMER_ID integer, CUSTOMER_ADDRESS_ID integer, STREET varchar(250), REGION varchar(250) )");

    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS SALESORDER (ID integer primary key, CUSTOMER_ID integer, CUSTOMER_ADDRESS_ID integer, SHIPP_METHOD varchar(250), PAYMENT_METHOD varchar(250), SYNC varchar(1), DTA_CREATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS SALESORDER_ITEM (ID integer primary key, ORDER_ID integer, ID_PROD integer, QTY float )");

    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS MET_PAG (ID integer primary key, MTP_ID integer, MTP_DESC varchar(250) )");


    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS LOGIN (ID integer primary key, USER varchar(250), PASS varchar(250), NAME varchar(250) )");
  });
});

sqlite.factory('configurationFactory', function($cordovaSQLite) {
  return {
    insert : function(WS_URL, WS_LOGIN, WS_PASS, STOCK, IMG_IMP, STORE_ID){
      var query = "INSERT INTO CONFIGURATION (WS_URL, WS_LOGIN, WS_PASS, STOCK, IMG_IMP, STORE_ID) VALUES (?, ?, ?, ?, ?, ?);";
      
      if( WS_URL != undefined || WS_URL == '' ){
        var values = [WS_URL, WS_LOGIN, WS_PASS, STOCK, IMG_IMP.toString(), STORE_ID];

        $cordovaSQLite.execute(db, query, values).then(
          function(res) {
            console.log('INSERTED ID: '+res.insertId);
          },
          function(err) {
            console.log(err);
          }
        );
      }
    },
    select : function(){
      var query = "SELECT * FROM CONFIGURATION"; 

    return $cordovaSQLite.execute(db, query).then(
      function(res) {
        if (res.rows.length > 0) {
          return res.rows.item(0);
        } else {
          return null;
        }
      }
    );
    },
    deleteAll : function(){
      console.log('deletou');
      $cordovaSQLite.execute(db, "DELETE FROM CONFIGURATION");
    },
  }
});

sqlite.factory('productFactory', function($cordovaSQLite) {
  return {
    insert : function(productID, name, sku, img1, img2, price, stock){
	    var query = "INSERT INTO PRODUCT (PRODUCT_ID, NAME, SKU, IMG_1, IMG_2, PRICE, STOCK) VALUES (?, ?, ?, ?, ?, ?, ?);";
	  	var values = [productID, name, sku, img1, img2, price, stock];

     	return $cordovaSQLite.execute(db, query, values).then(
		    function(res) {
          console.log('Prod: '+res.insertId);
		      return res.insertId;
		    },
		    function(err) {
		      console.log(err);
		    }
	 	);
    },
    select : function(sku){
    	var query = "SELECT * FROM PRODUCT WHERE SKU=?";
  		var values = [sku];

		return $cordovaSQLite.execute(db, query, values).then(
			function(res) {
			  if (res.rows.length > 0) {
			    return res.rows.item(0);
			  } else {
			    console.log('No records found');
			  }
			}
		);
    },
    count : function(sku){
      var query = "SELECT COUNT(*) AS TOTPROD FROM PRODUCT";

    return $cordovaSQLite.execute(db, query).then(
      function(res) {
        if (res.rows.length > 0) {
          return res.rows.item(0);
        } else {
          return 0;
        }
      }
    );
    },
    deleteAll : function(){
     	$cordovaSQLite.execute(db, "DELETE FROM PRODUCT");
    },
  }
});

sqlite.factory('customerFactory', function($cordovaSQLite, customerAddressFactory) {
  return {
    insert : function(ID_CUSTOMER, FIRSTNAME, LASTNAME, EMAIL, TAXVAT, ADDRESS){
      var query = "INSERT INTO CUSTOMER (ID_CUSTOMER, FIRSTNAME, LASTNAME, EMAIL, TAXVAT) VALUES (?, ?, ?, ?, ?);";
      var values = [ID_CUSTOMER, FIRSTNAME, LASTNAME, EMAIL, TAXVAT];

      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          customerAddressFactory.insert(res.insertId, ADDRESS.customer_address_id, ADDRESS.street, ADDRESS.region).then(function(){
            console.log('Client');
            return true;
          });
        },
        function(err) {
          console.log(err);
          return null;
        }
      );
    },
    selectById : function(searchData){
      var query = "SELECT * FROM CUSTOMER WHERE ID = '"+searchData+"'"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            console.log(res.rows.item(0));
            return res.rows.item(0);
          } else {
            return null;
          }
        }
      );
    },
    select : function(searchData){
      if(searchData == null){
        var query = "SELECT * FROM CUSTOMER"; 
      }else{
        var query = "SELECT * FROM CUSTOMER WHERE EMAIL = '"+searchData+"'"; 
      }

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            console.log(res.rows.item(0));
            return res.rows.item(0);
          } else {
            var query = "SELECT * FROM CUSTOMER WHERE TAXVAT = '"+searchData+"'";

            return $cordovaSQLite.execute(db, query).then(
              function(res) {
                if (res.rows.length > 0) {
                  return res.rows.item(0);
                } else {
                  return null;
                }
              }
            );
          }
        }
      );
    },
    deleteAll : function(){
      $cordovaSQLite.execute(db, "DELETE FROM CUSTOMER");
    },
  }
});

sqlite.factory('customerAddressFactory', function($cordovaSQLite) {
  return {
    insert : function(CUSTOMER_ID, CUSTOMER_ADDRESS_ID, STREET, REGION){
      var query = "INSERT INTO CUSTOMER_ADDR (CUSTOMER_ID, CUSTOMER_ADDRESS_ID, STREET, REGION) VALUES (?, ?, ?, ?);";
      var values = [CUSTOMER_ID, CUSTOMER_ADDRESS_ID, STREET, REGION];
console.log('Client Insert'+values);
      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          console.log('Client ADDR '+res.insertId);
          return res.insertId;
        },
        function(err) {
          console.log(err);
        }
      );
    },
    select : function(customerID){
      var query = "SELECT * FROM CUSTOMER_ADDR WHERE CUSTOMER_ID = "+customerID; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            return res.rows.item(0);
          } else {
            return null;
          }
        }
      );
    },
    deleteAll : function(){
      $cordovaSQLite.execute(db, "DELETE FROM CUSTOMER_ADDR");
    },
  }
});

sqlite.factory('salesOrderFactory', function($cordovaSQLite) {
  return {
    insert : function(CUSTOMER_ID, CUSTOMER_ADDRESS_ID, SHIPP_METHOD, PAYMENT_METHOD, SYNC){
      var query = "INSERT INTO SALESORDER (CUSTOMER_ID, CUSTOMER_ADDRESS_ID, SHIPP_METHOD, PAYMENT_METHOD, SYNC) VALUES (?, ?, ?, ?, ?);";
      var values = [CUSTOMER_ID, CUSTOMER_ADDRESS_ID, SHIPP_METHOD, PAYMENT_METHOD, SYNC];

      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          return res.insertId;
        },
        function(err) {
          console.log(err);
          return null;
        }
      );
    },
    select : function(){
      var query = "SELECT * FROM SALESORDER;"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            var returArray = [];
            for (var i = 0; i <= res.rows.length-1; i++) {
              returArray.push( res.rows.item(i) );
            };

            return returArray;
          } else {
            return null;
          }
        },
        function(err) {
          console.log(err);
          return null;
        }
      );
    },
    selectOnlyUnprocessed : function(){
      var query = "SELECT * FROM SALESORDER WHERE SYNC = 'N';"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            var returArray = [];
            for (var i = 0; i <= res.rows.length-1; i++) {
              returArray.push( res.rows.item(i) );
            };

            return returArray;
          } else {
            return null;
          }
        },
        function(err) {
          console.log(err);
          return null;
        }
      );
    },
    selectWithData : function(){
      var query = "SELECT SSD.*, CUS.FIRSTNAME, CUS.EMAIL FROM SALESORDER SSD INNER JOIN CUSTOMER CUS WHERE CUS.ID_CUSTOMER = SSD.CUSTOMER_ID;"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            var returArray = [];
            for (var i = 0; i <= res.rows.length-1; i++) {
              returArray.push( res.rows.item(i) );
            };

            return returArray;
          } else {
            return null;
          }
        },
        function(err) {
          console.log(err);
          return null;
        }
      );
    },
    checkOrder : function(id){
      $cordovaSQLite.execute(db, "UPDATE SALESORDER SET SYNC = 'S' WHERE ID = '"+id+"'");
    },   
    count : function(sku){
      var query = "SELECT COUNT(*) AS TOTORDER FROM SALESORDER";

    return $cordovaSQLite.execute(db, query).then(
      function(res) {
        if (res.rows.length > 0) {
          return res.rows.item(0);
        } else {
          return 0;
        }
      }
    );
    },
    deleteAll : function(){
      $cordovaSQLite.execute(db, "DELETE FROM SALESORDER");
    },
  }
});

sqlite.factory('salesOrderItemFactory', function($cordovaSQLite) {
  return {
    insert : function(ORDER_ID, ID_PROD, QTY){
      var query = "INSERT INTO SALESORDER_ITEM (ORDER_ID, ID_PROD, QTY) VALUES (?, ?, ?);";
      var values = [ORDER_ID, ID_PROD, QTY];

      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          return res.insertId;
        },
        function(err) {
          console.log(err);
          return null;
        }
      );
    },
    select : function(searchData){
      var query = "SELECT * FROM SALESORDER_ITEM WHERE ORDER_ID = '"+searchData+"'"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            var returArray = [];
            for (var i = 0; i <= res.rows.length-1; i++) {
              returArray.push( res.rows.item(i) );
            };

            return returArray;
          } else {
            return null;
          }
        }
      );
    },
    deleteAll : function(){
      $cordovaSQLite.execute(db, "DELETE FROM SALESORDER");
    },
  }
});

sqlite.factory('loginFactory', function($cordovaSQLite) {
  return {
    insert : function(USER, PASS, NAME){
      var query = "INSERT INTO LOGIN (USER, PASS, NAME) VALUES (?, ?, ?);";
      var values = [USER, PASS, NAME];

      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          return res.insertId;
        },
        function(err) {
          console.log(err);
        }
      );
    },
    select : function(USER, PASS){
      var query = "SELECT * FROM LOGIN WHERE USER = '"+USER+"' AND PASS = '"+PASS+"'"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            return res.rows.item(0);
          } else {
            return null;
          }
        },
        function(err) {
          console.log(err);
        }
      );
    },
    deleteAll : function(){
      $cordovaSQLite.execute(db, "DELETE FROM LOGIN");
    },
  }
});

sqlite.factory('metPagFactory', function($cordovaSQLite) {
  return {
    insert : function(MTP_ID, MTP_DESC){
      var query = "INSERT INTO MET_PAG (MTP_ID, MTP_DESC) VALUES (?, ?);";
      var values = [MTP_ID, MTP_DESC];

      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          return res.insertId;
        },
        function(err) {
          console.log(err);
        }
      );
    },
    select : function(){
      var query = "SELECT * FROM MET_PAG"; 

      return $cordovaSQLite.execute(db, query).then(
        function(res) {
          if (res.rows.length > 0) {
            var returArray = [];
            for (var i = 0; i <= res.rows.length-1; i++) {
              returArray.push( res.rows.item(i) );
            };

            return returArray;
          } else {
            return null;
          }
        },
        function(err) {
          console.log(err);
        }
      );
    },
    deleteAll : function(){
      $cordovaSQLite.execute(db, "DELETE FROM MET_PAG");
    },
  }
});