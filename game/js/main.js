/*
main.js
 
Provide the main containers the following js can inject in

*/
//var head = $('head');

function inject($) {
	var views = {};
	
	return {
		/**
		 *  Initialize the body with loader and content and call an onLoad function
		 *  ( (<loader tag>, (mainView) -> .) ) -> .
		 */
		init: function (onLoad) {
			var container = $('#container');
			var loader = $('<div id="loader"/>');
			container.append(loader);
			var content = $('<div id="content"/>');
			container.append(content);
			content.hide();
			
			onLoad(loader, content, function () {
				loader.fadeOut('fast',function() {
					content.fadeIn('fast');
				});
			});
		}
		,
		/** 
		 * Display a progress bar and return a function that display text on call. After size calls run a finish function.
		 * (<loader tag>, size, () ->. ) -> (text) -> .
		 */
		progress: function (loader, size, finish) {
			var progressbar = $('<span id="progressbar"/>');
			loader.append(progressbar);
			progressbar.progressbar({value: 0});
			
			var count=0;
			return function(text) {
				count++;	
				progressbar.text(text);
				progressbar.progressbar({value: (count)*(100/size)});
				if (count == size) {
					finish();
				}
			}
		}
		,
		/**
		 * Map hashchange event with an array of rule/action. First rule matching get her action to be run
		 * (window, [ { valid:(hash)->boolean, run:(hash)->. }]) -> .
		 */
		history_mapper: function(window, context, mapping) {
			function onHashChange(){
				var h = window.location.hash;
				console.log('change to '+h);
				$.each(mapping, function (i,m) { if (m.valid(h)) { m.run(context);return false;} }); 
			}
			$(window).bind('hashchange', onHashChange);
			return onHashChange;
		}
		,
		/**
		 * Load view data from path and return a function that can append data to a container
		 * (name, path, init) -> (content) -> .
		 */
		view: function (name, path, filter, onData, onLoad) {
			filter = filter||function(v){return v;};
			var onReady = function(container) {
				container.fadeOut('fast', function () {
					container.empty();
					container.append(filter(views[name]));
					container.fadeIn('slow');
					if (onLoad) onLoad(container);
				});
			}
			$.ajax({
				url: path,
				dataType: 'html',
				success: function (data) {
					views[name]=data;
					if (onData) onData(onReady, data);
				},
				error: function (xhr, status, err) {
					console.error(path,status,err);
				}
			});
			return onReady;
		}
		,
		i18n_full: function (keys) {
			var rx = /\$\{i18n\.(.*?)(\((.*?)\))?\}/gm;
			return function (data) {
				return data.replace(rx, function(_0,_1,_2,_3) {
					var x = keys[_1];
					if (typeof x != 'undefined') { return x; }
					if (_2.length>0) { keys[_1]=_3;return _3;}
					return _0;
				});
			}
		}
	}
}
