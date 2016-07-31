angular.module('app.controllers', [])

.controller('magentoPDVCtrl', function($scope) {

})

.controller('printCtrl', function($scope, $rootScope, $cordovaPrinter, salesOrderFactory, customerFactory, salesOrderItemFactory ) {
    $rootScope.print = function(orderToPrint) {
      $rootScope.orderPrint = [];

      document.addEventListener('deviceready', function () {
        salesOrderFactory.select(orderToPrint.ID).then(function(resultOrder) {
          for (var i = 0; i <= resultOrder.length-1; i++) {
            var OrderAt = resultOrder[i];
            customerFactory.selectById(resultOrder[i].CUSTOMER_ID).then(function(resultCustomer) {
              salesOrderItemFactory.select(OrderAt.ID).then(function(resultOrderItem) {
                var prodOrder = [];
                for (var x = 0; x <= resultOrderItem.length-1; x++) {
                  prodOrder.push( resultOrderItem[x] );  
                }

                $rootScope.orderPrint.customer = resultCustomer.FIRSTNAME;
                $rootScope.orderPrint.tot = OrderAt.TOT_VLR;
                $rootScope.orderPrint.payMet = OrderAt.PAYMENT_METHOD;
                $rootScope.orderPrint.items = prodOrder;
 
                cordova.plugins.printer.isAvailable(
                  function (isAvailable, installedAppIds) {
                      if (isAvailable) {
                        var page = document.getElementById('repForPrint');
                        cordova.plugins.printer.print(page, 'Document.html', function () {

                        });
                      }else{
                        alert('Impressora não disponivel');
                      }
                  }
                );

              });
            });
          };
        });
      
      }, false);

    }

})

.controller('APICtrl', function($scope, $http, $rootScope, $cordovaFileTransfer, $cordovaDevice, productFactory, configurationFactory, customerFactory, customerAddressFactory, salesOrderFactory, salesOrderItemFactory, loginFactory, metPagFactory) {
  //http://magepdv-shaykie.rhcloud.com/products.php?WS_URL=http://magento.db1.com.br/magento_hom/index.php&WS_USER=anymarket&WS_PASSWORD=anymarket&PORC_STOCK=100
    $rootScope.showInterface = true; 
    $rootScope.conn = [];
    $scope.countProd = 0;

    $rootScope.impCustomerTot = 0;
    $rootScope.impCustomerAtual = 0;
    $rootScope.impCustomerStatus = "";

    $rootScope.impProdTot = 0;
    $rootScope.impProdAtual = 0;
    $rootScope.impProdStatus = "";

    $rootScope.conn.WS_URL = "";
    $rootScope.conn.WS_LOGIN = "";
    $rootScope.conn.WS_PASS = "";
    $rootScope.conn.STOCK = "";
    $rootScope.conn.IMG_IMP = "";
    $rootScope.conn.STORE_ID = "";
    $rootScope.conn.BARCODE = 1;
    $rootScope.barcodesOpts = ['Barcode Default', 'Barcode Advanced'];

    var URLPHPCTRL = 'http://magepdv-shaykie.rhcloud.com';

    $scope.getConfigs = function(emp) {
      $http.get(URLPHPCTRL + '/configurations.php?EMP='+emp)
        .success(function (data, status, headers, config) {
          $rootScope.conn.WS_URL = data.WS_URL;
          $rootScope.conn.WS_LOGIN = data.WS_LOGIN;
          $rootScope.conn.WS_PASS = data.WS_PASS;
          $rootScope.conn.STOCK = data.STOCK;
          $rootScope.conn.IMG_IMP = data.IMG_IMP;
          $rootScope.conn.STORE_ID = data.STORE_ID;
          $rootScope.conn.BARCODE = 1;

          $rootScope.saveConfiguration();
        })
        .error(function (data, status, headers, config) {
          console.log('data error');
        })
        .then(function (result) {
          things = result.data;
      });

    }

    $rootScope.saveConfiguration = function() {
      configurationFactory.deleteAll();
      configurationFactory.insert($rootScope.conn.WS_URL, $rootScope.conn.WS_LOGIN, $rootScope.conn.WS_PASS, $rootScope.conn.STOCK, $rootScope.conn.IMG_IMP, $rootScope.conn.BARCODE, $rootScope.conn.STORE_ID);
    
      $rootScope.getAllLoginPHP();
      $rootScope.getAllMetPagPHP();
      $rootScope.showLoginFunc();
    }

    $scope.loadConfiguration = function() {
      ionic.Platform.ready(function(){
        $rootScope.conn.WS_URL = "";
        $rootScope.conn.WS_LOGIN = "";
        $rootScope.conn.WS_PASS = "";
        $rootScope.conn.STOCK = "";
        $rootScope.conn.IMG_IMP = "";
        $rootScope.conn.STORE_ID = "";
        $rootScope.conn.BARCODE = 1;
        $rootScope.showLogin = false;

        configurationFactory.select().then(function(result) {
          if( result != null ){
            $rootScope.conn.WS_URL = result.WS_URL;
            $rootScope.conn.WS_LOGIN = result.WS_LOGIN;
            $rootScope.conn.WS_PASS = result.WS_PASS;
            $rootScope.conn.STOCK = result.STOCK;
            $rootScope.conn.IMG_IMP = result.IMG_IMP;
            $rootScope.conn.STORE_ID = result.STORE_ID;
            $rootScope.conn.BARCODE = result.BARCODE;

            if(result.WS_URL){
              $rootScope.showLogin = true;
            }
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

    $rootScope.getAllLoginPHP = function() {
      configurationFactory.select().then(function(result) {
        var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS;

        $scope.result = "";
        $rootScope.showInterface = false;

        $http.get(URLPHPCTRL + '/f_vendedores.php?'+ params )
          .success(function (data, status, headers, config) {
            loginFactory.deleteAll();
            for (var i = 0; i <= data.length-1; i++) {
              loginFactory.insert(data[i].vend_id, data[i].vend_password, data[i].vend_name).then(function(result) {
              });
            };

            $rootScope.showInterface = true;
          })
          .error(function (data, status, headers, config) {
            console.log('data error');
          })
          .then(function (result) {
            things = result.data;
        });
      });
    }

    $rootScope.getAllMetPagPHP = function() {
      configurationFactory.select().then(function(result) {
        var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS;

        $http.get(URLPHPCTRL + '/f_met_pag.php?'+ params )
          .success(function (data, status, headers, config) {
            metPagFactory.deleteAll();
            for (var i = 0; i <= data.length-1; i++) {
              metPagFactory.insert(data[i].mtp_id, data[i].mtp_desc).then(function(result) {
              });
            };
          })
          .error(function (data, status, headers, config) {
            console.log('data error');
          })
          .then(function (result) {
            things = result.data;
        });
      });
    }

    $scope.getAllProductsPHP = function() {
      configurationFactory.select().then(function(result) {
        var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS+'&PORC_STOCK='+result.STOCK;

        $scope.result = "";
        $rootScope.showInterface = false;
        $rootScope.impProdStatus = "Conectando com o Servidor.";
        $http.get(URLPHPCTRL + '/products.php?'+ params )
          .success(function (data, status, headers, config) {
            productFactory.deleteAll();

            $rootScope.impCustomerAtual = "";
            $rootScope.impCustomerTot = "";

            $rootScope.impProdTot = data.length;
            $rootScope.impProdAtual = 0;
            $rootScope.impProdStatus = "Importando Produtos aguarde.";
            for (var i = 0; i <= data.length-1; i++) {
              $scope.saveProduct(data[i]);
            };

          })
          .error(function (data, status, headers, config) {
            console.log('data error');
          })
          .then(function (result) {
            things = result.data;
        });
      });
    }

    $scope.saveProduct = function (data) {
      var img1 = data.image1;
      productFactory.insert(data.product_id, data.name, data.sku, data.image1, data.image2, data.price, data.stock, data.group_price).then(function(result) {

        if(result.IMG_IMP == "true"){
          $scope.getSaveImagesProduct(img1, result+"/1");
        }else{
          $rootScope.impProdAtual += 1;
          if($rootScope.impProdAtual >= $rootScope.impProdTot){
            $rootScope.impProdStatus = "";
            //$rootScope.showInterface = true;
          }
        }
      });
    }

    $scope.getSaveImagesProduct = function (url, name) {
      ionic.Platform.ready(function(){
        if($cordovaDevice.getPlatform() == 'iOS'){
           fileDeviceDir = cordova.file.dataDirectory;
        }else{
           fileDeviceDir = cordova.file.externalRootDirectory;
        }

        var targetPath = fileDeviceDir + "magepdv/" + name + ".jpg";
        var trustHosts = true;
        var options = {};

        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
          .then(function(result) {
            $rootScope.impProdAtual += 1;
            if($rootScope.impProdAtual >= $rootScope.impProdTot){
              $rootScope.showInterface = true;
            }
          }, function(err) {
            $rootScope.impProdAtual += 1;
            if($rootScope.impProdAtual >= $rootScope.impProdTot){
              $rootScope.showInterface = true;
            }
          }, function (progress) {
        });
      });
    }


    $scope.doCreateOrderPHP = function() {
      configurationFactory.select().then(function(result) {
        salesOrderFactory.selectOnlyUnprocessed().then(function(resultOrder) {
          if(resultOrder){
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
                      FEIRA: '1',
                      STORE_ID: result.STORE_ID,
                      PAYMENT: OrderAt.PAYMENT_METHOD,
                      SHIPPING: OrderAt.SHIPP_METHOD,
                      ADDRESS: OrderAt.CUSTOMER_ADDRESS_ID,
                      CUSTOMER: resultCustomer,
                      PRODUCT: prodOrder
                  };

                  $http.post(URLPHPCTRL + '/orders.php', params).then(function (res){
                    salesOrderFactory.checkOrder(OrderAt.ID);
                    console.log( res.data );
                  });
                });
              });
            };
          }else{
            alert('Não ha vendas para serem exportadas.');
          }
        });
      });
    } 

    $scope.processOneCustomer = function(data, address) {
      $rootScope.addreeIns = address;
      customerFactory.insert(data.customer_id, data.group_id, data.firstname, data.lastname, data.email, data.taxvat, address);
    }

    $scope.getAllCustomersPHP = function() {
        configurationFactory.select().then(function(result) {
          var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS;
          $rootScope.showInterface = false;
          $rootScope.impCustomerStatus = "Conectando com o Servidor.";
          
          $http.get(URLPHPCTRL + '/customers.php?'+ params )
            .success(function (data, status, headers, config) {
              customerFactory.deleteAll();
              customerAddressFactory.deleteAll();

              $rootScope.impProdTot = "";
              $rootScope.impProdAtual = "";

              $rootScope.impCustomerStatus = 'Importando Clientes aguarde.';
              $rootScope.impCustomerAtual = 0;
              $rootScope.impCustomerTot = data.length;
              for (var i = 0; i <= data.length-1; i++) {
                var address = data[i].address;
                $scope.processOneCustomer(data[i], data[i].address);
              };

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

.controller('loginCtrl', function($scope, $rootScope, $state, $ionicPopup, loginFactory, md5) {
  $rootScope.loginUser = "";
  $rootScope.loginPassword = "";

  $rootScope.showLoginFunc = function() {
    $rootScope.showLogin = true;
  }

  $scope.doLogin = function(USER, PASS) {
    PASS = md5.createHash(PASS);
    loginFactory.select(USER, PASS).then(function(result) {
      if(result){
        $state.go('tabsController.magentoPDV');
      }else{
        var alertPopup = $ionicPopup.alert({
          title: 'Falha no acesso',
          template: 'Verifique seu login e senha.'
        });
      }
    });
  }
  
})

.controller('vendaCtrl', function($scope, $rootScope, $ionicModal, $cordovaDevice, $ionicPopup, productFactory, salesOrderFactory, salesOrderItemFactory, metPagFactory) {
    $scope.currentItem = null;
    $rootScope.totCar = 0;
    $rootScope.cartItens = [];
    $scope.noStock = false;
    $scope.imageProd1 = null;
    $scope.PaymentMethod = [];
    $scope.PaymentMethod.value = null;

    $scope.searchBarCode = function(sku) {
      console.log($rootScope.customer[0]);
      productFactory.select(sku, $rootScope.customer[0].GROUP_ID).then(function(result) {
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
      $scope.imageProd1 = null;
    };    

    $scope.removeFromCart = function(item) {
      $rootScope.totCar = 0;
      $rootScope.ctrlArray = [];

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

    $scope.loadAllOrders = function (){
      ionic.Platform.ready(function(){
        salesOrderFactory.selectWithData().then(function(resultOrder) {
          $scope.ordersRel = resultOrder;
        });
      });
    }

    $scope.showPayMenu = function() {
      metPagFactory.select().then(function(result){
        $rootScope.payments = result;

        $rootScope.ctrlArray = [];
        for (var i = 0; i <= result.length-1; i++) {
          $rootScope.ctrlArray[ result[i].MTP_ID ] = result[i].MTP_DESC;
        };

        $scope.modalMethods.show();
      });
    }

    $scope.placeOrder = function() {
      console.log( $rootScope.PaymentMethod );
      console.log( $rootScope.ctrlArray );

      salesOrderFactory.insert($rootScope.customer[0].ID, $rootScope.customer[0].FIRSTNAME, $rootScope.addressCustomer[0].CUSTOMER_ADDRESS_ID, 'pedroteixeira_correios_41068', $rootScope.ctrlArray[$rootScope.PaymentMethod.ID], $rootScope.PaymentMethod.ID, $rootScope.totCar, 'N').then(function(result){
        for (var i = 0; i <= $rootScope.cartItens.length - 1; i++) {
          salesOrderItemFactory.insert(result, $rootScope.cartItens[i].PRODUCT_ID, $rootScope.cartItens[i].SKU, $rootScope.cartItens[i].PRICE, $rootScope.cartItens[i].NAME, $rootScope.cartItens[i].QTY);
        };

        var alertPopup = $ionicPopup.alert({
          title: 'Venda',
          template: 'Finalizada com sucesso.'
        });

        $rootScope.totCar = 0;
        $rootScope.cartItens = []; 
      });
    }; 

    $scope.getImageOfProduct = function(id_product) {
      $scope.imageProd1 = null;
      if($cordovaDevice.getPlatform() == 'iOS'){
         fileDeviceDir = cordova.file.dataDirectory;
      }else{
         fileDeviceDir = cordova.file.externalRootDirectory;
      }

      $scope.imageProd1 = fileDeviceDir + "magepdv/" + id_product + "/1.jpg";
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

    $scope.setPayMethod = function(metd) {
      $rootScope.PaymentMethod = metd;
      $scope.modalMethods.hide();
      $scope.placeOrder();
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
        console.log(result);
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

.controller("barcodeCtrl", function($scope, $rootScope, $cordovaBarcodeScanner) {
    $rootScope.showBarCodeRTC = false;
    $scope.barcodeNumber = "";
    $scope.scanBarcode = function() {
      console.log($rootScope.conn.BARCODE);
        if( $rootScope.conn.BARCODE == "Barcode Default" ){
          $cordovaBarcodeScanner.scan().then(function(imageData) {
              $scope.barcodeNumber = imageData.text;
          }, function(error) {
              console.log(error);
          });
        }else{
          $rootScope.showBarCodeRTC = true;
          
          ionic.Platform.ready(function(){
            barcode.config.start = 0.1;
            barcode.config.end = 0.9;
            barcode.config.video = '#barcodevideo';
            barcode.config.canvas = '#barcodecanvas';
            barcode.config.canvasg = '#barcodecanvasg';
            barcode.setHandler(function(barcode) {
              jQuery('#result').html(barcode);
            });
            barcode.init();

            jQuery('#result').bind('DOMSubtreeModified', function(e) {
              console.log('asdasdasdasd'); 
            });

          });
        }

    };

})
