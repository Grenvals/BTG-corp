//Adaptive functions
$(window).resize(function(event) {
	adaptive_function();
});
function adaptive_header(w,h) {
		var headerMenu=$('.header-menu');
		var headerContacts=$('.header-contacts');
	if(w<767){
		if(!headerContacts.hasClass('done')){
			headerContacts.addClass('done').appendTo(headerMenu);
		}
	}else{
		if(headerContacts.hasClass('done')){
			headerContacts.removeClass('done').appendTo(headerMenu);
		}
	}
}
function adaptive_function() {
		var w=$(window).outerWidth();
		var h=$(window).outerHeight();
	adaptive_header(w,h);
}
	adaptive_function();