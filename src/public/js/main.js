// object holding info about archive currently being edited
var currentArchive = {};


// Initial data gets for sidebar ===================================================================

function refreshSideBar() {
	// hide edit buttons
	$('#xmlEditBtns').hide();
	// empty working, pending, and problems views
	$('#W').empty();
	$('#P').empty();
	$('#L').empty();

	// call API get function getOldestArchive to get oldest archive in currentArchive dir
	getOldestArchive().done(function(res) {
		$('#oldestArchive').text(res);
	});

	// call API get function getArchives to get archives in working, pending, and problems dirs
	getArchives().done(function(res) {
		//display in sidebar
		displayArchives(res);
	});
}

refreshSideBar();

// JQUERY event watchers ===========================================================================

$(document).ready(function() {

	// Load button click (oldest archive)
	$('#loadOldestArchive').click(function() {
		currentArchive = {};
		// call API get function getOneArchive(archive, id, status) to get data about archive 
		getOneArchive('', '', '').done(function(res) {
			currentArchive.name = res.name;
			currentArchive.status = res.status;
			currentArchive.contents = res.contents;
			currentArchive.archiveUrl = res.archiveUrl;
			currentArchive.pdf = parseArchiveFiles(currentArchive);
			currentArchive.readyUrl = res.readyUrl;

			// call API get function getJsonFromXml to get the json data from current archive
			getJsonFromXml(currentArchive).done(function(res) {
				currentArchive.json = res;
				// use json2html to display json 
				visualize(currentArchive.json);
				// prefill the form using function mapJson
				preFillForm(mapJson(currentArchive)).done(function(res) {
					// once form is filled post this to database and set the subId
					postFormData(currentArchive).done(function(res) {
						currentArchive.subId = res.id;
						refreshSideBar();
					});
				});
			});
		});
	}); 

	// submit for batch upload button click
	$('#submitToBatch').click(function() {
		// submit updated data and mark Pending
		currentArchive.status = 'P';
		postFormData(currentArchive).done(function(res) {
			refreshSideBar();
			clearEditView();
		});
		
	});

	// move to problems button click
	$('#moveToProblems').click(function() {
		// submit updated data and mark problem
		currentArchive.status = 'L';
		postFormData(currentArchive).done(function(res) {
			refreshSideBar();
			clearEditView();
		});
	});
});

// click handlers for archive links in working, pending, and problems on sidebar
// since these elements are created dynamically create event watchers that will attach to these 
$(document).on('click', '.getme', function(event) {
	currentArchive = {};
	currentArchive.subId = event.target.attributes.subId.textContent;
	var archive = event.target.attributes.archive.textContent;

	console.log(currentArchive.subId);

	getOneArchive(archive, currentArchive.subId, '').done(function(res) {
		currentArchive.name = res.name;
		currentArchive.status = res.status;
		currentArchive.contents = res.contents;
		currentArchive.pdf = parseArchiveFiles(res);
		currentArchive.db = res.data[0];
		currentArchive.readyUrl = res.readyUrl;

		preFillForm(mapDb(currentArchive));

		// call API get function getJsonFromXml to get the json data from current archive
		getJsonFromXml(currentArchive).done(function(res) {
			currentArchive.json = res;
			// use json2html to display json 
			visualize(currentArchive.json);
			// call map function that maps database data to the edit form's fields
		});
	});

});

// Display Functions ===============================================================================

// parse archive folder contents displaying to DOM if not xml and returning the pdf file
function parseArchiveFiles(data) {
	$('#archiveFiles').empty();
	var pdfFile;
	// loop through array of files in archive
	for (var i=2; i<data.length; i++) {
		var file = data[i];
		var ext = file.substr(file.length - 3, file.length);

		// display files that are not xml
		if (ext !== 'xml') {
			$('#archiveFiles').html('<a target="_blank" href="' + data.archiveUrl + file + '">' + file + '</a>');
			if (ext === 'pdf') {
				pdfFile = file;
			}
		}
	}
	return pdfFile;
}

// prefills the xml edit form with data from xmlData using map.js as a map
function preFillForm(map) {
	var dfd = $.Deferred();

	$('#xmlEdit').empty();

	for (var i in map) {
		// create basic html, and append to form
		var data = '<div class="form-group">' +
						'<label for="' + map[i].id + '">' + map[i].name + '</label>' +
					'</div>';
		$('#xmlEdit').append(data);

		// if type is test-long create textarea, else create input
		if (map[i].type === 'text-long') {
			//append textarea afer label
			$('label:last').after('<textarea class="form-control" id="' + map[i].id + '" name="' + map[i].id + '"></textarea>');
			//add value to <textarea>
			$('#' + map[i].id).val(map[i].data);
			//calculate how many rows based in scrollHeight
			var rows = calcRows($('#' + map[i].id)[0].scrollHeight);
			// change # of rows
			$('#' + map[i].id).attr('rows', rows);
		} else {
			// append <input> after label
			$('label:last').after('<input class="form-control" id="' + map[i].id + '" name="' + map[i].id + '">');
			//add value and type to input
			$('#' + map[i].id)
				.attr('type', map[i].type)
				.val(map[i].data)
				.attr('readonly', map[i].readonly);
		}
	}
	dfd.resolve();
	// show submit and move buttons
	$('#xmlEditBtns').show();
	return dfd.promise();
}

// append archive files in working, pending, and problems to sidebar
function displayArchives(archives) {

	for (var i = 0; i < archives.length; i++) {
		var data = '<a href="#" class="getme" subId="' + archives[i].submission_id + '" archive="' + archives[i].sequence_num + '">' + archives[i].identikey + '-' + archives[i].sequence_num + '</a><br>';
		$('#' + archives[i].workflow_status).append(data);
	}
}

function refreshEditView() {
	// empty edit and view views
	$('#xmlEdit').empty();
	$('#top').empty();


}

// Helper Functions ================================================================================

// calculate the number of rows the textareas should be to show all text
function calcRows(scrollHeight) {
	return Math.round(scrollHeight/20) - 1;
}

// remove '@' and 'DISS_' 
function stripChars(str) {
	var mapObj = {
		'@attributes': 'attributes',
		'DISS_': ''
	};

	str = str.replace(/@attributes|DISS_/g, function(matched) {
		return mapObj[matched];
	});

	return str;
}


// API CALLS =======================================================================================

// get oldest archive from ftp directory
function getOldestArchive() {
	var dfd = $.Deferred();

	$.ajax( {
		url: 'modules/archive/archive.php',
		type: 'GET',
		data: {'action': 'getOldestArchive'},
		success: function(res, status) {
			dfd.resolve(res);
		},
		error: function(xhr, desc, err) {
	            console.log(xhr);
	            console.log("Details: " + desc + "\nError: " + err);
	    }
	});

	return dfd.promise();
}

// get archive's dir names in working, pending, and problems dirs
function getArchives() {
	var dfd = $.Deferred();

	$.ajax( {
		url: 'modules/archive/archive.php',
		type: 'GET',
		data: {'action': 'getArchives'},
		success: function(res, status) {
			dfd.resolve(JSON.parse(res));
		},
		error: function(xhr, desc, err) {
	            console.log(xhr);
	            console.log("Details: " + desc + "\nError: " + err);
	    }
	});

	return dfd.promise();
}

// get one archive's properties
function getOneArchive(archive, id, status) {
	var dfd = $.Deferred();

	$.ajax( {
		url: 'modules/archive/archive.php',
		type: 'GET',
		datatype: 'JSON',
		data: {
			'action': 'getOneArchive',
			'status': status,
			'subId': id,
			'archive': archive
		},
		success: function(res, status) {
			console.log(JSON.parse(res));
			dfd.resolve(JSON.parse(res));
		},
		error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError: " + err);
        }
	});

	return dfd.promise();
}

// get contents of XML file in json
function getJsonFromXml(archive) {
	var dfd = $.Deferred();

	$.ajax({
		url: 'modules/xml/xml.php',
		type: 'GET',
		data: {
			'action': 'getJsonFromXml',
			'archive': archive.name
		},
		success: function(res, status) {
			dfd.resolve(JSON.parse(stripChars(res)));
		},
		error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError: " + err);
		}
	});

	return dfd.promise();
}

// move archive to pending dir
function postFormData(archive) {


	console.log(archive);

	var dfd = $.Deferred();

	$.ajax( {
		url: 'modules/archive/archive.php',
		type: 'POST',
		data: {
			'action': 'postFormData',
			'archive': archive.name,
			'status': archive.status,
			'subId': archive.subId,
			'data': $('#xmlEdit').serialize()
		},
		success: function(res, status) {
			console.log(res);
			console.log(JSON.parse(res));
			dfd.resolve(JSON.parse(res));
		},
		error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError: " + err);
        }
	});

	return dfd.promise();
}








