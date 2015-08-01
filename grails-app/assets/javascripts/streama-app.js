'use strict';

var streamaApp = angular.module('streamaApp', [
	'ui.router', 'ui.bootstrap', 'ngFileUpload', 'ui.slider'
]);



streamaApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {

	$stateProvider
		.state('dash', {
			url: '/',
			templateUrl: 'dash.htm',
			controller: 'dashCtrl',
      resolve: {
        currentUser: ['apiService', '$rootScope', function (apiService, $rootScope) {
          return apiService.currentUser().success(function (data) {
            if (data) {
              $rootScope.currentUser = data;
              return data;
            }else{
              console.log("error");
            }
          });
        }]
      }
		})
		.state('player', {
			url: '/player/:videoId?currentTime?sessionId',
			templateUrl: 'player.htm',
			controller: 'playerCtrl'
		})
		.state('admin', {
			url: '/admin',
			templateUrl: 'admin.htm',
			controller: 'adminCtrl',
      resolve: {
        currentUser: ['apiService', '$rootScope', '$state', function (apiService, $rootScope, $state) {
          return apiService.currentUser().success(function (data) {
            if (data && data.authorities.length) {
              $rootScope.currentUser = data;
              return data;
            } else {
              $state.go('dash');
            }
          });
        }]
      }
		})
		.state('admin.movies', {
			url: '/movies',
			templateUrl: 'admin-movies.htm',
			controller: 'adminMoviesCtrl'
		})
		.state('admin.movie', {
			url: '/movie/:movieId',
			templateUrl: 'admin-movie.htm',
			controller: 'adminMovieCtrl'
		})
		.state('admin.users', {
			url: '/users',
			templateUrl: 'admin-users.htm',
			controller: 'adminUsersCtrl',
      resolve: {
        currentUser: ['apiService', '$rootScope', '$state', function (apiService, $rootScope, $state) {
          return apiService.currentUser().success(function (data) {
            if (data && data.isAdmin) {
              $rootScope.currentUser = data;
              return data;
            } else {
              $state.go('dash');
            }
          });
        }]
      }
		})
		.state('admin.settings', {
			url: '/settings',
			templateUrl: 'admin-settings.htm',
			controller: 'adminSettingsCtrl',
      resolve: {
        currentUser: ['apiService', '$rootScope', '$state', function (apiService, $rootScope, $state) {
          return apiService.currentUser().success(function (data) {
            if (data.isAdmin) {
              $rootScope.currentUser = data;
              return data;
            } else {
              $state.go('dash');
            }
          });
        }]
      }
		})
		.state('admin.shows', {
			url: '/shows',
			templateUrl: 'admin-shows.htm',
			controller: 'adminShowsCtrl'
		})
		.state('admin.show', {
			url: '/show/:showId',
			templateUrl: 'admin-show.htm',
			controller: 'adminShowCtrl'
		});


	$urlRouterProvider.otherwise('/');


	$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
	$httpProvider.interceptors.push('httpInterceptor');

}])

	.factory('httpInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
		return {
			request: function (config) {
				config.params = config.params || {};
				config.params.browserSocketUUID = $rootScope.browserSocketUUID;
				return config || $q.when(config);
			},
			response: function (response) {
				return response || $q.when(response);
			},
			responseError: function (response) {

        if(response.status == 403){
          alertify.error('You do not have the rights to carry out this action.');
        }
        else if(response.status != 404 && response.status != 401){
          alertify.error('A system error occurred');
        }


				return $q.reject(response);
			}
		};
	}]);


streamaApp.run(['$rootScope', '$state', 'apiService', function ($rootScope, $state, apiService) {
	$rootScope.isCurrentState = function (stateName) {
		return ($state.current.name == stateName);
	};

  apiService.currentUser().success(function (data) {
    $rootScope.currentUser = data;
  });
}]);
