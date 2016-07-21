var db = null;
var sqlite = angular.module('sqlite', ['ionic', 'ngCordova']);

sqlite.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if (window.cordova) {
      db = $cordovaSQLite.openDB({ name: "magepdv.db", location: 'default' }); //device
    }else{
      db = window.openDatabase("magepdv.db", '1', 'magepdv', 1024 * 1024 * 100); // browser
    }

    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS PRODUCT (ID integer primary key, PRODUCT_ID integer, NAME varchar(250), SKU varchar(30), PRICE real, STOCK real)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS CONFIGURATION (ID integer primary key, WS_URL varchar(250), WS_LOGIN varchar(250), WS_PASS varchar(250), STOCK real)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS CUSTOMER (ID integer primary key, FIRSTNAME varchar(250), LASTNAME varchar(250), EMAIL varchar(250), TAXVAT varchar(250))");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS CUSTOMER_ADDR (ID integer primary key, CUSTOMER_ID integer, CUSTOMER_ADDRESS_ID integer, STREET varchar(250), REGION varchar(250) )");

    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS SALESORDER (ID integer primary key, CUSTOMER_ID integer, CUSTOMER_ADDRESS_ID integer, SHIPP_METHOD varchar(250), PAYMENT_METHOD varchar(250), SYNC varchar(1) )");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS SALESORDER_ITEM (ID integer primary key, ORDER_ID integer, ID_PROD integer, QTY float )");
  });
});

sqlite.factory('configurationFactory', function($cordovaSQLite) {
  return {
    insert : function(WS_URL, WS_LOGIN, WS_PASS, STOCK){
      var query = "INSERT INTO CONFIGURATION (WS_URL, WS_LOGIN, WS_PASS, STOCK) VALUES (?, ?, ?, ?);";
      var values = [WS_URL, WS_LOGIN, WS_PASS, STOCK];

      $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          console.log('INSERTED ID: '+res.insertId);
        },
        function(err) {
          console.log('ERROR: '+err);
        }
    );
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
      $cordovaSQLite.execute(db, "DELETE FROM CONFIGURATION");
    },
  }
});

sqlite.factory('productFactory', function($cordovaSQLite) {
  return {
    insert : function(productID, name, sku, price, stock){
	    var query = "INSERT INTO PRODUCT (PRODUCT_ID, NAME, SKU, PRICE, STOCK) VALUES (?, ?, ?, ?, ?);";
	  	var values = [productID, name, sku, price, stock];

     	$cordovaSQLite.execute(db, query, values).then(
		    function(res) {
		      console.log('INSERTED ID: '+res.insertId);
		    },
		    function(err) {
		      console.log('ERROR: '+err);
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

sqlite.factory('customerFactory', function($cordovaSQLite) {
  return {
    insert : function(FIRSTNAME, LASTNAME, EMAIL, TAXVAT){
      var query = "INSERT INTO CUSTOMER (FIRSTNAME, LASTNAME, EMAIL, TAXVAT) VALUES (?, ?, ?, ?);";
      var values = [FIRSTNAME, LASTNAME, EMAIL, TAXVAT];

      return $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          return res.insertId;
        },
        function(err) {
          console.log('ERROR: '+err);
          return null;
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

      $cordovaSQLite.execute(db, query, values).then(
        function(res) {
          return res.insertId;
        },
        function(err) {
          console.log('ERROR: '+err);
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
    select : function(searchData){
      var query = "SELECT * FROM SALESORDER"; 

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
      var query = "SELECT * FROM SALESORDER_ITEM"; 

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
      $cordovaSQLite.execute(db, "DELETE FROM SALESORDER");
    },
  }
});