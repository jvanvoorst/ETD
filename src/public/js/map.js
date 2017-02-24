function mapFunc(xmlData) {
	return [
		{
			"name": "Title",
			"id": "title",
			"data": xmlData.description.title.toTitleCase(),
			"type": "text-long"
		},
		{
			"name": "Full Text Url",
			"id": "fullTextUrl",
			"data": "will be internet accessable url",
			"type": "url"
		},
		{
			"name": "Keywords",
			"id": "keywords",
			"data": xmlData.description.categorization.keyword,
			"type": "text-long"
		},
		{
			"name": "Abstract",
			"id": "abstract",
			"data": xmlData.content.abstract.para,
			"type": "text-long",
		},
		{
			"name": "Author1 FName",
			"id": "fName",
			"data": xmlData.authorship.author.name.fname,
			"type": "text"
		},
		{
			"name": "Author1 MName",
			"id": "mName",
			"data": xmlData.authorship.author.name.middle,
			"type": "text"
		},
		{
			"name": "Author1 LName",
			"id": "lname",
			"data": xmlData.authorship.author.name.surname,
			"type": "text"
		},
		{
			"name": "Author1 Suffix",
			"id": "suffix",
			"data": (xmlData.authorship.author.name.suffix[0]) ? xmlData.authorship.author.name.suffix : undefined,
			"type": "text"
		},
		{
			"name": "Author1 Email",
			"id": "email",
			"data": xmlData.authorship.author.contact[0].email,
			"type": "email"
		},
		{
			"name": "Author1 Institution",
			"id": "institution",
			"data": xmlData.description.institution.inst_name,
			"type": "text"
		},
		{
			"name": "Advisor1",
			"id": "advisor1",
			"data": (xmlData.description.cmte_member[0]) ? xmlData.description.cmte_member[0].name.surname + ', ' + xmlData.description.cmte_member[0].name.fname : undefined,
			"type": "text"
		},
		{
			"name": "Advisor2",
			"id": "advisor2",
			"data": (xmlData.description.cmte_member[1]) ? xmlData.description.cmte_member[1].name.surname + ', ' + xmlData.description.cmte_member[1].name.fname : undefined,
			"type": "text"
		},
		{
			"name": "Advisor3",
			"id": "advisor3",
			"data": (xmlData.description.cmte_member[2]) ? xmlData.description.cmte_member[2].name.surname + ', ' + xmlData.description.cmte_member[2].name.fname : undefined,
			"type": "text"
		},
		{
			"name": "Advisor4",
			"id": "advisor4",
			"data": (xmlData.description.cmte_member[3]) ? xmlData.description.cmte_member[3].name.surname + ', ' + xmlData.description.cmte_member[3].name.fname : undefined,
			"type": "text"
		},
		{
			"name": "Advisor5",
			"id": "advisor5",
			"data": (xmlData.description.cmte_member[4]) ? xmlData.description.cmte_member[4].name.surname + ', ' + xmlData.description.cmte_member[4].name.fname : undefined,
			"type": "text"
		},
		{
			"name": "Disciplines",
			"id": "disciplines",
			"data": "???",
			"type": "text"
		},
		{
			"name": "Comments",
			"id": "comments",
			"data": "???",
			"type": "text"
		},
		{
			"name": "Degree Name",
			"id": "degreeName",
			"data": xmlData.description.degree.replace(/\./g, ''),
			"type": "text"
		},
		{
			"name": "Department",
			"id": "department",
			"data": xmlData.description.institution.inst_contact,
			"type": "text"
		},
		{
			"name": "Document Type",
			"id": "docType",
			"data": (xmlData.description.attributes.type === 'doctoral') ? 'Dissertation' : 'Thesis',
			"type": "text"
		},
		{
			"name": "Embargo Date",
			"id": "embargoDate",
			"data": "xmlData.description.title",
			"type": "date"
		},
		{
			"name": "Publication Date",
			"id": "pubDate",
			"data": xmlData.description.dates.comp_date,
			"type": "date"
		},
		{
			"name": "Season",
			"id": "season",
			"data": "???",
			"type": "text"
		}
	];
}

String.prototype.toTitleCase = function() {
  var i, j, str, lowers, uppers;
  str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless 
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
      function(txt) {
        return txt.toLowerCase();
      });

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), 
      uppers[i].toUpperCase());

  return str;
};

