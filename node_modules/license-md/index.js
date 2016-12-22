var checker   = require('npm-license');      // AceMetrix/npm-license
var sort      = require('sort-component');   // npmjs.org/package/sort-component
var thispack;
try {
	thispack  = require('../../package.json');
} catch(e) {
	thispack  = require('./package.json');
}

var results = "\n<!--- :angleman@license-md/begin -->\n";

checker.init({
    start: './',
    suppress: true
}, function(json) {

	var green = '?bg=%23339e00';
	var yellow = '?bg=%23ddcb02';
	var grey   = '';
	var colors = {
		'Apache' : green,
		'Apache*' : green,
		'BSD' : green,
		'BSD*' : green,
		'GPL' : green,
		'GPL*' : green,
		'MIT' : green,
		'MIT*' : green,
		'PD' : green,
		'PD*' : green,
		'Unknown': grey
	};

	var bylicense = {
		'Apache' : {},
		'Apache*' : {},
		'BSD' : {},
		'BSD*' : {},
		'GPL' : {},
		'GPL*' : {},
		'MIT' : {},
		'MIT*' : {},
		'PD' : {},
		'PD*' : {},
		'Unknown': {}
	}

	var asterix = ' (text scan guess)';

	var licenseDesc = {
		'Apache'  : 'Apache',
		'Apache*' : 'Apache'+asterix,
		'BSD'     : 'Berkeley Software Distribution',
		'BSD*'    : 'Berkeley Software Distribution'+asterix,
		'GPL'     : 'GNU General Public License',
		'GPL*'    : 'GNU General Public License'+asterix,
		'MIT'     : 'Massachusetts Institute of Technology',
		'MIT*'    : 'Massachusetts Institute of Technology'+asterix,
		'PD'      : 'Public Domain',
		'PD*'     : 'Public Domain'+asterix,
		'Unknown' : 'Unknown License'
	}


	var packlist = [];

	Object.keys(json).forEach(function(key) {
		var item = json[key];

		var licenses = item.licenses;
		if (typeof licenses == 'string') {
			licenses = [licenses];
		}
		try {
			var license = licenses[0];
		} catch(err) {
			license = 'Unknown';
		}
		if (license == 'UNKNOWN') {
			license = 'Unknown';
		}
		if (!bylicense[license]) {
			bylicense[license] = {};
		}
		if (typeof item.repository == 'string') {
			item.repository = item.repository.replace('git@github.com:', 'https://github.com/');
		}

		delete item.licenses;

		var keyparts = key.split('@');
		item.id = keyparts[0];
		item.ver  = keyparts[1];

		item.license = license;

		item.repository = item.repository || '#';

		var color = (colors[license]) ? colors[license] : '';
		item.badge_url = 'http://badgr.co/'+ item.id+'/'+ license +'.png'+color;
		item.lic_desc  = licenseDesc[license];


		section = (thispack.dependencies     && thispack.dependencies[item.id])     ? 'Dependencies'
			:     (thispack.peerDependencies && thispack.peerDependencies[item.id]) ? 'Peer Dependencies'
			:     (thispack.devDependencies  && thispack.devDependencies[item.id])  ? 'Development Dependencies' 
			:     undefined
		;

		if (section) {
			item.section = section;
//		}
//		if (!(thispack.name && thispack.name == item.id)) {
			packlist.push(item);
		}
	});

	//console.log(thispack);

	sort(packlist, {  section:1, id: 1 });
//	console.log(packlist);

	var prior_section = '';

	for (var i=0; i<packlist.length; i++) {
		item = packlist[i];

		if (item.section != prior_section) {
			if (prior_section && prior_section.length && prior_section.length > 0) {
				results = results + "\n\n";
			}
			results = results + item.section + ":\n\n";
			prior_section = item.section;
		}

		results = results + '[![' + item.id + '](' + item.badge_url + ' "'
			+ item.id + '@' + item.ver + ' ' + item.lic_desc
			+ "\")]("+ item.repository + ")\n"
		;
	}

	results = results + "\n<!--- :angleman@license-md/end -->";
	console.log(results);

});