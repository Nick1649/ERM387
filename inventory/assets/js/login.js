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
            	if(result.body && result.body.error || result.body.isAdmin === false)
            	{
            	   $('#alertplaceholder').html(
                    '<div class="alert alert-danger fade in"><strong>Login Failed</strong> Email/Password combination incorrect</div>'
                    );
            		console.log(result)
            	}
				else if (result.status) {
					document.cookie = xhr.getResponseHeader('Set-Cookie');
					localStorage['userId'] = result.body.userId;
					localStorage['isAdmin'] = result.body.isAdmin;
					window.location.href = "/Resources.html";
				}
            },
            error: function(xhr, resp, text) {
                console.log(xhr, resp, text);

                $('#alertplaceholder').html(
                    '<div class="alert alert-warning"><strong>Warning!</strong>Server error ' + text + '</div>'
                );
            }
        })
    });
});