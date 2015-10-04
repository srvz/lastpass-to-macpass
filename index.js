
module.exports = function() {

	var fs = require('fs');
	var Converter = require('csvtojson').Converter;
	var converter = new Converter({});
	var jade = require('jade');

	function readCsv(filename) {

		fs.createReadStream(filename).pipe(converter);

		converter.on('end_parsed', function(jsonArray) {

			convertToXml(jsonArray);
		});

		converter.on('error', function(error) {

			console.error(error);
		})
	}

	function convertToXml(json) {

		var rst = {};
		json.forEach(function(item) {

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
		fs.writeFile('/Users/huokr/Documents/macpass-file.xml', xml, function(err) {
			if (err) {
				console.error(err, err.stack);
			} else {
				console.info('done');
			}
		})
	}

	function parseOpts() {

		var args = process.argv;
		var input = args[2];

		if (args.indexOf('-h') > -1 || args.indexOf('--help') || args.indexOf('help') || !input) {

			console.log('');
			console.log('   Usage: lastpasstomacpass lastpass.csv\n');
			console.log('   It will generate `macpass.xml` in the same directory.\n')
			return;
		}


		try {

			fs.statSync(input);
		} catch(e) {

			console.log(e.message);
			return;
		}

		readCsv(input);
	};

	parseOpts();

};

