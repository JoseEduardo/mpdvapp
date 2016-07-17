angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.magentoPDV', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/magentoPDV.html',
        controller: 'magentoPDVCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('login', {
    url: '/page5',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('tabsController.venda', {
    url: '/page6',
    views: {
      'tab4': {
        templateUrl: 'templates/venda.html',
        controller: 'vendaCtrl'
      }
    }
  })

  .state('tabsController.cliente', {
    url: '/page7',
    views: {
      'tab2': {
        templateUrl: 'templates/cliente.html',
        controller: 'clienteCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1/page2')

  

});