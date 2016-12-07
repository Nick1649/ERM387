function getTypes() {
    return [
        {
            id: "Computer",
            text: "Computer"
        },
        {
            id: "Room",
            text: "Room"
        },

        {
            id: "Projector",
            text: "Projector"
        },
        {
            id: "WhiteBoard",
            text: "WhiteBoard"
        }
    ];
}

function initTable(getRes) {
	var table = $("#table").DataTable({
		data: getRes,
		columns: [
			{ 
				title: "ID", 
				data: "resource_id" 
			},
			{ 
				title: "Name", 
				data: "type",
				render: function (data, type, row) {
				return data + " " + row.resource_id;
			}
			},
			{ 
				title: "Type", 
				data: "type" 
			},
			{ 
				title: "Status", 
				data: "reservations",
				render: function (data, type, row) {
					if(data.length > 0) {
						return "Available";
					} else {
						return "Unavailable";
					}
				},
				createdCell: function(td, cellData, rowData, row, col) {
					if(cellData.length > 0){
						$(td).css('background-color', "#dff0d8");
					}
					else {
						$(td).css('background-color', "#f2dede");
					}
				}
			},
			{ 
				title: "Actions", 
				data: "resource_id",
				render: function(data, type, full, meta){
                    return "<div class='col-sm-12 btn-group'>" 
                        + "<button type='button' class='view col-sm-4 btn btn-primary' data-toggle='modal' data-target='#viewModal'>View</button>"
                        + "<button type='button' class='edit col-sm-4 btn btn-warning' data-toggle='modal' data-target='#editModal'>Edit</button>"
                        + "<button type='button' class='delete col-sm-4 btn btn-danger'>Delete</button>"
                        + "</div>";
				} 
			},
			{ 
				title: "Quick Edit", 
				data: "resource_id",
				render: function(data){
                    return "<div class='checkbox'><label><input class='quickEditCB' type='checkbox' value='"+ data +"'>Quick Edit</label></div>";
				}  
			}]});
	var createType = $("#createType").select2({ 
        data: getTypes(),
        width: "100%"    
    });

    var editType = $("#editType").select2({ 
        data: getTypes(),
        width: "100%"
    });
	
	var viewType = $("#viewType").select2({ 
        data: getTypes(),
        width: "100%"
    });

     $("#items-multiple").select2({ 
        width: "100%",  
        allowClear: true
    });

    $(".table").css("border-color", "black");

    $("#table").on("click", ".delete",(function() {
        var row = table.row($(this).parents('tr'));
		var id = row.data().resource_id;
		var type = row.data().type;
		if (type === "Room") {
			var roomType = row.data().room_type;
				$.ajax({
						url: '/rooms/' + roomType + '/' + id, 
						type : "DELETE",
						success : function(result) {
						if (result.status) {
							location.reload();
						}
						console.log(result);
					},
					error: function(xhr, resp, text) {
						console.log(xhr, resp, text);
						// TODO: flash prompt for pass again
					}
				})
		} else {
				$.ajax({
						url: '/inventory/' + type + '/' + id, 
						type : "DELETE",
						success : function(result) {
						if (result.status) {
							location.reload();
						}
						console.log(result);
					},
					error: function(xhr, resp, text) {
						console.log(xhr, resp, text);
						// TODO: flash prompt for pass again
					}
				})
		}
    }));

    $("#quickEditStatus").click(function() {
        // var quickEditRow = $(".quickEditCB");
        // console.log(quickEditRow);
    });

    $("#table").on("click", ".view",(function() {
        var row = table.row($(this).parents('tr')).data();
		
        $("#viewID").val(row.resource_id);
        viewType.val(row.type).trigger("change");

        if(row.type == "Room") {
			$.ajax({
					url: '/rooms/' + row.room_type + '/' + row.resource_id, 
					type : "GET", 
					success : function(result) {
					$("#viewAvailability").val("false").trigger("change");
					if (result.status) {
						$("#viewRoomType").val(result.body.room_type).trigger("change");
						$("#viewRoomNumber").val(result.body.room_number);
						$("#viewCapacity").val(result.body.capacity);
						$("#viewHeight").val(result.body.height);
						$("#viewWidth").val(result.body.width);
						$("#viewLength").val(result.body.length);
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
			$("#viewRoomTypeGroup").show();
			$("#viewRoomNumberGroup").show();
			$("#viewCapacityGroup").show();
			$("#viewHeightGroup").show();
			$("#viewWidthGroup").show();
			$("#viewLengthGroup").show();
        } else {
			$.ajax({
				url: '/inventory/' + row.type + '/' + row.resource_id, 
				type : "GET",
				success : function(result) {
					if (result.status) {
						$("#viewAvailability").val(result.body.resource.it_resource.toString()).trigger("change");
						if (result.body.resource.type === "WhiteBoard") {
							$("#viewPrintableType").val(result.body.resource.is_printable.toString()).trigger("change");
						}
						if (result.body.resource.type === "Computer") {
							$("#viewRam").val(result.body.resource.ram);
							$("#viewStorage").val(result.body.resource.storage);
							$("#viewOperatingSystem").val(result.body.resource.operating_system);
						}
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
			$("#viewRoomTypeGroup").hide();
			$("#viewRoomNumberGroup").hide();
			$("#viewCapacityGroup").hide();
			$("#viewHeightGroup").hide();
			$("#viewWidthGroup").hide();
			$("#viewLengthGroup").hide();
        }
		
		if(row.type == "WhiteBoard") {
            $("#viewPrintableGroup").show();
        } else {
            $("#viewPrintableGroup").hide();
        }
		
		if(row.type == "Computer") {
            $("#viewRamGroup").show();
			$("#viewStorageGroup").show();
			$("#viewOperatingSystemGroup").show();
        } else {
            $("#viewRamGroup").hide();
			$("#viewStorageGroup").hide();
			$("#viewOperatingSystemGroup").hide();
        }
    }));

    var editRow;

    $("#table").on("click", ".edit",(function() {
        var row = table.row($(this).parents('tr'));
        var rowData = row.data();
        editRow = row;
        $("#editID").val(rowData.resource_id);
        editType.val(rowData.type).trigger("change");

		if(rowData.type == "Room") {
			$.ajax({
					url: '/rooms/' + rowData.room_type + '/' + rowData.resource_id, 
					type : "GET", 
					success : function(result) {
					$("#editStatus").val("false").trigger("change");
					if (result.status) {
						if (result.body.reservations.length > 0) {
							$("#editStatus").attr('disabled', true);
						}
						$("#editRoomType").val(result.body.room_type).trigger("change");
						$("#editRoomNumber").val(result.body.room_number);
						$("#editCapacity").val(result.body.capacity);
						$("#editHeight").val(result.body.height);
						$("#editWidth").val(result.body.width);
						$("#editLength").val(result.body.length);
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
        } else {
			$.ajax({
				url: '/inventory/' + rowData.type + '/' + rowData.resource_id, 
				type : "GET",
				success : function(result) {
					if (result.status) {
						$("#editStatus").attr('disabled', false);
						$("#editStatus").val(result.body.resource.it_resource.toString()).trigger("change");
						if (result.body.resource.type === "WhiteBoard") {
							$("#editPrintableType").val(result.body.resource.is_printable.toString()).trigger("change");
						}
						if (result.body.resource.type === "Computer") {
							$("#editRam").val(result.body.resource.ram);
							$("#editStorage").val(result.body.resource.storage);
							$("#editOperatingSystem").val(result.body.resource.operating_system);
						}
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
		}
    }));

    $('#createRecord').click(function() {
        var type = $("#createType").val();
		var created = {};
		if(type == "Room") {
			created.room = {};
			created.room.type = type;
			created.room.room_type = $("#createRoomType").val()
			created.room.room_number = $("#createRoomNumber").val();
			created.room.capacity = $("#createCapacity").val();
			created.room.height = $("#createHeight").val();
			created.room.width = $("#createWidth").val();
			created.room.length = $("#createLength").val();
			created = JSON.stringify(created);
			$.ajax({
					url: '/rooms', 
					headers: {
						'Content-Type':'application/json'
					},
					dataType: "json",
					type : "POST",
					data : created, 
					success : function(result) {
					if (result.status) {
						location.reload();
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
		} else {
			created.resource = {};
			created.resource.it_resource = true;
			created.resource.type = type;
			if(type == "WhiteBoard") {
				created.resource.isPrintable = $("#createPrintableType").val();
			}
		
			if(type == "Computer") {
				created.resource.ram = $("#createRam").val();
				created.resource.storage = $("#createStorage").val();
				created.resource.operating_system = $("#createOperatingSystem").val();
			}
			created = JSON.stringify(created);
			$.ajax({
					url: '/inventory', 
					headers: {
						'Content-Type':'application/json'
					},
					dataType: "json",
					type : "POST",
					data : created, 
					success : function(result) {
					if (result.status) {
						location.reload();
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
		}
    });

    $('#editRecord').click(function() {
		var id = $("#editID").val();
		var type = $("#editType").val();
        var created = { };
		
		if(type == "Room") {
			var roomtype = $("#editRoomType").val();
			created.room = {};
			created.room.room_type = $("#editRoomType").val();
			created.room.room_number = $("#editRoomNumber").val();
			created.room.capacity = $("#editCapacity").val();
			created.room.height = $("#editHeight").val();
			created.room.width = $("#editWidth").val();
			created.room.length = $("#editLength").val();
			created = JSON.stringify(created);
			$.ajax({
					url: '/rooms/' + roomtype + '/' + id, 
					headers: {
						'Content-Type':'application/json'
					},
					dataType: "json",
					type : "POST",
					data : created, 
					success : function(result) {
					if (result.status) {
						location.reload();
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
		} else {
			created.resource = {};
			created.resource.is_it = true;
			if(type == "WhiteBoard") {
				created.resource.isPrintable = $("#editPrintableType").val();
			}
		
			if(type == "Computer") {
				created.resource.ram = $("#editRam").val();
				created.resource.storage = $("#editStorage").val();
				created.resource.operating_system = $("#editOperatingSystem").val();
			}
			created = JSON.stringify(created);
			$.ajax({
					url: '/inventory/' + type + '/' + id, 
					headers: {
						'Content-Type':'application/json'
					},
					dataType: "json",
					type : "POST",
					data : created, 
					success : function(result) {
					if (result.status) {
						location.reload();
					}
					console.log(result);
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			})
		}
    });

    $('#deleteResources').click(function() {
        $(".quickEditCB:checked").each(function() { 
            var row = table.row($(this).parents('tr'));
			var id = row.data().resource_id;
			var type = row.data().type;

			var url = ""
			if (type === "Room") {
				var roomType = row.data().room_type;
				url = '/rooms/' + roomType + '/' + id;
			}
			else {
				url = '/inventory/' + type + '/' + id;
			}

            $.ajax({
				url: url, 
				type : "DELETE",
				success : function(result) {
					if (result.status) {
						location.reload();
					}
					console.log(result);
					table.row($(this).parents('tr')).remove().draw();
				},
				error: function(xhr, resp, text) {
					console.log(xhr, resp, text);
					// TODO: flash prompt for pass again
				}
			});     
        });   
    });
	
	$('#createResource').click(function() {
        $("#createType").trigger("change");       
    });

    $('#quickAvailable').click(function() {
        // get all ids of checked items
        var ids = new Array();

        $(".quickEditCB:checked").each(function() { 
            ids.push(this.value);
            var row = table.row($(this).parents('tr'));
            rowData = row.data();

            var created = { 
                "resource_id": rowData.resource_id, 
                "type":  rowData.type, 
                "status": "Available" 
            };

            table.row(row).remove();
            table.row.add(created).draw();
        });

        // $.ajax({
        //     url: '/inventory/', 
        //     type : "DELETE", 
        //     dataType : 'json', 
        //     data : ids, 
        //     success : function(result) {
                
        //         // TODO: refresh results? or use javascript to update table?
        //         console.log(result);
        //     },
        //     error: function(xhr, resp, text) {
        //         console.log(xhr, resp, text);
        //     }
        // });        
    });

    $('#quickUnavailable').click(function() {
        // get all ids of checked items
        var ids = new Array();

        $(".quickEditCB:checked").each(function() { 
            ids.push(this.value);
            var row = table.row($(this).parents('tr'));
            rowData = row.data();

            var created = { 
                "resource_id": rowData.resource_id, 
                "type":  rowData.type, 
                "status": "Unavailable" 
            };

            table.row(row).remove();
            table.row.add(created).draw();
        });     
    });
	
	$('#editType').on('change', function (e) {
		var optionSelected = $("option:selected", this);
		var valueSelected = this.value;
		if(valueSelected == "Room") {
			$("#editRoomIDGroup").show();
			$("#editRoomTypeGroup").show();
			$("#editRoomNumberGroup").show();
			$("#editCapacityGroup").show();
			$("#editHeightGroup").show();
			$("#editWidthGroup").show();
			$("#editLengthGroup").show();
        } else {
			$("#editRoomIDGroup").hide();
			$("#editRoomTypeGroup").hide();
			$("#editRoomNumberGroup").hide();
			$("#editCapacityGroup").hide();
			$("#editHeightGroup").hide();
			$("#editWidthGroup").hide();
			$("#editLengthGroup").hide();
        }
		
		if(valueSelected == "WhiteBoard") {
            $("#editPrintableGroup").show();
        } else {
            $("#editPrintableGroup").hide();
        }
		
		if(valueSelected == "Computer") {
            $("#editRamGroup").show();
			$("#editStorageGroup").show();
			$("#editOperatingSystemGroup").show();
        } else {
            $("#editRamGroup").hide();
			$("#editStorageGroup").hide();
			$("#editOperatingSystemGroup").hide();
        }
	});
	
	$('#createType').on('change', function (e) {
		var optionSelected = $("option:selected", this);
		var valueSelected = this.value;
		if(valueSelected == "Room") {
			$("#createRoomTypeGroup").show();
			$("#createRoomNumberGroup").show();
			$("#createCapacityGroup").show();
			$("#createHeightGroup").show();
			$("#createWidthGroup").show();
			$("#createLengthGroup").show();
        } else {
			$("#createRoomTypeGroup").hide();
			$("#createRoomNumberGroup").hide();
			$("#createCapacityGroup").hide();
			$("#createHeightGroup").hide();
			$("#createWidthGroup").hide();
			$("#createLengthGroup").hide();
        }
		
		if(valueSelected == "WhiteBoard") {
            $("#createPrintableGroup").show();
        } else {
            $("#createPrintableGroup").hide();
        }
		
		if(valueSelected == "Computer") {
            $("#createRamGroup").show();
			$("#createStorageGroup").show();
			$("#createOperatingSystemGroup").show();
        } else {
            $("#createRamGroup").hide();
			$("#createStorageGroup").hide();
			$("#createOperatingSystemGroup").hide();
        }
	});
}
$(document).ready(function(){
	$.ajax({
            url: 'inventory', 
            method : "GET", 
			crossDomain: true,
			headers: {
				"content-type": "application/json"
			},
            success : function(result) {
				if (result.status) {
					initTable(result.body.resources);
				}
                // TODO: redirect to resources
                console.log(result);
            },
            error: function(xhr, resp, text) {
				//need cookie
                console.log(xhr, resp, text);
                // TODO: flash prompt for pass again
            }
        })
});

	$("#logout").on('click', function(){
		document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		localStorage.removeItem("userId");
		localStorage.removeItem("isAdmin");
   		window.location="/Login.html";
    });
	
	if (localStorage.getItem("userId") === null || localStorage.getItem("isAdmin") === null || localStorage.getItem("isAdmin") === "false") {
		$("#logout").click();
	}
	
	$.ajax({
        url: 'inventory', 
        method : "GET", 
		crossDomain: true,
		headers: {
			"content-type": "application/json"
		},
        success : function(result) {
			if (result.status) {
				initTable(result.body.resources);
			}
            // TODO: redirect to resources
            console.log(result);
        },
        error: function(xhr, resp, text) {
			//need cookie
            console.log(xhr, resp, text);
            // TODO: flash prompt for pass again
        }
    });
});
