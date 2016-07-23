angular.module('app.controllers', [])

.controller('magentoPDVCtrl', function($scope) {

})

.controller('APICtrl', function($scope, $http, $rootScope, $cordovaFileTransfer, $cordovaDevice, productFactory, configurationFactory, customerFactory, customerAddressFactory, salesOrderFactory, salesOrderItemFactory) {
  //http://magepdv-shaykie.rhcloud.com/products.php?WS_URL=http://magento.db1.com.br/magento_hom/index.php&WS_USER=anymarket&WS_PASSWORD=anymarket&PORC_STOCK=100
    $scope.showInterface = true; 
    $scope.conn = [];
    $scope.countProd = 0;
    var URLPHPCTRL = 'http://magepdv-shaykie.rhcloud.com';
    $scope.saveConfiguration = function() {
      configurationFactory.deleteAll();
      configurationFactory.insert($scope.conn.WS_URL, $scope.conn.WS_LOGIN, $scope.conn.WS_PASS, $scope.conn.STOCK, $scope.conn.IMG_IMP, $scope.conn.STORE_ID);
    
      $rootScope.showLoginFunc();
    }

    $scope.loadConfiguration = function() {
      ionic.Platform.ready(function(){
        $scope.conn.WS_URL = "";
        $scope.conn.WS_LOGIN = "";
        $scope.conn.WS_PASS = "";
        $scope.conn.STOCK = "";
        $scope.conn.IMG_IMP = "";
        $scope.conn.STORE_ID = "";
        $rootScope.showLogin = false;
        configurationFactory.select().then(function(result) {
          $scope.conn.WS_URL = result.WS_URL;
          $scope.conn.WS_LOGIN = result.WS_LOGIN;
          $scope.conn.WS_PASS = result.WS_PASS;
          $scope.conn.STOCK = result.STOCK;
          $scope.conn.IMG_IMP = Boolean(result.IMG_IMP);
          $scope.conn.STORE_ID = result.STORE_ID;

          if(result.WS_URL){
            $rootScope.showLogin = true;
          }
        });
      });
    }

    $scope.getAllProducts = function() {
      ionic.Platform.ready(function(){
        $scope.loadConfiguration();
        productFactory.count().then(function(result) {
          $scope.countProd = result.TOTPROD;
        });
      });
    }

    $scope.getAllOrders = function() {
      ionic.Platform.ready(function(){
        $scope.loadConfiguration();
        salesOrderFactory.count().then(function(result) {
          $scope.countOrders = result.TOTORDER;
        });
      });
    }

    $scope.getAllProductsPHP = function() {
      configurationFactory.select().then(function(result) {
        var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS+'&PORC_STOCK='+result.STOCK;

        $scope.result = "";
        $scope.showInterface = false;

        $http.get(URLPHPCTRL + '/products.php?'+ params )
          .success(function (data, status, headers, config) {
            productFactory.deleteAll();
            for (var i = 0; i <= data.length-1; i++) {
              console.log(data[i]);
              var img1 = data[i].image1;
              var img2 = data[i].image2;
              productFactory.insert(data[i].product_id, data[i].name, data[i].sku, data[i].image1, data[i].image2, data[i].price, data[i].stock).then(function(result) {
                //if(result.IMG_IMP){
                  $scope.getSaveImagesProduct(img1, result+"/1");
                  $scope.getSaveImagesProduct(img2, result+"/2");
                //}
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


    $scope.getSaveImagesProduct = function (url, name) {
      ionic.Platform.ready(function(){
        if($cordovaDevice.getPlatform() == 'iOS'){
           fileDeviceDir = cordova.file.dataDirectory;
        }else{
           fileDeviceDir = cordova.file.externalRootDirectory;
        }

        var targetPath = fileDeviceDir  + name + ".jpg";
        var trustHosts = true;
        var options = {};

        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
          .then(function(result) {
            // Success!
          }, function(err) {
            // Error
          }, function (progress) {
        });
      });
    }


    $scope.doCreateOrderPHP = function() {
      configurationFactory.select().then(function(result) {
        salesOrderFactory.select().then(function(resultOrder) {
          for (var i = 0; i <= resultOrder.length-1; i++) {
            var OrderAt = resultOrder[i];
            customerFactory.selectById(resultOrder[i].CUSTOMER_ID).then(function(resultCustomer) {
              salesOrderItemFactory.select(OrderAt.ID).then(function(resultOrderItem) {
                var prodOrder = [];
                for (var x = 0; x <= resultOrderItem.length-1; x++) {
                  prodOrder.push( resultOrderItem[x] );
                }

                var params = {
                    WS_URL: result.WS_URL, 
                    WS_USER: result.WS_LOGIN,
                    WS_PASSWORD: result.WS_PASS,
                    STORE_ID: result.STORE_ID,
                    PAYMENT: OrderAt.PAYMENT_METHOD,
                    SHIPPING: OrderAt.SHIPP_METHOD,
                    ADDRESS: OrderAt.CUSTOMER_ADDRESS_ID,
                    CUSTOMER: resultCustomer,
                    PRODUCT: prodOrder
                };
console.log( JSON.stringify( params ) );
                $http.post(URLPHPCTRL + '/orders.php', params).then(function (res){
                  console.log( res.data );
                });
              });
            });
          };
        });
      });
    } 

    $scope.processOneCustomerAddress = function(id_customer, address) {
      customerAddressFactory.insert(id_customer, address.customer_address_id, address.street, address.region).then(function(){
        return true;
      });
    }

    $scope.processOneCustomer = function(data, address) {
      customerFactory.insert(data.customer_id, data.firstname, data.lastname, data.email, data.taxvat).then(function(result){
        for (var x = 0; x <= address.length-1; x++) {
          $scope.processOneCustomerAddress(result, address[x]);          
        }

        return result;
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
                var address = data[i].address;
                $scope.processOneCustomer(data[i], data[i].address);
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

.controller('loginCtrl', function($scope, $rootScope) {
  $rootScope.showLoginFunc = function() {
    $rootScope.showLogin = true;
  }
  
})

.controller('vendaCtrl', function($scope, $rootScope, $ionicModal, $cordovaDevice, productFactory, salesOrderFactory, salesOrderItemFactory) {
    $scope.currentItem = null;
    $rootScope.totCar = 0;
    $rootScope.cartItens = [];
    $scope.noStock = false;
    $scope.imageProd1 = null;
    $scope.imageProd2 = null;

    $scope.searchBarCode = function(sku) {
      productFactory.select(sku).then(function(result) {
        $scope.currentItem = result;
        $scope.qtyProd = 1;
        $scope.noStock = false;

        if(result){
          $scope.getImageOfProduct(result.ID);
        }else{
          $scope.imageProd1 = null;
        }
      });
    };

    $scope.addToCart = function() {
      var itemEx = false;
      $rootScope.totCar = 0;
      for(i = 0; i < $rootScope.cartItens.length; i++) { 
        if($rootScope.cartItens[i].ID == $scope.currentItem.ID){
          uptQTY = Number($rootScope.cartItens[i].QTY)+Number($scope.qtyProd);
          if( $rootScope.cartItens[i].STOCK >= uptQTY ){
            $rootScope.cartItens[i].QTY = uptQTY;
          }else{
            $scope.noStock = true;
          }
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
      salesOrderFactory.insert($rootScope.customer[0].ID, $rootScope.addressCustomer[0].CUSTOMER_ADDRESS_ID, 'flatrate_flatrate', 'checkmo', 'N').then(function(result){
        for (var i = 0; i <= $rootScope.cartItens.length - 1; i++) {
          console.log( $rootScope.cartItens );
          salesOrderItemFactory.insert(result, $rootScope.cartItens[i].PRODUCT_ID, $rootScope.cartItens[i].QTY);
        };

        $rootScope.totCar = 0;
        $rootScope.cartItens = []; 
      });
    }; 

    $scope.getImageOfProduct = function(id_product) {
      $scope.imageProd1 = null;
      $scope.imageProd2 = null;
      if($cordovaDevice.getPlatform() == 'iOS'){
         fileDeviceDir = cordova.file.dataDirectory;
      }else{
         fileDeviceDir = cordova.file.externalRootDirectory;
      }

      $scope.imageProd1 = fileDeviceDir + id_product + "/1.jpg";
      $scope.imageProd2 = fileDeviceDir + id_product + "/2.jpg";
      console.log( $scope.imageProd1 );
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

    $ionicModal.fromTemplateUrl('methods.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalMethods = modal;
    });

    $scope.closeModalMethods = function() {
      $scope.modalMethods.hide();
    };

    $scope.acceptModalMethods = function() {
      $scope.modalMethods.hide();
    };

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
