// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var wartaku = angular.module ("wartaku", ["ionic"]);

wartaku.server = "http://warta.app.localhost";

wartaku.service ("FeedService", function ($q, $http)
{
	return {
		get_categories: function ()
		{
			var me = this;
			var dfd = $q.defer ();
			var url_base = wartaku.server +"/feed/categories/?callback=JSON_CALLBACK";

			$http.jsonp (url_base)
				.success (function(data, status, headers, config) {
					this.categories = data;
					dfd.resolve (data);
				})
				.error (function(data, status, headers, config) {
					dfd.resolve (data);
				});	

			return dfd.promise;
		}

	,	get_category_feeds: function (category_id)
		{
			var me = this;
			var dfd = $q.defer ();
			var url_base = wartaku.server +"/feed/category/";

			url_base += "?callback=JSON_CALLBACK";
			url_base += "&id="+ category_id;

			$http.jsonp (url_base)
				.success (function(data, status, headers, config) {
					me.category_feeds = data;
					dfd.resolve (data);
				})
				.error (function(data, status, headers, config) {
					dfd.resolve (data);
				});	

			return dfd.promise;
		}

	,	get_feed_item: function (feed_id)
		{
			var dfd = $q.defer();

			this.category_feeds.data.forEach (function(feed)
			{
		        if (feed.id == feed_id) {
					dfd.resolve (feed);
				}
			});

			return dfd.promise;
		}
	}
});

wartaku.config (function ($stateProvider, $urlRouterProvider)
{
	$urlRouterProvider.otherwise ("/feed/categories/");

	$stateProvider.state (
		"categories"
	,	{
			url			: "/feed/categories/"
		,	cache		: false
		,	templateUrl	: "feed/categories.html"
		,	controller	: "FeedCategoriesCtrl"
		,	resolve		:
			{
				categories	: function (FeedService)
				{
					return FeedService.get_categories ();
				}
			}
		}
	)
	.state (
		"category"
	,	{
			url			: "/feed/category/?id"
		,	cache		: false
		,	templateUrl	: "feed/category.html"
		,	controller	: "FeedCategoryCtrl"
		,	resolve		:
			{
				category_feeds : function ($stateParams, FeedService)
				{
					return FeedService.get_category_feeds ($stateParams.id);
				}
			}
		}
	)
	.state (
		"feed"
	,	{
			url			: "/feed/:id"
		,	cache		: false
		,	templateUrl	: "feed/item.html"
		,	controller	: "FeedItemCtrl"
		,	resolve		:
			{
				feed_item	: function ($stateParams, FeedService)
				{
					return FeedService.get_feed_item ($stateParams.id);
				}
			}
		}
	)
});

wartaku.controller (
	"FeedCategoriesCtrl"
,	function ($scope, categories)
	{
		// set host for category's image.
		categories.data.forEach (function(c)
		{
			c.image = wartaku.server + c.image;
		});

		$scope.categories = categories;
	}
)
.controller (
	"FeedCategoryCtrl"
,	function ($scope, category_feeds)
	{
		function chunk(arr, size) {
			var newArr = [];
			for (var i=0; i<arr.length; i+=size) {
				newArr.push(arr.slice(i, i+size));
			}
			return newArr;
		}

		$scope.category_feeds = category_feeds;

		$scope.items = chunk (category_feeds.data, 3);
	}
)
.controller (
	"FeedItemCtrl"
,	function ($scope, feed_item)
	{
		$scope.feed_item = feed_item;
	}
);
