
exports.initialize = function(req, res) {

	res.render('nationalreport');

}


exports.upload = function(req, res) {

	res.render('uploadfile');

}

exports.report = function(req, res) {

	res.render('detailreport');

}


exports.tasks = function(req,res) {
	res.render('detailreport');
}

exports.archived = function(req,res) {
	res.render('detailreport');
}


exports.login = function(req,res) {
	res.render('authentication');
}
exports.signup = function(req,res) {
	res.render('authentication');
}

exports.dealer =function(req,res){
	res.render('dealerdata');
}

exports.dealerlogin =function(req,res){
	res.render('authentication');
}

exports.dealersignup =function(req,res){
	res.render('authentication');
}
exports.airfreight =function(req,res){
	res.render('detailreport');
}
exports.forwarder =function(req,res){
	res.render('forwarder');
}
