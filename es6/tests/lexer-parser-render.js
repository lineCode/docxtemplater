const Lexer = require("../lexer.js");
const { expect, makeDocx } = require("./utils");
const fixtures = require("./fixtures");
const docxconfig = require("../file-type-config").docx;
const inspectModule = require("../inspect-module.js");
const tagsDocxConfig = {
	text: docxconfig.tagsXmlTextArray,
	other: docxconfig.tagsXmlLexedArray,
};

function cleanRecursive(arr) {
	arr.forEach(function(p) {
		delete p.lIndex;
		delete p.endLindex;
		delete p.offset;
		if (p.subparsed) {
			cleanRecursive(p.subparsed);
		}
		if (p.expanded) {
			p.expanded.forEach(cleanRecursive);
		}
	});
}

describe("Algorithm", function() {
	Object.keys(fixtures).forEach(function(key) {
		const fixture = fixtures[key];
		(fixture.only ? it.only : it)(fixture.it, function() {
			const doc = makeDocx(key, fixture.content);
			doc.setOptions(fixture.options);
			const iModule = inspectModule();
			doc.attachModule(iModule);
			doc.setData(fixture.scope);
			doc.render();
			cleanRecursive(iModule.inspect.lexed);
			cleanRecursive(iModule.inspect.parsed);
			cleanRecursive(iModule.inspect.postparsed);
			if (iModule.inspect.content && fixture.result !== null) {
				expect(iModule.inspect.content).to.be.deep.equal(
					fixture.result,
					"Content incorrect"
				);
			}
			if (fixture.lexed !== null) {
				expect(iModule.inspect.lexed).to.be.deep.equal(
					fixture.lexed,
					"Lexed incorrect"
				);
			}
			if (fixture.parsed !== null) {
				expect(iModule.inspect.parsed).to.be.deep.equal(
					fixture.parsed,
					"Parsed incorrect"
				);
			}
			if (fixture.postparsed !== null) {
				expect(iModule.inspect.postparsed).to.be.deep.equal(
					fixture.postparsed,
					"Postparsed incorrect"
				);
			}
		});
	});

	Object.keys(fixtures).forEach(function(key) {
		const fixture = fixtures[key];
		(fixture.only ? it.only : it)(`Async ${fixture.it}`, function() {
			const doc = makeDocx(key, fixture.content);
			doc.setOptions(fixture.options);
			const iModule = inspectModule();
			doc.attachModule(iModule);
			doc.compile();
			return doc.resolveData(fixture.scope).then(function() {
				doc.render();
				cleanRecursive(iModule.inspect.lexed);
				cleanRecursive(iModule.inspect.parsed);
				cleanRecursive(iModule.inspect.postparsed);
				if (iModule.inspect.content) {
					expect(iModule.inspect.content).to.be.deep.equal(
						fixture.result,
						"Content incorrect"
					);
				}
				if (fixture.lexed !== null) {
					expect(iModule.inspect.lexed).to.be.deep.equal(
						fixture.lexed,
						"Lexed incorrect"
					);
				}
				if (fixture.parsed !== null) {
					expect(iModule.inspect.parsed).to.be.deep.equal(
						fixture.parsed,
						"Parsed incorrect"
					);
				}
				if (fixture.postparsed !== null) {
					expect(iModule.inspect.postparsed).to.be.deep.equal(
						fixture.postparsed,
						"Postparsed incorrect"
					);
				}
			});
		});
	});

	it("should xmlparse strange tags", function() {
		const xmllexed = Lexer.xmlparse(
			fixtures.strangetags.content,
			tagsDocxConfig
		);
		cleanRecursive(xmllexed);
		expect(xmllexed).to.be.deep.equal(fixtures.strangetags.xmllexed);
	});
});
