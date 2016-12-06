$(document).ready(function(){
    $("#submit").on('click', function(){
		var name = $("#email").val();
		var pass = $("#password").val();
		var data = { "user_id": name, "user_password": pass };
		data = JSON.stringify(data);
        $.ajax({
            url: '/login',
			headers: {
				'Content-Type':'application/json'
			},
			dataType: "json",
            type : "POST",
            data : data, 
            success : function(result, status, xhr) {
				if (result.status) {
					document.cookie = xhr.getResponseHeader('Set-Cookie');
					window.location.href = "/Resources.html";
				}
            },
            error: function(xhr, resp, text) {
                console.log(xhr, resp, text);
            }
        })
    });
});