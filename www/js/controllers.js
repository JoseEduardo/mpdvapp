angular.module('app.controllers', [])

.controller('magentoPDVCtrl', function($scope) {

})

.controller('APICtrl', function($scope, $http, productFactory, configurationFactory, customerFactory, customerAddressFactory) {
  //http://magepdv-shaykie.rhcloud.com/products.php?WS_URL=http://magento.db1.com.br/magento_hom/index.php&WS_USER=anymarket&WS_PASSWORD=anymarket&PORC_STOCK=100
    $scope.showInterface = true; 
    $scope.conn = [];
    var URLPHPCTRL = 'http://magepdv-shaykie.rhcloud.com';
    $scope.saveConfiguration = function() {
      configurationFactory.deleteAll();
      configurationFactory.insert($scope.conn.WS_URL, $scope.conn.WS_LOGIN, $scope.conn.WS_PASS, $scope.conn.STOCK);
    }

    $scope.loadConfiguration = function() {
      $scope.conn.WS_URL = "";
      $scope.conn.WS_LOGIN = "";
      $scope.conn.WS_PASS = "";
      $scope.conn.STOCK = "";
      configurationFactory.select().then(function(result) {
        $scope.conn.WS_URL = result.WS_URL;
        $scope.conn.WS_LOGIN = result.WS_LOGIN;
        $scope.conn.WS_PASS = result.WS_PASS;
        $scope.conn.STOCK = result.STOCK;
      });
    }

    $scope.getAllProductsPHP = function() {

      configurationFactory.select().then(function(result) {
        var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS+'&PORC_STOCK='+result.STOCK;

        $scope.result = "";
        $scope.showInterface = false;

        $http.get(URLPHPCTRL + '/products.php?'+ params )
          .success(function (data, status, headers, config) {
            //VALIDAR SE RETORNOU ALGO - TAVELZ COLOCAR NO BACKEND
            productFactory.deleteAll();
            for (var i = 0; i <= data.length-1; i++) {
              console.log(data[i]);
              productFactory.insert(data[i].product_id, data[i].name, data[i].sku, data[i].price, data[i].stock);
            };

            $scope.showInterface = true;
          })
          .error(function (data, status, headers, config) {
            console.log('data error');
          })
          .then(function (result) {
            things = result.data;
        });
      });
    }

    $scope.getAllCustomersPHP = function() {
        configurationFactory.select().then(function(result) {
          var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS;
          $scope.showInterface = false;

          $http.get(URLPHPCTRL + '/customers.php?'+ params )
            .success(function (data, status, headers, config) {
              customerFactory.deleteAll();
              customerAddressFactory.deleteAll();
              for (var i = 0; i <= data.length-1; i++) {
                $scope.address = data[i].address;
                customerFactory.insert(data[i].firstname, data[i].lastname, data[i].email, data[i].taxvat).then(function(result){

                  address = $scope.address;
                  for (var x = 0; x <= address.length-1; x++) {
                    customerAddressFactory.insert(result, address[x].customer_address_id, address[x].street, address[x].region);
                  }
                });
              };

              $scope.showInterface = true;
            })
            .error(function (data, status, headers, config) {
              console.log('data error');
            })
            .then(function (result) {
              things = result.data;
            });
        });
    }

})

.controller('loginCtrl', function($scope) {

})

.controller('vendaCtrl', function($scope, productFactory) {
    $scope.cartItens = [];
    $scope.currentItem = null;

    $scope.searchBarCode = function(sku) {
      productFactory.select(sku).then(function(result) {
        $scope.currentItem = result;
        $scope.qtyProd = 1;
      });
    };

    $scope.addToCart = function() {
      var itemEx = false;
      for(i = 0; i < $scope.cartItens.length; i++) { 
        if($scope.cartItens[i].ID == $scope.currentItem.ID){
          $scope.cartItens[i].QTY = Number($scope.cartItens[i].QTY)+Number($scope.qtyProd);
          itemEx = true;
          break;
        } 
      }

      if(itemEx == false){
        $scope.currentItem.QTY = $scope.qtyProd;
        $scope.cartItens.push($scope.currentItem);
      }

      $scope.currentItem = null;
    };    

    $scope.removeFromCart = function(item) {
      for(i = 0; i < $scope.cartItens.length; i++) { 
        if($scope.cartItens[i] == item){
          $scope.cartItens.splice(i, 1);
        } 
      }
    }; 

})

.controller('clienteCtrl', function($scope, customerFactory, customerAddressFactory) {
    $scope.currentItem = null;

    $scope.searchCustomer = function(email) {

      customerFactory.select(email).then(function(result) {
        $scope.customer = [];
        $scope.currentItem = result;

        $scope.customer.push($scope.currentItem);
        customerAddressFactory.select(result['ID']).then(function(result) {
          console.log(result);
          $scope.addressCustomer = [];
          $scope.addressCustomer.push(result);
        });

      });
    };

})

.controller("barcodeCtrl", function($scope, $cordovaBarcodeScanner) {
    $scope.barcodeNumber = "";
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            $scope.barcodeNumber = imageData.text;
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    };

})
