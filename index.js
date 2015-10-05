
module.exports = function() {

	var fs = require('fs');
	var jade = require('jade');
	var path = require('path');
	var Converter = require('csvtojson').Converter;
	var converter = new Converter({});

	function readCsv(filename) {

		fs.createReadStream(filename).pipe(converter);

		converter.on('end_parsed', function(jsonArray) {

			convertToXml(jsonArray);
		});
	}

	function convertToXml(json) {

		var rst = {};
		json.forEach(function(item) {

			if (item.grouping === '') {

				item.grouping = 'Other';
			}

			var group = rst[item.grouping] || [];

			var n = {};
			n.Title = item.name;
			n.URL = item.url;
			n.UserName = item.username;
			n.Password = item.password;
			n.Notes = item.extra;
			group.push(n);

			rst[item.grouping] = group;
		});

		var xml = jade.renderFile('./macpass.jade', {Groups: rst});

		var optput = path.join(process.cwd, 'macpass.xml');
		fs.writeFile(output, xml, function(err) {
			if (err) {
				console.error(err, err.stack);
			} else {
				console.info('Output: ', output);
			}
		})
	}

	function parseOpts() {

		var args = process.argv;
		var input = args[2];

		if (args.indexOf('-h') > -1 || args.indexOf('--help') || args.indexOf('help') || !input) {

			console.log('');
			console.log('   Usage: lastpasstomacpass lastpass.csv\n');
			console.log('   It will generate `macpass.xml` in current directory.\n')
			return;
		}

		try {

			fs.statSync(input);
		} catch(e) {

			console.log(e.message);
			return;
		}

		readCsv(input);
	}

	parseOpts();
};

