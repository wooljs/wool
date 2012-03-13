/*
wool.js
 
JQuery plugin to enable WOOL knitting ;)

*/
/** Avoid bug when console unavailable in the browser */
if (typeof console == 'undefined'){console={log:function(){},error:function(x){alert(x)}}}

function wool_inject($,window) {
    var validators = {
        email: function(c) {
			var e = $(this), check = function () { return e.val().match(/^[^@ ]+@[^@ ]+\.[^@ ]+$/) };
			var f = function () { e.css('color', check() ? 'green' : 'red') };
            e.keyup(f).change(f);
			if (c) c(check, this);
		}
		,
		field_equals: function(o,c) {
            var elt = $(this), is_equal_elt = $(o), check = function () { return elt.val() == is_equal_elt.val() }
            var f = function () { is_equal_elt.css('color', check() ?  'green' : 'red') };
            is_equal_elt.keyup(f).change(f);
			if (c) c(check, [elt, is_equal_elt]);
		}
        ,
		not_empty: function(c) {
        	$(this).each(function() {
                var e = $(this), check = function () { return e.val().length > 0 }
				var f = function () { e.css('border-color', check() ?  '' : 'red') }; e.keyup(f).change(f);
				if (c) c(check, this);
			})
		}
    }
    
    var err_msg = {
        email: "Email must respect format <*@*.*>.", 
        field_equals: "Password and Confirmation must match.",
        not_empty: function () { return $(this).attr('title')+" cannot be empty"}
    }
    
	var methods = {
		i18n: function(keys) {
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
		,
		prepare: function() {
			$('input[type="text"],input[type="password"]',this).each(function() {
				var span = $('<span/>').text(this.alt).appendTo($(this).parent());
				$(this).focusin(function () { $(span).fadeOut('fast'); });
				$(this).focusout(function () { if ($(this).val()=='') {$(span).fadeIn('fast');} }).focusout();
			});
		}
		,
		data: function() {
			var data = {};
			$('input[type="text"],input[type="password"]',this).each(function() {
				data[$(this).attr('name')] = $(this).val();
			});
			return data
		}
		,
		email: validators.email
		,
		field_equals: validators.field_equals
        ,
		not_empty: validators.not_empty
		,
		valid: function(checks, cb, error) {
            console.log('checks:',checks);
			var ok = true, err = [], error = error|| methods.error;
			checks.forEach(function (c) {if (!c.valid()) { ok=false;err.push(c.err) } });
			if (ok) { cb() }
			else { error(err) }
		}
		,
		error: function(err) {
			alert("- "+err.join("\n- "));
		}
        ,
        form: function(valid) {
            // default options
            valid = $.extend({
                prepare:true,
                submit:this,
                action:undefined
            },valid||{});
        
            if (!!valid['prepare']) methods.prepare.apply(this);
            delete valid['prepare'];
            
            var submitable = valid['submit'];
            delete valid['submit'];
            
            var action = valid['action'];
            delete valid['action'];
            
            var checks=[];
            for (u in valid) {
                if (typeof validators[u]!=='undefined') {
                    var here = valid[u];

                    var add_check = function (v,elt) {
                        var e;
                        if (typeof err_msg[u]==='function') {
                            e = err_msg[u].apply(elt);
                        } else {
                            e = err_msg[u];
                        }
                        checks.push({valid: v, err: e});
                    }
                    
                    switch (typeof here) {
                        case 'string':
                            validators[u].apply($(here,this),[add_check]);
                            break;
                        case 'object':
                            if (here instanceof Array) {
                                var x = here[0];
                                var arg = [];
                                var i = 1;
                                for (var l=here.length ; i<l ; i++) {
                                    arg.push(here[i]);
                                }
                                arg.push(add_check);
                                validators[u].apply($(x,this),arg);
                            }
                            break;
                    }
                }
            }
            if (typeof action==='function'){
                var cb = (function (that, checks) {
                    return function () {
                        var data = methods.data.apply(that);
                        methods.valid.apply(that, [ checks, function() { action(data) } ]	);
                    }
                })(this,checks);
                if (submitable === this) $(this).submit(cb);
                else $(submitable,this).click(cb);
            }
        }
		,
		ajax: {
			post: function (u,d,s,e) {
				$.ajax({
					url: u,
					type: 'POST',
					contentType: 'application/json',
					dataType: 'json',
					data: JSON.stringify(d),
					success: s,
					error: e
				});
			}
		}
	}
	
	function treat_object (init) {
		var $this = $(this), views = {}, mapping = [];
		if (init instanceof Array) { init = {i18n:{},map:init}}
		var l10n = methods.i18n(init.i18n);
		var default_view;
		init.map.forEach(function (v,i) {
			if (typeof v === 'string' && typeof default_view === 'undefined') {
				default_view = {id:i, valid: function() {return true;}, file: v};
			}
			else if (typeof v !== 'object') { throw JSON.format(v)+" has no valid attribute."; }
			else {
				if (typeof v.file === 'undefined') throw JSON.format(v)+" has no file attribute.";
				if (typeof v.valid !== 'function') throw JSON.format(v)+" has no valid function.";
				v.id=i; mapping.push(v);
			}
		},this);
		mapping.push(default_view);
		
		var launch = function(container, before, after, form) {
			container.fadeOut('fast', function () {
				container.empty();
				if (before) before(container);
				container.append(views[name]);
				if (after) after(container);
				if (form) methods.form.apply(container,[form]);
				container.fadeIn('slow');
			});
		}
		function onHashChange() {
			var h = window.location.hash;
			$.each(mapping,function (i,m) {
				var onReady = function () {launch($this, m.before, m.after, m.form)}
				if (m.valid(h)) {
					if (typeof views[m.id] != 'undefined') {
						onReady();
					} else {
						$.ajax({ url: m.file, dataType: 'html',
							success: function (data) { views[name]=l10n(data); onReady(); },
							error: function (xhr, status, err) { console.error(path,status,err); }
						});
					}
					return false;
				}
			}); 
		}
		$(window).bind('hashchange', onHashChange);
		onHashChange();
	}
	
	$.fn.wool = function(init) {
		switch (typeof init) {
			case 'string':
				var m = methods[init];
				if (typeof m == 'function') {
                    console.log("wool method '"+init+"' found")
					var args = Array.prototype.slice.call(arguments);
					args.shift();
					m.apply(this, args);
				}
				break;
			case 'function':
				//TODO
				break;
			case 'object':
                var args = Array.prototype.slice.call(arguments);
				treat_object.apply(this, args);
				break;
		}
		return this;
	}
    $.wool={ajax: methods.ajax};
}
