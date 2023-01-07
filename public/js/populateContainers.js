// Traverse through all times from least timestamp and populate in a hashmap (String-> Integer) the volume

$(document).ready(function(event) {


	var containerVolumes = []; //Todo load from container
	firebase.database().ref('/orders' ).once('value').then(function(snapshot) {
		var data = snapshot.val();
		for (var date in data){
			for (var orderId in data[date]){
				var order = data[date][orderId];
				if(!order){
					console.log(date + " is corrupt for orderid " + orderId);
					continue;
				}
				var container = order["Container"];
				
				var storedDate = containerVolumes[container] ? containerVolumes[container]["date"] : 0;
				var orderDate = new Date(date.replace('_','/').replace('_','/')).getTime();
				if(!storedDate || (storedDate < orderDate)){
					containerVolumes[container] = {"date" : orderDate , "volume" : 0, "key" : date};
				} 
				if( containerVolumes[container]["date"] == orderDate) {
					var totalVol = parseInt(order["VolumeNotConfirmed"].replace(',',''),10) + parseInt(order["VolumeConfirmed"].replace(',',''),10);
					containerVolumes[container]["volume"] += totalVol;
				}
			}
		}
		for (var cId in containerVolumes){
			var container = containerVolumes[cId];
			if(isContainerdhl(cId))
				continue;
			var region = cId.replace(/\d+/g, '');
			firebase.database().ref("containers/" + region + "/" + cId).update({
				"size" : container["volume"]
			});
		}

	});


});