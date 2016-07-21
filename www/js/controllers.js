angular.module('app.controllers', [])

.controller('magentoPDVCtrl', function($scope) {

})

.controller('APICtrl', function($scope, $http, $rootScope, productFactory, configurationFactory, customerFactory, customerAddressFactory, salesOrderFactory) {
  //http://magepdv-shaykie.rhcloud.com/products.php?WS_URL=http://magento.db1.com.br/magento_hom/index.php&WS_USER=anymarket&WS_PASSWORD=anymarket&PORC_STOCK=100
    $scope.showInterface = true; 
    $scope.conn = [];
    $scope.countProd = 0;
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

    $scope.getAllProducts = function() {
      $scope.loadConfiguration();
      productFactory.count().then(function(result) {
        $scope.countProd = result.TOTPROD;
      });
    }

    $scope.getAllOrders = function() {
      $scope.loadConfiguration();
      salesOrderFactory.count().then(function(result) {
        $scope.countOrders = result.TOTORDER;
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

.controller('vendaCtrl', function($scope, $rootScope, $ionicModal, productFactory, salesOrderFactory, salesOrderItemFactory) {
    $scope.currentItem = null;
    $rootScope.totCar = 0;
    $rootScope.cartItens = [];

    $scope.searchBarCode = function(sku) {
      productFactory.select(sku).then(function(result) {
        $scope.currentItem = result;
        $scope.qtyProd = 1;
      });
    };

    $scope.addToCart = function() {
      var itemEx = false;
      $rootScope.totCar = 0;
      for(i = 0; i < $rootScope.cartItens.length; i++) { 
        if($rootScope.cartItens[i].ID == $scope.currentItem.ID){
          $rootScope.cartItens[i].QTY = Number($rootScope.cartItens[i].QTY)+Number($scope.qtyProd);
          itemEx = true;
        } 

        $rootScope.totCar += Number($rootScope.cartItens[i].QTY)*Number($rootScope.cartItens[i].PRICE);
      }

      if(itemEx == false){
        $scope.currentItem.QTY = $scope.qtyProd;
        $rootScope.cartItens.push($scope.currentItem);

        $rootScope.totCar += Number($scope.currentItem.QTY)*Number($scope.currentItem.PRICE);
      }

      $scope.barcodeNumber = null;
      $scope.currentItem = null;
    };    

    $scope.removeFromCart = function(item) {
      $rootScope.totCar = 0;
      for(i = 0; i < $rootScope.cartItens.length; i++) { 
        if($rootScope.cartItens[i] == item){
          $rootScope.cartItens.splice(i, 1);
        }else{
          $rootScope.totCar += Number($rootScope.cartItens[i].QTY)*Number($rootScope.cartItens[i].PRICE);
        }   
      }
    }; 

    $scope.editQtyCart = function(item) {
      $scope.modal.show();
      $scope.edtItem = item.NAME;
      $rootScope.qtyItemEDT = item.QTY;

      $rootScope.itemForEdit = item;
    }; 

    $scope.placeOrder = function() {
      salesOrderFactory.insert($rootScope.customer[0].ID, $rootScope.addressCustomer[0].CUSTOMER_ADDRESS_ID, 'freeshipping_freeshipping', 'checkmo', 'N').then(function(result){
        for (var i = 0; i <= $rootScope.cartItens.length - 1; i++) {
          salesOrderItemFactory.insert(result, $rootScope.cartItens[i].ID, $rootScope.cartItens[i].QTY);
        };

        $rootScope.totCar = 0;
        $rootScope.cartItens = []; 
      });
    }; 

    $ionicModal.fromTemplateUrl('editcart.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.acceptModal = function(qtyItemEDT) {
      for(i = 0; i < $rootScope.cartItens.length; i++) { 
        if($rootScope.cartItens[i] == $rootScope.itemForEdit){
          $rootScope.cartItens[i].QTY = qtyItemEDT;
        }
        $rootScope.totCar += Number($rootScope.cartItens[i].QTY)*Number($rootScope.cartItens[i].PRICE);
      }

      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });


})

.controller('clienteCtrl', function($scope, $rootScope, customerFactory, customerAddressFactory) {
    $rootScope.customer = [];
    $rootScope.addressCustomer = [];
    $scope.currentItem = null;

    $scope.searchCustomer = function(email) {

      customerFactory.select(email).then(function(result) {
        $rootScope.customer = [];
        $scope.currentItem = result;

        if( result != null ){
          $rootScope.customer.push($scope.currentItem);
          customerAddressFactory.select(result['ID']).then(function(result) {
            console.log(result);
            $rootScope.addressCustomer = [];
            $rootScope.addressCustomer.push(result);
          });
        }

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
