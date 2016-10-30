angular.module('app.controllers', [])

.controller('magentoPDVCtrl', function($scope) {

})

.controller('APICtrl', function($scope, $q, $http, $rootScope, $cordovaFileTransfer, $cordovaDevice, productFactory, configurationFactory, customerFactory, customerAddressFactory, salesOrderFactory, salesOrderItemFactory, loginFactory, metPagFactory, customerGroupFactory) {
  //http://magepdv-shaykie.rhcloud.com/products.php?WS_URL=http://magento.db1.com.br/magento_hom/index.php&WS_USER=anymarket&WS_PASSWORD=anymarket&PORC_STOCK=100
    $rootScope.showInterface = true; 
    $rootScope.conn = [];
    $rootScope.countProd = 0;

    $rootScope.procTotal = 0;
    $rootScope.procAtual = 0;
    $rootScope.impCustomerStatus = "";

    $rootScope.procTotal = 0;
    $rootScope.procAtual = 0;
    $rootScope.impProdStatus = "";

    $rootScope.conn.WS_URL = "";
    $rootScope.conn.WS_LOGIN = "";
    $rootScope.conn.WS_PASS = "";
    $rootScope.conn.STOCK = "";
    $rootScope.conn.IMG_IMP = "";
    $rootScope.conn.STORE_ID = "";
    $rootScope.conn.BARCODE = 1;
    $rootScope.barcodesOpts = ['Barcode Default', 'Barcode Advanced'];

    $rootScope.regionsOpts = [
      'Acre',
      'Alagoas',
      'Amapá',
      'Amazonas',
      'Bahia',
      'Ceará',
      'Distrito Federal',
      'Espírito Santo',
      'Goiás',
      'Maranhão',
      'Mato Grosso',
      'Mato Grosso do Sul',
      'Minas Gerais',
      'Pará',
      'Paraíba',
      'Paraná',
      'Pernambuco',
      'Piauí',
      'Rio de Janeiro',
      'Rio Grande do Norte',
      'Rio Grande do Sul',
      'Rondônia',
      'Roraima',
      'Santa Catarina',
      'São Paulo',
      'Sergipe',
      'Tocantins'
    ];

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

    $rootScope.getNetState = function() {
      return navigator.onLine;
    }

    $rootScope.saveConfiguration = function() {
      configurationFactory.deleteAll();
      configurationFactory.insert($rootScope.conn.WS_URL, $rootScope.conn.WS_LOGIN, $rootScope.conn.WS_PASS, $rootScope.conn.STOCK, $rootScope.conn.IMG_IMP, $rootScope.conn.BARCODE, $rootScope.conn.STORE_ID);
    
      $rootScope.getAllLoginPHP();
      $rootScope.getAllMetPagPHP();
      $rootScope.showLoginFunc();

      alert('Configurações Salvas');
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
          $rootScope.countProd = result.TOTPROD;
        });
      });
    }

    $rootScope.getAllOrders = function() {
      ionic.Platform.ready(function(){
        $scope.loadConfiguration();
        salesOrderFactory.countUnprocessed().then(function(result) {
          $rootScope.countOrders = result.TOTORDER;
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

            $scope.getAllCustomerGroupsPHP();
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
            $rootScope.procTotal = data.length;
            $rootScope.procAtual = 0;
            $rootScope.impProdStatus = "Importando Produtos aguarde.";

            productFactory.deleteAll();
            $rootScope.imgsImport = [];
            for (var i = 0; i <= data.length-1; i++) {
              $scope.saveProduct(data[i], result.IMG_IMP);
            };

          })
          .error(function (data, status, headers, config) {
            $rootScope.procAtual = "";
            $rootScope.procTotal = "";

            $rootScope.procTotal = "";
            $rootScope.procAtual = 0;
            $rootScope.impProdStatus = "";
            $rootScope.showInterface = true;
            alert( 'Ocorreu um erro ao se conectar com o Servidor.' );
          });
      });
    }

    $scope.saveProduct = function (data, impIMG) {
      $rootScope.impIMG = impIMG;
      var img1 = data.image1;

      var objImgsProd = new Object();
      objImgsProd.url = img1;
      objImgsProd.idp = data.product_id;

      $rootScope.imgsImport.push(objImgsProd);
      try {
        productFactory.insert(data.product_id, data.name, data.cod_barra, data.sku, data.image1, data.image2, data.price, data.stock, data.group_price);
      }catch(err) {
        console.log( err );
      }
    }

    $rootScope.doProcImagesProd = function (index){
      $rootScope.procTotal = $rootScope.imgsImport.length;
      $rootScope.procAtual = $rootScope.procAtual+10;
      $rootScope.impProdStatus = "Importando Imagens, aguarde...";

      var maxLengthImgImp = $rootScope.imgsImport.length;
      $rootScope.procAtualImgPrd = 0;
      $rootScope.maxIdxProd = 10;
      $rootScope.prodIndex = index;
      if( index < maxLengthImgImp ){
        var maxIndex = index+$rootScope.maxIdxProd;
        maxIndex = maxIndex > maxLengthImgImp ? maxLengthImgImp : maxIndex;
        for (var i = index; i <= maxIndex; i++) {
          var ObjImg = $rootScope.imgsImport[i];
          try {  
            $scope.doSaveImagesProduct(ObjImg.url, ObjImg.idp+"/1");
          }catch(err) {
            console.log(err);
          }
        };
      }else{
        $rootScope.showInterface = true;
      }

    }

    $scope.doSaveImagesProduct = function (url, name) {
      ionic.Platform.ready(function(){
        try{
          if($cordovaDevice.getPlatform() == 'iOS'){
             fileDeviceDir = cordova.file.dataDirectory;
          }else{
             fileDeviceDir = cordova.file.externalRootDirectory;
          }

          var targetPath = fileDeviceDir + "magepdv/" + name + ".jpg";
          var trustHosts = true;
          var options = {};
          if( url != "" ){
            console.log( url );
            url = url.replace("https", "http");
            $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
              .then(function(result) {
                $rootScope.procAtualImgPrd += 1;
                if($rootScope.procAtualImgPrd >= $rootScope.maxIdxProd){
                  $rootScope.doProcImagesProd( ($rootScope.prodIndex+$rootScope.maxIdxProd)+1 );
                }
              }, function(err) {
                console.log(err);
                $rootScope.procAtualImgPrd += 1;
                if($rootScope.procAtualImgPrd >= $rootScope.maxIdxProd){
                  $rootScope.doProcImagesProd( ($rootScope.prodIndex+$rootScope.maxIdxProd)+1 );
                }
              }, function (progress) {
            });
          }else{
            $rootScope.procAtualImgPrd += 1;
            if($rootScope.procAtualImgPrd >= $rootScope.maxIdxProd){
              $rootScope.doProcImagesProd( ($rootScope.prodIndex+$rootScope.maxIdxProd)+1 );
            }            
          }
        }catch(err) {
          console.log( err );
          $rootScope.procAtualImgPrd += 1;
          if($rootScope.procAtualImgPrd >= $rootScope.maxIdxProd){
            $rootScope.doProcImagesProd( ($rootScope.prodIndex+$rootScope.maxIdxProd)+1 );
          }          
        }

      });
    }

    $rootScope.exportSpecificOrder = function(result, OrderAt) {
      $rootScope.showInterface = false;
      var deferred = $q.defer();
      customerFactory.selectById(OrderAt.CUSTOMER_ID).then(function(resultCustomer) {
        salesOrderItemFactory.select(OrderAt.ID).then(function(resultOrderItem) {
          var prodOrder = [];
          for (var x = 0; x <= resultOrderItem.length-1; x++) {
            prodOrder.push( resultOrderItem[x] );
          }

          if( resultCustomer.ID_CUSTOMER <= 0 ){
            customerAddressFactory.select(resultCustomer.ID).then(function(resultCAddress) {
              var params = {
                  WS_URL: result.WS_URL, 
                  WS_USER: result.WS_LOGIN,
                  WS_PASSWORD: result.WS_PASS,
                  FEIRA: '1',
                  STORE_ID: result.STORE_ID,
                  PAYMENT: OrderAt.PAYMENT_METHOD,
                  SHIPPING: OrderAt.SHIPP_METHOD,
                  ADDRESS: resultCAddress,
                  CUSTOMER: resultCustomer,
                  PRODUCT: prodOrder
              };
              console.log( JSON.stringify(params) );
              $http.post(URLPHPCTRL + '/orders.php', params)
              .error(function (data, status, headers, config) {
                $rootScope.showInterface = true;
              })
              .then(function (res){
                if(res.data == "OK"){
                  salesOrderFactory.checkOrder(OrderAt.ID).then(function(x) {
                    $rootScope.ordersRel = resultOrder;
                    $rootScope.showInterface = true;
                    $rootScope.procAtual += 1;
                    $rootScope.countOrders -= 1;

                    $rootScope.loadAllOrders();
                  });
                }else{
                  alert(res.data+". Confira se é possivel realizar uma venda para o(s) produto(s) pelo Magento.");
                  $rootScope.showInterface = true;
                }
              }); 
            });
          }else{
            var params = {
                WS_URL: result.WS_URL, 
                WS_USER: result.WS_LOGIN,
                WS_PASSWORD: result.WS_PASS,
                FEIRA: '1',
                STORE_ID: result.STORE_ID,
                PAYMENT: OrderAt.PAYMENT_METHOD,
                SHIPPING: OrderAt.SHIPP_METHOD,
                ADDRESS_ID: OrderAt.CUSTOMER_ADDRESS_ID,
                CUSTOMER: resultCustomer,
                PRODUCT: prodOrder
            };
            console.log( JSON.stringify(params) );
            $http.post(URLPHPCTRL + '/orders.php', params)
              .error(function (data, status, headers, config) {
                $rootScope.showInterface = true;
              })
              .then(function (res){
                if(res.data == "OK"){
                  salesOrderFactory.checkOrder(OrderAt.ID).then(function(x) {
                    $rootScope.showInterface = true;
                    $rootScope.procAtual += 1;
                    $rootScope.countOrders -= 1;

                    $rootScope.loadAllOrders();
                  });
                }else{
                  alert(res.data+". Confira se é possivel realizar uma venda para o(s) produto(s) pelo Magento.");
                  $rootScope.showInterface = true;
                }
              });                 
          }
          deferred.resolve();
        });
      });
      return deferred.promise;
    };

    $scope.doCreateOrderPHP = function() {
      $rootScope.showInterface = false;
      configurationFactory.select().then(function(result) {

        salesOrderFactory.selectOnlyUnprocessed().then(function(resultOrder) {
          if(resultOrder){
            $rootScope.impProdStatus = "";
            $rootScope.showInterface = true;

            $rootScope.procTotal = 0;
            $rootScope.procAtual = 0;
            $rootScope.procAtualTot = resultOrder.length;

            $rootScope.expOrderStatus = "Exportando Vendas";

            for (var i = 0; i <= resultOrder.length-1; i++) {
              $rootScope.exportSpecificOrder( result, resultOrder[i] );
            };
          }else{
            $rootScope.showInterface = true;
            alert('Não ha vendas para serem exportadas.');
          }
        });
      });
    } 

    $scope.processOneCustomer = function(data, address) {
      $rootScope.addreeIns = address;
      customerFactory.insert(data.customer_id, data.group_id, data.firstname, data.lastname, data.email, data.taxvat, address, '');
    }

    $scope.getAllCustomersPHP = function() {
        configurationFactory.select().then(function(result) {
          var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS;
          $rootScope.showInterface = false;
          $rootScope.procAtual = 0;
          $rootScope.procTotal = 0;
          $rootScope.impCustomerStatus = "Conectando com o Servidor.";
          
          $http.get(URLPHPCTRL + '/customers.php?'+ params )
            .success(function (data, status, headers, config) {
              customerFactory.deleteAll();
              customerAddressFactory.deleteAll();

              $rootScope.impCustomerStatus = 'Importando Clientes aguarde.';
              $rootScope.procAtual = 0;
              $rootScope.procTotal = data.length;
              for (var i = 0; i <= data.length-1; i++) {
                var address = data[i].address;
                $scope.processOneCustomer(data[i], data[i].address);
              };
              $scope.getAllCustomerGroupsPHP();
            })
            .error(function (data, status, headers, config) {
              console.log('data error');
            })
            .then(function (result) {
              things = result.data;
            });
        });
    }

    $scope.getAllCustomerGroupsPHP = function() {
        configurationFactory.select().then(function(result) {
          var params = 'WS_URL='+result.WS_URL+'&WS_USER='+result.WS_LOGIN+'&WS_PASSWORD='+result.WS_PASS;
         
          $http.get(URLPHPCTRL + '/customer_group.php?'+ params )
            .success(function (data, status, headers, config) {
              customerGroupFactory.deleteAll();

              for (var i = 0; i <= data.length-1; i++) {
                var address = data[i].address;
                customerGroupFactory.insert(data[i].customer_group_id, data[i].customer_group_code).then(function(result) {
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

.controller('vendaCtrl', function($scope, $rootScope, $q, $ionicModal, $cordovaDevice, $ionicPopup, productFactory, salesOrderFactory, salesOrderItemFactory, metPagFactory) {
    /*
    $scope.currentItem = null;
    $rootScope.totCar = 0;
    $rootScope.cartItens = [];
    */

    $scope.noStock = false;
    $rootScope.imageProd1 = null;
    $rootScope.imageProd1Edt = null;
    $scope.PaymentMethod = [];
    $scope.PaymentMethod.value = null;

    $rootScope.searchBarCode = function(sku, qty) {
      $rootScope.currentItem = null;
      var deferred = $q.defer();
      productFactory.select(sku, $rootScope.customer[0].GROUP_ID).then(function(result) {
        $rootScope.currentItem = result;
        if(qty){
          $rootScope.qtyProd = qty;
        }else{
          $rootScope.qtyProd = 1;
        }

        $scope.noStock = false;

        if(result){
          $scope.getImageOfProduct(result);
        }else{
          $rootScope.imageProd1 = null;
          $rootScope.imageProd1Edt = null;
        }

        deferred.resolve(qty);
      });
      return deferred.promise;
    };

    $rootScope.addToCart = function(qtyProduct) {
      $rootScope.qtyProd = qtyProduct == "" ? 1 : qtyProduct;

      var itemEx = false;
      $rootScope.totCar = 0;
      for(i = 0; i < $rootScope.cartItens.length; i++) { 
        if($rootScope.cartItens[i].PRODUCT_ID == $rootScope.currentItem.PRODUCT_ID){
          uptQTY = Number($rootScope.cartItens[i].QTY)+Number($rootScope.qtyProd);

          //NAO ESTA CONTROLANDO STOCK
          if( $rootScope.cartItens[i].STOCK >= uptQTY ){
            $rootScope.cartItens[i].QTY = uptQTY;
          }else{
            $scope.noStock = true;
          }
          //NAO ESTA CONTROLANDO STOCK
          $rootScope.cartItens[i].QTY = uptQTY;
          itemEx = true;
        }

        $rootScope.totCar += Number($rootScope.cartItens[i].QTY)*Number($rootScope.cartItens[i].PRICE);
        console.log( $rootScope.totCar );
      }

      if(itemEx == false){
        $rootScope.currentItem.QTY = $rootScope.qtyProd;
        $rootScope.cartItens.push($rootScope.currentItem);

        $rootScope.totCar += Number($rootScope.currentItem.QTY)*Number($rootScope.currentItem.PRICE);
      };
      $rootScope.barcodeNumber = "";
      $rootScope.currentItem = null;
      $rootScope.imageProd1 = null;
      $rootScope.imageProd1Edt = null;
    };    

    $scope.removeFromCart = function(item) {
      if($rootScope.closedOrder != 'S'){
        $rootScope.ctrlArray = [];

        for(i = 0; i <= $rootScope.cartItens.length; i++) { 
          if($rootScope.cartItens[i] == item){
            $rootScope.cartItens.splice(i, 1);
            break;
          }  
        }

        $rootScope.totCar = 0;
        for(i = 0; i <= $rootScope.cartItens.length; i++) { 
          $rootScope.totCar += Number($rootScope.cartItens[i].QTY)*Number($rootScope.cartItens[i].PRICE); 
        }
      }
    }; 

    $scope.editQtyCart = function(item) {
      if($rootScope.closedOrder != 'S'){
        $scope.getImageOfProduct(item);
        $rootScope.imageProd1 = null;

        $scope.modal.show();
        $scope.edtItem = item.NAME;
        $rootScope.qtyItemEDT = item.QTY;

        $rootScope.itemForEdit = item;
      }
    }; 

    $rootScope.loadAllOrders = function (){
      ionic.Platform.ready(function(){
        salesOrderFactory.selectWithData().then(function(resultOrder) {
          $rootScope.ordersRel = resultOrder;
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

    $scope.updateOrder = function() {
      salesOrderItemFactory.deleteOrderID($rootScope.OrderIDLoaded);
      salesOrderFactory.update($rootScope.OrderIDLoaded, $rootScope.PaymentMethod.value.MTP_DESC, $rootScope.PaymentMethod.value.ID, $rootScope.totCar).then(function(result){
        for (var i = 0; i <= $rootScope.cartItens.length - 1; i++) {
          salesOrderItemFactory.insert($rootScope.OrderIDLoaded, $rootScope.cartItens[i].PRODUCT_ID, $rootScope.cartItens[i].SKU, $rootScope.cartItens[i].PRICE, $rootScope.cartItens[i].NAME, $rootScope.cartItens[i].QTY);
        };

        var alertPopup = $ionicPopup.confirm({
          title: 'Venda',
          template: 'Atualizada com sucesso, deseja imprimir?'
        });

        alertPopup.then(function(res) {
          if(res) {
            var objPrint = [];
            objPrint.ID = result;
            $rootScope.print(objPrint);
          }
        });

        $rootScope.totCar = 0;
        $rootScope.cartItens = []; 
      });
    }; 


    $scope.placeOrder = function() {
      salesOrderFactory.insert($rootScope.customer[0].ID, $rootScope.customer[0].FIRSTNAME, $rootScope.addressCustomer[0].CUSTOMER_ADDRESS_ID, 'pedroteixeira_correios_41068', $rootScope.PaymentMethod.value.MTP_DESC, $rootScope.PaymentMethod.value.ID, $rootScope.totCar, 'N').then(function(result){
        for (var i = 0; i <= $rootScope.cartItens.length - 1; i++) {
          salesOrderItemFactory.insert(result, $rootScope.cartItens[i].PRODUCT_ID, $rootScope.cartItens[i].SKU, $rootScope.cartItens[i].PRICE, $rootScope.cartItens[i].NAME, $rootScope.cartItens[i].QTY);
        };

        $rootScope.getAllOrders();
        var alertPopup = $ionicPopup.confirm({
          title: 'Venda',
          template: 'Finalizada com sucesso, deseja imprimir?'
        });

        alertPopup.then(function(res) {
          $rootScope.loadAllOrders();
          if(res) {
            var objPrint = [];
            objPrint.ID = result;
            $rootScope.print(objPrint);
          }
        });

        $rootScope.totCar = 0;
        $rootScope.cartItens = []; 
      });
    }; 

    $scope.getImageOfProduct = function(productData) {
      if( navigator.onLine ){
        $rootScope.imageProd1 = productData.IMG_1;
        $rootScope.imageProd1Edt = productData.IMG_1;
      }else{
        var id_product = productData.PRODUCT_ID
        $rootScope.imageProd1 = null;
        $rootScope.imageProd1Edt = null;
        if($cordovaDevice.getPlatform() == 'iOS'){
           fileDeviceDir = cordova.file.dataDirectory;
        }else{
           fileDeviceDir = cordova.file.externalRootDirectory;
        }

        $rootScope.imageProd1 = fileDeviceDir + "magepdv/" + id_product + "/1.jpg";
        $rootScope.imageProd1Edt = fileDeviceDir + "magepdv/" + id_product + "/1.jpg";  
      }
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
      $rootScope.totCar = 0;
      for(i = 0; i < $rootScope.cartItens.length; i++) { 
        if($rootScope.cartItens[i] == $rootScope.itemForEdit){
          $rootScope.cartItens[i].QTY = qtyItemEDT;
        }
        $rootScope.totCar += Number($rootScope.cartItens[i].QTY)*Number($rootScope.cartItens[i].PRICE);
      }

      $scope.modal.hide();
    };

    $scope.$on('modal.hidden', function() {
      $rootScope.imageProd1Edt = null;
    });

    $ionicModal.fromTemplateUrl('methods.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalMethods = modal;
    });

    $scope.setPayMethod = function(metd, type) {
      $rootScope.PaymentMethod = metd;
      $scope.modalMethods.hide();

      if(type == 'INS'){
        $scope.placeOrder();
      }else{
        $scope.updateOrder();
      }
    };

})

.controller('clienteCtrl', function($scope, $rootScope, $ionicModal, customerFactory, customerAddressFactory, customerGroupFactory) {
    if($rootScope.customerDocument == undefined){
      $rootScope.customer = [];
      $rootScope.addressCustomer = [];
      $scope.currentItem = null;
      $rootScope.customerDocument = [];
      $scope.taxIsUsed = false;

      $rootScope.insCustomer = [];
    }
    console.log( $rootScope.customerDocument );

    $rootScope.searchCustomer = function(email) {
      customerFactory.select(email).then(function(result) {
        $rootScope.customerDocument.value = email;
        $rootScope.customer = [];
        $rootScope.addressCustomer = [];
        $scope.currentItem = result;

        if( result != null ){
          $rootScope.cartItens = [];
          $rootScope.customer.push($scope.currentItem);
          customerAddressFactory.select(result['ID']).then(function(result) {
            $rootScope.addressCustomer = [];
            $rootScope.addressCustomer.push(result);
          });
        }

      });
    };

    $scope.translatorEstado = function(stado) {
      switch(stado) {
        case "AC": retorno = "Acre"; break;
        case "AL": retorno = "Alagoas"; break;
        case "AP": retorno = "Amapá"; break;
        case "AM": retorno = "Amazonas"; break;
        case "BA": retorno = "Bahia"; break;
        case "CE": retorno = "Ceará"; break;
        case "DF": retorno = "Distrito Federal"; break;
        case "ES": retorno = "Espírito Santo"; break;
        case "GO": retorno = "Goiás"; break;
        case "MA": retorno = "Maranhão"; break;
        case "MT": retorno = "Mato Grosso"; break;
        case "MS": retorno = "Mato Grosso do Sul"; break;
        case "MG": retorno = "Minas Gerais"; break;
        case "PA": retorno = "Pará"; break;
        case "PB": retorno = "Paraíba"; break;
        case "PR": retorno = "Paraná"; break;
        case "PE": retorno = "Pernambuco"; break;
        case "PI": retorno = "Piauí"; break;
        case "RJ": retorno = "Rio de Janeiro"; break;
        case "RN": retorno = "Rio Grande do Norte"; break;
        case "RS": retorno = "Rio Grande do Sul"; break;
        case "RO": retorno = "Rondônia"; break;
        case "RR": retorno = "Roraima"; break;
        case "SC": retorno = "Santa Catarina"; break;
        case "SP": retorno = "São Paulo"; break;
        case "SE": retorno = "Sergipe"; break;
        case "TO": retorno = "Tocantins"; break;
        default:  retorno = "";
      }

      return retorno;
    }

    $scope.getCEP = function(CEP) {
//      var networkState = navigator.connection.type;

      if( navigator.onLine && CEP != "" ){
          $.getScript("http://cep.republicavirtual.com.br/web_cep.php?formato=javascript&cep="+CEP, function(){
              //if(resultadoCEP["cidade"]){
                  $rootScope.insCustomer.street = unescape(resultadoCEP["tipo_logradouro"])+": "+unescape(resultadoCEP["logradouro"]);
                  $rootScope.insCustomer.neighborhood = unescape(resultadoCEP["bairro"]);
                  $rootScope.insCustomer.city = unescape(resultadoCEP["cidade"]);
                  $rootScope.insCustomer.region =  $scope.translatorEstado( unescape(resultadoCEP["uf"]) );
              //}
          }); 
      }
    };

    $ionicModal.fromTemplateUrl('cadastro.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalCadastro = modal;
    });

    $scope.showInsertCustomerMenu = function() {
      $rootScope.groupscustomer = [{MTP_ID:'10', MTP_DESC:'Tabela Padrão'}, {MTP_ID:'11', MTP_DESC:'Tabela Loja Virtual'}];
      $rootScope.tipoPess = [{id:'pf', desc:'Pessoa Fisica'}, {id:'pj', desc:'Pessoa Juridica'}];
      $rootScope.ctrlArray = [];

      $rootScope.ctrlArray[10] = 'Tabela Padrão';
      $rootScope.ctrlArray[11] = 'Tabela Loja Virtual';

      $scope.modalCadastro.show();

      //customerGroupFactory.select().then(function(result){
      //  $rootScope.groupscustomer = result;
      //  $rootScope.tipoPess = [{id:'pf', desc:'Pessoa Fisica'}, {id:'pj', desc:'Pessoa Juridica'}];

      //  $rootScope.ctrlArray = [];
      //  for (var i = 0; i <= result.length-1; i++) {
      //    $rootScope.ctrlArray[ result[i].MTP_ID ] = result[i].MTP_DESC;
      //  };

      //  $scope.modalCadastro.show();
      //});
      
    }

    $scope.checkCustomer = function(document) {
      customerFactory.selectByTax(document).then(function(result){
        if(result){
          $scope.taxIsUsed = true;
        }else{
          $scope.taxIsUsed = false;
        }
      });
    }

    $scope.checkCustomerEmail = function(email) {
      customerFactory.selectByEmail(email).then(function(result){
        if(result){
          $scope.emailIsUsed = true;
        }else{
          $scope.emailIsUsed = false;
        }
      });
    }

    $scope.validadeCPF = function(cpf) {
      console.log(cpf);
      if( cpf == "" || cpf == undefined ) return false;
      cpf = cpf.replace(/[^\d]+/g,'');    
      // Elimina CPFs invalidos conhecidos    
      if (cpf.length != 11 || 
          cpf == "00000000000" || 
          cpf == "11111111111" || 
          cpf == "22222222222" || 
          cpf == "33333333333" || 
          cpf == "44444444444" || 
          cpf == "55555555555" || 
          cpf == "66666666666" || 
          cpf == "77777777777" || 
          cpf == "88888888888" || 
          cpf == "99999999999"){
              $scope.taxIsUsed = true;
              return false;
          } 
      // Valida 1o digito 
      add = 0;    
      for (i=0; i < 9; i ++)       
          add += parseInt(cpf.charAt(i)) * (10 - i);  
          rev = 11 - (add % 11);  
          if (rev == 10 || rev == 11)     
              rev = 0;    
          if (rev != parseInt(cpf.charAt(9))){ 
            $scope.taxIsUsed = true;
            return false;
          }
      // Valida 2o digito 
      add = 0;    
      for (i = 0; i < 10; i ++)        
          add += parseInt(cpf.charAt(i)) * (11 - i);  
      rev = 11 - (add % 11);  
      if (rev == 10 || rev == 11) 
          rev = 0;    
      if (rev != parseInt(cpf.charAt(10))){
          $scope.taxIsUsed = true;
          return false;
      }
      return true;
    }

    $scope.validadeCNPJ = function(cnpj) {
      if( cnpj == "" ) return false;

      cnpj = cnpj.replace(/[^\d]+/g,'');
      if (cnpj.length != 14){
          $scope.taxIsUsed = true;
          return false;
      }
   
      // Elimina CNPJs invalidos conhecidos
      if (cnpj == "00000000000000" || 
          cnpj == "11111111111111" || 
          cnpj == "22222222222222" || 
          cnpj == "33333333333333" || 
          cnpj == "44444444444444" || 
          cnpj == "55555555555555" || 
          cnpj == "66666666666666" || 
          cnpj == "77777777777777" || 
          cnpj == "88888888888888" || 
          cnpj == "99999999999999"){
          $scope.taxIsUsed = true;
          return false;
      }
           
      // Valida DVs
      tamanho = cnpj.length - 2
      numeros = cnpj.substring(0,tamanho);
      digitos = cnpj.substring(tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
              pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(0)){
        $scope.taxIsUsed = true;
        return false;
      }
           
      tamanho = tamanho + 1;
      numeros = cnpj.substring(0,tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
              pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(1)){
        $scope.taxIsUsed = true;
        return false;
      }
             
      return true;
    }

    $scope.validadeEmail = function(email) {
      var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (!filter.test(email)) {
        $scope.emailIsUsed = true;
      }else{
        $scope.emailIsUsed = false;
      }
    }

    $scope.insertCustomer = function(insCustomer) { 
      if( Object.keys(insCustomer).length < 13 ){
        alert('Preencha todos os campos.');
      }else{
        if( insCustomer.CustomerTipPess.value.id == 'pf' ){
          insCustomer.taxvat = insCustomer.cpf;
        }else{
          insCustomer.taxvat = insCustomer.cnpj;
        }

        customerFactory.insertSingle('-1', insCustomer.CustomerGroup.value.MTP_ID, insCustomer.firstname, insCustomer.lastname, insCustomer.email, insCustomer.taxvat, '-1', insCustomer.CustomerTipPess.value.id).then(function(result) {
          customerAddressFactory.insertComp(result, insCustomer.street, insCustomer.region, insCustomer.number, insCustomer.comment, insCustomer.neighborhood, insCustomer.city, insCustomer.cep, insCustomer.tel).then(function(result) {
            alert('Cliente inserido com sucesso.');
            $scope.insCustomer = [];
            $rootScope.insCustomer = [];
            insCustomer = [];
          });
        });

        $rootScope.customerDocument.value = insCustomer.taxvat;
        $rootScope.searchCustomer($rootScope.customerDocument.value);
        $scope.modalCadastro.hide();
      }
    }

    $scope.cancelInsertCustomer = function() {
      $scope.insCustomer = [];
      $rootScope.insCustomer = [];
      insCustomer = [];
      $scope.modalCadastro.hide();
    }
console.log( $rootScope.customerDocument );

})

.controller('printCtrl', function($scope, $rootScope, $ionicModal, $cordovaPrinter, $state, salesOrderFactory, customerFactory, customerAddressFactory, salesOrderItemFactory ) {
    $rootScope.cancelLoad = function() {
        $rootScope.loadMode = false;
        $rootScope.OrderIDLoaded = null;
        $rootScope.closedOrder = null;

        $rootScope.totCar = 0;
        $rootScope.cartItens = [];       
    }

    $rootScope.openOrder = function(orderToOpen) {
        $rootScope.totCar = 0;
        $rootScope.cartItens = [];
        $rootScope.loadMode = true;
        $rootScope.OrderIDLoaded = orderToOpen.ID;
        $rootScope.closedOrder = orderToOpen.SYNC;
        salesOrderFactory.select(orderToOpen.ID).then(function(resultOrder) {
          for (var i = 0; i <= resultOrder.length-1; i++) {
            var OrderAt = resultOrder[i];
            customerFactory.selectById(resultOrder[i].CUSTOMER_ID).then(function(resultCustomer) {
              salesOrderItemFactory.select(OrderAt.ID).then(function(resultOrderItem) {
                if(resultOrderItem){
                  //load cliente
                  $state.go('tabsController.cliente');
                  $rootScope.customerDocument.value = resultCustomer.EMAIL;

                  customerFactory.select(resultCustomer.EMAIL).then(function(result) {
                    $rootScope.customer = [];
                    $rootScope.addressCustomer = [];
                    $rootScope.currentItem = result;
                    $rootScope.customerDocument.value = resultCustomer.EMAIL;

                    if( result != null ){
                      $rootScope.customer.push($rootScope.currentItem);
                      customerAddressFactory.select(result['ID']).then(function(result) {;
                        $rootScope.addressCustomer = [];
                        $rootScope.addressCustomer.push(result);

                        for (var x = 0; x <= resultOrderItem.length-1; x++) {
                          $rootScope.barcodeNumber = resultOrderItem[x].SKU;
                          $rootScope.searchBarCode( $rootScope.barcodeNumber, resultOrderItem[x].QTY ).then(    
                            function(sreturn){
                              $rootScope.addToCart(sreturn);
                              $state.go('tabsController.venda');
                            }
                          );
                        }
                      });
                    }
                  });
                }else{
                  $rootScope.loadMode = false;
                  $rootScope.OrderIDLoaded = "";
                  $rootScope.closedOrder = "";
                }

              });
            });
          };
        });      
    }

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
                        cordova.plugins.printer.print(page, 'Document.html', { name: 'order' }, function () {

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

    $ionicModal.fromTemplateUrl('detailOrder.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalOrderDetail = modal;
    });

    $scope.closeModalOrderDetail = function() {
      $scope.modalOrderDetail.hide();
    };

    $scope.showDetailOrder = function(x) {
      $scope.totOrderDetail = x.TOT_VLR;
      $scope.metPag = x.PAYMENT_METHOD;

      salesOrderFactory.selectItemsOrder(x.ID).then(function(items) {
          $scope.modalOrderDetail.show();
          $scope.orderItensDetail = items;
      });

    };
})

.controller("barcodeCtrl", function($scope, $rootScope, $cordovaBarcodeScanner) {
    $rootScope.showBarCodeRTC = false;
    $rootScope.barcodeNumber = "";
    $scope.scanBarcode = function() {
        if( $rootScope.conn.BARCODE == "Barcode Advanced" ){
          $rootScope.showBarCodeRTC = true;
          
          ionic.Platform.ready(function(){
            Quagga.init({
                inputStream : {
                  name : "Live",
                  type : "LiveStream",
                  constraints: {
                    width: 240,
                    height: 280,
                    facingMode: "environment"
                  },
                  locator: {
                    patchSize: "medium",
                    halfSample: true
                  },
                  numOfWorkers: 8,
                  locate: true,
                  frequency: 10,
                  debug: true,
                  target: document.querySelector('#barcodeDiv')    // Or '#yourElement' (optional)
                },
                decoder : {
                  readers :  [{
                    format: "ean_reader",
                    config: {
                                supplements: [
                                    'ean_5_reader', 'ean_2_reader'
                                ]
                            }
                  }],
                  debug: {
                      drawBoundingBox: true,
                      showFrequency: true,
                      drawScanline: true,
                      showPattern: true
                  }
                }
              }, function(err) {
                  if (err) {
                      console.log(err);
                      return
                  }
                  console.log("Initialization finished. Ready to start");
                  Quagga.start();
            });

            Quagga.onProcessed(function(result) {
              console.log(result);
                var drawingCtx = Quagga.canvas.ctx.overlay,
                    drawingCanvas = Quagga.canvas.dom.overlay;

                if (result) {
                    if (result.boxes) {
                        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                        result.boxes.filter(function (box) {
                            return box !== result.box;
                        }).forEach(function (box) {
                            Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                        });
                    }

                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
                    }

                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                    }
                }
            });

            Quagga.onDetected(function(result) {
              console.log(result);
            });

          });
        }else{
          $cordovaBarcodeScanner.scan().then(function(imageData) {
              $rootScope.barcodeNumber = imageData.text;
          }, function(error) {
          });
          
        }

    };

})
