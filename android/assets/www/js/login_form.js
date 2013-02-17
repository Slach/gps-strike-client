$('#login_form').bind('submit',function() {
	var item_names=['login','password','server'];
	for(i in item_names) {
		var name=item_names[i];
		var i=$('#'+name);
		if (i.val()=='') {
			i.focus();
			return false;
		}
	}
	for(i in item_names) {
		window.localStorage.setItem(item_names[i],$('#'+item_names[i]).val());
	}
	return true;
});
