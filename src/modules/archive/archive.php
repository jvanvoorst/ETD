<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/etd/resources/config.php');
require(MODULES_PATH . '/archive/models/archiveModel.php');
require(MODULES_PATH . '/archive/models/disciplineListModel.php');


if (isset($_GET['action'])) {

	switch ($_GET['action']) {
		case 'getOldestArchive':
			echo getOldestArchive();
			break;
		case 'getArchives':
			echo getArchives();
			break;
		case 'getExtractOldestArchive':
			$oldestArchive = json_decode(getOldestArchive(), true);
			$archive = new ArchiveModel(extractZip($oldestArchive['oldestArchive']), null, 'W');
			echo $archive->getExtractOldestArchive();
			break;
		case 'getOneArchive':
			$archive = new ArchiveModel($_GET['archive'], $_GET['subId'], $_GET['status']);
			echo $archive->getOneArchive();
			break;
		case 'lookupDiscipline':
			$disciplineList = new DisciplineListModel();
			echo json_encode($disciplineList->isValidDiscipline($_GET['data']));
			break;
		case 'getDisciplines':
			$disciplineList = new DisciplineListModel();
			echo json_encode($disciplineList->sendDisciplines());
	}
}

if (isset($_POST['action'])) {
	switch ($_POST['action']) {
		case 'postFormData':
			insertFormData($_POST['data'], $_POST['subId']);
			break;
		case 'updateBatch':
			$submission = new SubmissionModel;
			$submission->updateBatch();
	}

}

// finds oldest archive in ftp dir and creates archive object
function getOldestArchive() {
	global $config;

	// array of all zip archives in ftp dir
	$archives = glob($config['dir']['ftp'] . '*.zip');

	// if ftp dir not empty
	if ($archives) {
		$oldestArchiveArray = explode('/',$archives[0]);
		$oldestArchive = $oldestArchiveArray[sizeof($oldestArchiveArray) - 1];
		$response = array(
			'numArchives' => sizeof($archives),
			'oldestArchive' => $oldestArchive,
			'oldestModifiedDate' => filemtime($config['dir']['ftp'] . $oldestArchive)
		);
	} else {
		$response = array(
			'numArchives' => false
		);
	}

	return json_encode($response);
}

function extractZip($archive) {
	global $config;

	// strip .zip and split by '_' and return the last array item or just the sequence num
	$archiveFolder = explode('_', substr("$archive", 0, -4))[2];

	$zip = new ZipArchive();
	$res = $zip->open($config['dir']['ftp'] . $archive);

	if ($res === true) {
		// extract to working dir
		$zip->extractTo($config['dir']['working'] . $archiveFolder);
		$zip->close();

		// change permissions to rwxrwxr-x on the folder in working dir
		chmod($config['dir']['working'] . $archiveFolder, 0775);

		// move zip file to archive dir
		rename($config['dir']['ftp'] . $archive, $config['dir']['archive'] . $archive);

		return $archiveFolder;
	} else {
		return 'failed, code: ' . $res;
	}
}

function getArchives() {
	global $config;
	// get all records from database not marked ready
	$submission = new SubmissionModel();
	$res = $submission->selectWorkingItems();

	return $res;
}

function insertFormData($data, $id) {
	parse_str($data, $formDataArray);

	$submission = new SubmissionModel();

	if (!$id) {
		echo $submission->insertItem($formDataArray);
	} else {
		echo $submission->updateItem($id, $formDataArray);
	}
}

exit();

?>
