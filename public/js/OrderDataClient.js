
var orders;
var dealers;
var dealersInPage; 
var initialized;
var commentsInitialized;
var selectedOrders = [];
var allTasks = [];
var dateKey = '12_20_2022'
function registerBulkActionEventHandler() {

  if(window.location.pathname != 'dealerdata'){
    $('#commentCollapse').on('click', function (e){
      $('#bulkComment').focus();
    });
    $('#bulkCommentBtn').on('click', function (e){
      bulkCommentAlert(function (comment){
        
        for (var order in selectedOrders){
            var orderId =  order ; 
            var d = new Date();
            var date = d.getTime() ;
            var completed = "false";
            var user = localStorage['userEmail'];
  
            firebase.database().ref('/tasks/pending/'+ orderId).update(
             { "orderId" : orderId, "date" : date , "completed" : completed});
        
          var commentRef = firebase.database().ref('tasks/pending/' + orderId + '/comments').push();
          commentRef.set({'comment' : comment , 'date' : date , 'user' : user });
        } 
        if(selectedOrders && selectedOrders.length != 0)
          location.reload();

        
      });
    });
    $('#bulkCompleteBtn').on('click', function (e){
        var comment = 'Completed'
        alertAction(function (){
            for (var order in selectedOrders){
                var orderId = order ; 
                var d = new Date();
                var date = d.getTime() ;
                var completed = true;
                var user = localStorage['userEmail'];

                firebase.database().ref('/tasks/pending/'+ orderId).update(
                 { "orderId" : orderId, "date" : date , "completed" : completed});
              
              var commentRef = firebase.database().ref('tasks/pending/' + orderId + '/comments').push();
              commentRef.set({'comment' : comment , 'date' : date , 'user' : user });
            } 
            if(selectedOrders && selectedOrders.length != 0)
              location.reload();
        
      });

    });

  }
}

function alertAction(confirmed){
  var ordersHtml = '<div style="text-align:left;">';
  var ind =1;
  for (var i in selectedOrders){
   ordersHtml += '<span>' +ind+++ ':'+selectedOrders[i] +  '</span><br>';
  }
  ordersHtml += '</p>';
        swal({
            title: 'Mark Complete',
            type: 'warning',
            html: ordersHtml,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Save',
            closeOnConfirm: true,
            
        }).then( function() {
            confirmed();
        });
}


function bulkCommentAlert(confirmed){


  var ordersHtml = '<div style="text-align:left;">';
  var ind =1;
  for (var i in selectedOrders){
   ordersHtml += '<span>' +ind+++ ':'+selectedOrders[i] +  '</span><br>';
  }
  ordersHtml += '</p>';
  swal({
    input: 'text',
    title: 'Comment',
    type: 'warning',
    html: ordersHtml,
    showCancelButton: true,
    confirmButtonText: 'Save',
    animation: "slide-from-top",
    cancelButtonColor: '#d33',
    inputPlaceholder: "Write something",
    preConfirm: function (comment) {
        return new Promise(function (resolve, reject) {
         resolve();

        });
      },
      allowOutsideClick: false
    }).then(function (comment) {
      swal({
        type: 'success',
        title: 'Success'
        
      });
      confirmed(comment);
    });
/*
  
  function(inputValue){
    if (inputValue === false) return false;
    
    if (inputValue === "") {
      swal.showInputError("You need to write something!");
      return false
    }
    confirmed(inputValue);
    swal("Success!", "", "success");
  });*/


}

function displayTableRegion(ordersCopy,regions,tasks){
   orders = ordersCopy;
   
   var d = new Date();
   var dateKey = (d.getMonth()+1) + '_' + d.getDate() + '_' + d.getFullYear() ;
        
       firebase.database().ref('/containers' ).once('value').then(function(snapshot) {
          var containers = [];
             var airFreightMode = regions['airfreight'] ? regions['airfreight'] : null;
             if(airFreightMode) regions = [];
            //gets all containers in the region
            var dbContainers = snapshot.val();
            for(var regId in dbContainers){
              var reg = dbContainers[regId];
              if( Object.keys(regions).length!= 0 && !regions[regId])
                continue;

              var containerNames = snapshot.val()[regId];
              var isDHL = isContainerdhl(regId);
              for (var r in containerNames) {
                var name = r;
                /**
                if(isDHL){

                  containers[name] = [];
                  containers[name]["freightId"] =   containerNames[r]["freightId"];
                  containers[name]["boxDimensions"] = containerNames[r]["boxDimensions"];
                  containers[name]["boxWeight"] = containerNames[r]["boxWeight"];  
                  containers[name]["orders"] = [];
                  containers[name]["numBoxes"] = containerNames[r]["numBoxes"];
                  
                } else if(!airFreightMode){
                  containers[name] = [];
                  containers[name]['id'] =  containerNames[r]['id'];
                  containers[name]['name'] = containerNames[r]['name'];
                  containers[name]['size'] = containerNames[r]['size'];
                  if(containers[name]['totVol'])
                   containers[name]['totVol'] = containerNames[r]['totVol'];
                  containers[name]['vol'] = containerNames[r]['vol'];
                  containers[name]["orders"] = [];

                  
              }**/

              containers[name] = containerNames[name];
              containers[name]['orders'] =[];

              

            
            }
         }
            pushOrdersToContainers(containers,tasks);
        
    });
}

function pushOrdersToContainers(containers,tasks){
        //push orders on to containers

      for (o in orders){
        var order = orders[o];
        var orderContainer = order["Container"];

        if(containers[orderContainer]){
           containers[orderContainer]["orders"].push(order);
          
        }
       
        
      }
                  

      var sortedContainers = Object.keys(containers).sort(function(a, b){
        console.log(a + ' ' + b);
        var v1 =parseInt(a.replace(/\D/g,''));
        var v2 = parseInt(b.replace(/\D/g,''));  
        return  v1-v2;
      });
      // display all containers
      for (var cont in sortedContainers){
        if(containers[sortedContainers[cont]]){
          var containerObj = containers[sortedContainers[cont]];
          var regOrders = containerObj["orders"];
        //  var firstOrder = orders[0];
       //   var name = firstOrder["Container"];
         containerObj["tasks"] = tasks;
         if(regOrders && regOrders[0])
          displayTable(containerObj,regOrders[0]["Container"]);

        }
      $('.selectpicker').selectpicker({
          style: 'btn-info',
          size: 10
      });
      
        
      }
      setupCommentsClickListeners();
}

function getOrderStatus(order) {

  var retVal = 'none';
  if(order["LeichtStatus"].indexOf('Not processed') != -1 )
    return 'notprocessed';
  else if(order["DealerStatus"].indexOf('Not confirmed') != -1)
    return 'notconfirmed';

       
}

function displayTable(containerObj,region){

      var orders = containerObj["orders"];
      var tasks = containerObj["tasks"];
      var isDHL = isContainerdhl(region);
      var isRegional = !(region == 'master' || region == 'Not_Assigned' || region == 'Not_Processed' || region == 'Not_Confirmed');
      var containerOption = containerObj["id"] + '-'+ containerObj["vol"];
      var weightHeader = isDHL ? '<th>Weight<\/th> \r\n' : '';
      var tableHeader = '<div class=\"row m-b-20\">\r\n     ' + 
      '      <table id=\"dataTables'+ region +'\" class=\"table visualTable table-hover table-striped table-bordered\" cellspacing=\"0\" width=\"100%\">\r\n            <thead class=\"header\">\r\n                <tr>\r\n' + 
      '<th>Health<\/th>  \r\n ' +
      '<th>Dealer<\/th>\r\n' +
      '<th>Account<\/th>  \r\n ' + 
      '<th>Order<\/th> \r\n <th>Order<\/th> \r\n' +
      '                 <th>Leicht Status<\/th>\r\n                    <th>Trip<\/th>\r\n                              ' + 
      '<th>VC CMB<\/th>\r\n'  + 
      '<th>VNC CMB<\/th>\r\n' + weightHeader +
      '<th>Status <\/th>\r\n   <th> Container<\/th>\r\n <th>Comments<\/th>\r\n   <th>Value<\/th>\r\n <th>Discounted<\/th>\r\n ';
      tableHeader += ' <\/tr>\r\n            <\/thead>';
    

      var tableFooter =  '<tfoot class=\"header\">\r\n                <tr>\r\n              ' + 
      '    <th>Health<\/th>  \r\n '  +
      ' <th>Dealer<\/th>\r\n                    <th>Account<\/th>\r\n                    <th>Order<\/th>\r\n  <th>Order<\/th> \r\n    ' +  
      '<th>Leicht Status<\/th>\r\n                        <th>Trip<\/th>\r\n                                ' +
      '<th>VC CMB<\/th>\r\n  ' + 
      '<th>VNC CMB<\/th>\r\n' + weightHeader + 
      '<th>Status <\/th>\r\n   <th> Container<\/th>\r\n <th>Comments<\/th>\r\n   <th>Value<\/th>\r\n <th>Discounted<\/th>\r\n' ; 

      tableFooter += ' <\/tr>\r\n            <\/tfoot>';
    
      var body = "<tbody>";
      var volumeConfirmed = 0;
      var volumeNotConfirmed = 0;
      var price = 0;
      var leichtStatusDate = ''; 
      var weight = 0;
      var containerTripId = null;
      var foundTripId = false;
      for(var o in orders){

         var order = orders[o];
         var tripId = order["TripId"];
         tripId = tripId ? tripId.substring(4,tripId.length).substring(0,5) : '';

         if(!containerTripId && !foundTripId){
          containerTripId =  order["TripId"];
          foundTripId = true;
         } else if(foundTripId && containerTripId != order["TripId"]) {
            containerTripId = null;
         }
         var orderTasks = tasks ? tasks[order["OrderId"]] : null;
         var addTask = '\r\n<div class=\"modal fade\" id=\"commentsModal' + order["OrderId"]+'\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"large-modalLabel\" aria-hidden=\"true\">\r\n    '  +
         ' <div class=\"modal-dialog\" role=\"document\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n              ' +
         '  <button type=\"button\" class=\"close\" data-dismiss=\"modal\" ' + 
         ' aria-label=\"Close\">\r\n                    <span aria-hidden=\"true\">&times;<\/span>\r\n  ' +
         '               <\/button>\r\n    ' +
         '            <h4 class=\"modal-title\" id=\"large-modalLabel\">Create Task<\/h4>\r\n ' +
         '           <\/div>\r\n            <div class=\"modal-body\">\r\n\r\n      ' + 
                  '  <form name=\"form\" class=\"forms-basic\">\r\n                    <div class=\"row\">\r\n                        <div class=\"col-xs-6\">\r\n     ' +
         '                       <div class=\"form-group floating-labels\">\r\n                              ' +
         '  <label for=\"comments\">Comments<\/label> <br>\r\n                         ' ;
         var lastComment = '0';
         addTask += '<div id=\"taskComment' + order["OrderId"]+'\"> ';
         addTask+= '<div id="timeline'  + order['OrderId'] 
         +'" class="timeline-widget-4" style="width:570px">\r\n' ; 

         if(tasks && orderTasks && orderTasks["comments"]){ 
            
            var taskComments = orderTasks["comments"];
              

            if( typeof taskComments== 'string'){
             addTask+= getCommentCell('even',taskComments,null);

              lastComment = taskComments;

            } else {
              var index = 0;
              for (var i in taskComments){
                var comment = taskComments[i];
                var isEven = index%2==0 ? 'even' : 'odd';
                addTask+= getCommentCell(isEven,comment,null);
                index++;

                lastComment = comment;

              }
            }
            

          }
         addTask += '</div></div>';
         addTask +=

         '    <input id=\"comments' + order["OrderId"] +  '\" autocomplete=\"off\" type=\"text\" placeholder="Write something" name=\"comments\" class="commentText" autofocus>\r\n                        ' +
         '    <\/div>\r\n                        <\/div>\r\n                    <\/div>\r\n                <\/form>    \r\n               ' +
         '     \r\n\r\n            <\/div>\r\n            <div class=\"modal-footer\">\r\n            ' +
         '    <button type=\"button\" class=\"btn btn-danger\" data-dismiss=\"modal\">Close<\/button>\r\n              ' +
         '  <button type=\"button\" data-dismiss=\"modal\" value=\"' + order["OrderId"] +'\"class=\"btn btn-success completeTask \">Mark Complete<\/button>\r\n          ' + 
         '  <button type=\"button\" data-dismiss=\"modal\" value=\"'+order["OrderId"] +'\"class=\"btn btn-info saveTask\">Add Comment<\/button>\r\n          ' +
         '  <\/div>\r\n        <\/div>\r\n    <\/div>\r\n<\/div>'; 


         var health = 'Confirmed';
         var healthTag = 'success';
         var extraAction = '';
         var primaryValidated = order["isPrimaryLocation"];
         var secondaryValidated = order["isSecondaryLocation"];

         if(order["Container"] &&  !primaryValidated && !secondaryValidated ) {
              health = 'Invalid Region';
              healthTag = 'info';
              //extraAction = '<a class="ignoreRegion" value="'+ order['OrderId'] + '"><i class="color-danger fa fa-remove"></i></a>' ;

         } else if(!order["LeichtStatus"]  ){
             health = 'Not Available';
             healthTag = 'warning';
         } else if(order["LeichtStatus"].indexOf('Not processed') != -1  ){
             health = 'Not Processed';
             healthTag = 'warning';
         } else if( order["LeichtStatus"].indexOf('ORDER BLOCK') != -1 ){
             health = 'Order Block';
             healthTag = 'warning';
         } else if(!order["LeichtStatus"].length){
              health = 'N/A';
             healthTag = 'warning';
         } else if(order["LeichtStatus"].indexOf('Cost advice') != -1  ){
             health = 'Cost advice';
             healthTag = 'warning';
         } else if(order["DealerStatus"].indexOf('Not confirmed') != -1){
              health = 'Not Confirmed';
             healthTag = 'danger';
         } 
         var age = 0;
         if(order['last']){
           age = order['last']['duration'];
         }
         var healthHtml= '<a class=\"btn btn-' + healthTag +'\">' + health + '(' + age + ') '  +'</a>' + extraAction;

        if(order["LeichtStatus"] && order["LeichtStatus"].indexOf('Cost advice') == -1  )  {

            var dealerId = order["DealerId"];
            dealerId = dealerId.substring(3,dealerId.length);
            var regex=/\d{2}([.\- ])\d{2}\1\d{4}/;
            var regexRes = regex.exec(order['LeichtStatus']);
            if(regexRes)
              leichtStatusDate = Date.parseExact(regexRes[0], 'dd.MM.yyyy').add(-14).days().toString('ddd. MMM dd, yyyy');
            regex=/\d{2}\1\d{4}/;
            regexRes = regex.exec(order['LeichtStatus']);
            if(regexRes)
              leichtStatusDate = Date.parseExact(regexRes, 'ww.yyyy').subtract(14).days().toString('ddd. MMM dd, yyyy');
            if(!leichtStatusDate)
              leichtStatusDate = 'NA';
            //Date.parseExact('09.01.2010', 'dd.MM.yyyy').toString('yyyy-MM-dd');
           

            body += '\r\n<tr> ';
            body += '\r\r\n<td>' + healthHtml+ ' </td>';
            body += '\r\r\n<td>' +  order["DealerName"]+ ' </td>';
            body += '\r\r\n<td>' + dealerId +  '</td>'; 
            body += '\r\r\n<td>' + parseInt(order["OrderId"]) +  '</td>'; 
            body += '\r\r\n<td>' + order["OrderName"] + '</td>'; 

            body += '\r\r\n<td>' + order["LeichtStatus"]  +'</td>'; 
            body += '\r\r\n<td>' + tripId+'</td>'; 
            body += '\r\r\n<td>' + order["VolumeConfirmed"] +'</td>'; 
            body += '\r\r\n<td>' +order["VolumeNotConfirmed"] +'</td>'; 
            if(isDHL ){
               body += '\r\r\n<td>' +order["grossWeight"] +'</td>'; 
               weight += parseInt(order["grossWeight"]);
            }
            body += '\r\r\n<td>' + order["DealerStatus"] +'</td>'; 
            body += '\r\r\n<td>' + order["Container"]+'</td>'; 


            var commentTimestamp = lastComment['date'] ? lastComment['date'] : 0;
            var commentDisplay = commentTimestamp > 0 ?  ' ('+timeSince(getDateObj(commentTimestamp)) + ')' : '' ;
            var diffDate = Date.now().getTime() - commentTimestamp;
            var commentDate = parseInt(commentTimestamp);
            var recentLabel = 24*60*60*1000;
            var warningLabel = 24*60*60*3*1000;
            var dangerLabel =24*60*60 * 7*1000;
            var dateLabel = 'info';
            if(diffDate > dangerLabel){
              dateLabel = 'danger';
            } else if(diffDate > warningLabel){
              dateLabel = 'warning';
            } 


            body += '\r\r\n<td> <div class="hidden">' +commentTimestamp  + '</div> <div id=\"commentText'+order["OrderId"] + '\"> </div> <div id=\"commentCell' + order["OrderId"] + '\" class=\"cell-click\">'
            var commentCount = 0;
            var commentClass = 'primary';
            if(orderTasks && orderTasks["comments"]){
              var comment =  orderTasks["comments"];

              if( typeof taskComments== 'string'){
                commentCount = 1;
              } else {
                commentCount = Object.keys(comment).length;
                
                if(orderTasks['completed'] == true )
                  commentClass = 'success';
                else {
                  lastComment['comment'] += commentDisplay ;
                  commentClass = dateLabel;
                }
              }
            } 
            orderTasks && comment ? Object.keys(comment).length : 0;
            var lastCommentSnippet = (lastComment['comment'] ? lastComment['comment']  : lastComment)  ;
            lastCommentSnippet = lastCommentSnippet.length > 30 ? lastCommentSnippet.substring(0,32) + '...' : lastCommentSnippet;
            body +=   '<button value=\"' + commentCount+'\"id=\"commentButton' + order["OrderId"] +'\" type=\"button\" class=\"btn btn-' + commentClass+' m-r-10 m-b-10 btn-rounded\"  '  + 
            'data-toggle=\"modal\" data-target=\"#commentsModal' + 
            order["OrderId"]+'\">' + (commentClass == 'success' ? '<i class="ion-icon s32 ion-checkmark"></i>' : "") + lastCommentSnippet  + ' </button>'; 
            $('#modals').append(addTask);
            ;
            body += '</td>';


            body += '\r\r\n</div><td>€' + numberWithCommas(order["OrderCost"]) +'</td>'; 
            body += '\r\r\n</div><td>€' + numberWithCommas(parseFloat(parseFloat(order["OrderCost"])*.95).toFixed(2)) +'</td>'; 
            body += '</tr>';

     



            price += parseFloat(order["OrderCost"]);
            volumeConfirmed += parseInt(order["VolumeConfirmed"].replace(',',''),10);
            volumeNotConfirmed += parseInt(order["VolumeNotConfirmed"].replace(',',''),10);


        }

      }
      body+= '</tbody> </table></div><br><br>';
      var tableHtml = tableHeader + tableFooter + body;
    


      var percentage;
      var capacity = containerObj["vol"];
      var boxId = containerObj["id"];
      var totalVolume = volumeConfirmed + volumeNotConfirmed;
      var toolbar  = "";
      var dealerMode = window.location.pathname == '/dealerdata';
      if(region != "tasks" && region != 'master' && region != 'tasks_archived' && region != 'Not_Assigned' && region !='Not_Processed'
        && region !='Not_Confirmed') {
        
        if(boxId)
          percentage = parseInt((totalVolume*100)/capacity);
        else
          percentage = "N/A";
        var tag = getStatusTag(percentage);


        price = Math.round(price*100)/100;
        var priceActual = price * .95; 
        priceActual = Math.round(priceActual*100)/100;


        toolbar = '\r\n<div class=\"row m-b-20\">\r\n ';
        if(region == 'Not_Confirmed' || region =='Not_Processed' || region == 'Not_Assigned'){

        }
        else if(isRegional && !isDHL){
            toolbar +=
            '   <div class=\"col-xs-12 col-lg-2\">\r\n ' +
            '       <div class=\"m-b-20\">\r\n            <div id="containerBox' + region+'" class=\"text-widget-10 text-widget-sm bg-success-900 color-white\">\r\n ' +           
                 '<div class=\"row\">\r\n                    <div class=\"col-xs-12 text-center\">\r\n                    ' +
                 '    <div  class=\"title color-white\">Container<\/div> \r\n' +
                 '  <span ' + (dealerMode ? ' ' : 'id="containerLabel' + region+'" ') + ' class=\" amount\"> ' +containerOption.split('-')[0] +'</span>\r\n'; 
                 if(!dealerMode){
                 toolbar +=
                      ' <select class="selectpicker hidden" id=\"'  + region + 'S\" data-live-search=\"true\" data-style=\"btn-success\" data-width=\"100%\">' +
                          ' <optgroup label=\"Box\">  ' + 
                           '       <option value=\"20 Box-23000\" name=\"bla\">20 Box</option> ' + 
                                '<option value=\"40 Box-48000\">40 Box</option>' + 
                          '</optgroup> ' +
                          '<optgroup label=\"Container\">  ' +  
                                '<option value=\"40 HC-58000\">40 HC</option>' +
                                '<option value=\"40 HC 1/2-58000\">40 HC 1/2</option>' + 
                                '<option value=\"40 HC 2/2-58000\">40 HC 2/2</option>' +
                          '</optgroup>' + 
                              '</select>   ' ;
                  }

                 toolbar += ' <\/div>\r\n                <\/div>\r\n            <\/div>\r\n        <\/div>\r\n     <\/div>\r\n ';
        } else if(isDHL){

             var label = 'No Details';
             var jsonObj = '';
             var freightId = (containerObj['freightId']  ? containerObj['freightId'] : containerTripId ?  containerTripId : '' ) ;
             var numBoxes =  (containerObj['numBoxes'] ? containerObj['numBoxes'] : '' );
             var boxWeight = (containerObj['boxWeight'] ? containerObj['boxWeight'] : weight);
             var boxDim = (containerObj['boxDimensions'] ? containerObj['boxDimensions'] : '');
             var freightIdShort = freightId != '' ? freightId.substring(4,freightId.length).substring(0,5) : 'Not Assigned';
              label = freightIdShort + ': ' + boxWeight  +' kg ' ;
              jsonObj += freightId + ', ' + boxDim+ ', ' + boxWeight  + ', ' +numBoxes;
             
             toolbar +=   '   <div class=\"col-xs-12 col-lg-2\">\r\n ' +
            '       <div class=\"m-b-20\">\r\n            <div id="containerBox' + region+'" class=\"text-widget-10 text-widget-sm bg-success-900 color-white\">\r\n ' +           
                 '<div class=\"row\">\r\n                    <div class=\"col-xs-12 text-center\">\r\n                    ' +
                 '    <div  class=\"title color-white\">Freight<\/div> \r\n' +
                 '  <span  id="freightDetails' + region +'" class=\" amount\"> '  + label+' </span> <span class="hidden" id="freightObj' + region+'"> ' +jsonObj + '</span> <a data-toggle="modal" data-target="#large-modal" name="'+ region+'"class="btn btn-success showFreight" > <i class="fa  fa-edit"/></a>\r\n' + 

                 ' <\/div>\r\n                <\/div>\r\n            <\/div>\r\n        <\/div>\r\n     <\/div>\r\n ';

       
        }

            var vncTag = getVolumeNotConfirmedTag(volumeNotConfirmed);
            toolbar +=
            '   <div class=\"col-xs-12 col-lg-2\">\r\n'  +
                 '        <div class=\"m-b-20\">\r\n            <div class=\"text-widget-10 text-widget-sm bg-success-900  color-white\">\r\n' +
                 '<div class=\"row\">\r\n'  + 
                 '<div class=\"col-xs-12 text-center\">\r\n'  + 
                 '<div class=\"title color-white\">Volume Confirmed CBM<\/div> <span class=\"amount\" count-to=\"' + volumeConfirmed+'\"' +
                 'value=\"0\" duration=\"1\">' + numberWithCommas(volumeConfirmed) +'  <\/span> \r\n <\/div>\r\n <\/div>\r\n '    + 
             ' <\/div>\r\n <\/div>\r\n\r\n\r\n  <\/div>\r\n' +
                 '<div class=\"col-xs-12 col-lg-2\">\r\n        <div class=\"m-b-20\">\r\n            <div class=\"text-widget-10 text-widget-sm  ' + vncTag + '  color-white\">\r\n' +
             '<div class=\"row\">\r\n'  + 
             '<div class=\"col-xs-12 text-center\">\r\n'  + 
             '<div class=\"title\">Volume Not Confirmed<\/div> <span class=\"amount\" count-to=\"' + volumeConfirmed+'\"' +
             'value=\"0\" duration=\"1\">' + numberWithCommas(volumeNotConfirmed) +' <\/span> \r\n <\/div>\r\n <\/div>\r\n '  + 
              ' <\/div>\r\n <\/div>\r\n\r\n\r\n  '  +
             '<\/div>\r\n';
              var totalVol = containerObj['totVol'] ? numberWithCommas(new String(containerObj['totVol']))  : '';
              var volDisplay = dealerMode ?  (numberWithCommas(totalVolume) + '/' + numberWithCommas(totalVol))  : numberWithCommas(totalVolume)  +' (' + percentage + '%)  <progress class="progress progress-primary progress-sm" value="' + percentage + '" max="100"></progress> ';
              toolbar +='<div class=\"col-xs-12 col-lg-2\">\r\n       '+
               ' <div class=\"m-b-20\">\r\n          ' + 
               '  <div id=\"'+ region+'Status\" class=\"text-widget-10 text-widget-sm  ' + tag+' color-white\">\r\n     '  + 
               '            <div class=\"row\">\r\n                    <div class=\"col-xs-12 text-center\">\r\n                      ' +
             '  <div class=\"title\">Total Volume<\/div> <span id=\"' + region + 'Container\" class=\"amount\" count-to=\"5421\" value=\"0\" duration=\"1\">' +
                 volDisplay + ' <\/span> \r\n                    <\/div>\r\n                <\/div>\r\n            <\/div>\r\n     ' +
              '   <\/div>\r\n\r\n    <\/div>\r\n ' + 
              '   <div class=\"col-xs-12 col-lg-2\">\r\n  ' + 
              '      <div class=\"m-b-20\">\r\n         '+
                '<div class=\"text-widget-10 text-widget-sm  bg-success-900 color-white\">\r\n                <div class=\"row\">\r\n                    <div class=\"col-xs-12 text-center\">\r\n                      ' +
             '  <div class=\"title\">Value<\/div> <span class=\"amount\" count-to=\"5421\" value=\"0\" duration=\"1\">€'+ numberWithCommas(price.toFixed(2))  + '<\/span> \r\n                    <\/div>\r\n  ' + 
             '              <\/div>\r\n            <\/div>\r\n        <\/div>\r\n\r\n  <\/div>\r\n' + 
                      '   <div class=\"col-xs-12 col-lg-2\">\r\n  ' + 
              '      <div class=\"m-b-20\">\r\n         '+
                '<div class=\"text-widget-10 text-widget-sm  bg-success-900 color-white\">\r\n                <div class=\"row\">\r\n                    <div class=\"col-xs-12 text-center\">\r\n                      ' +
             '  <div class=\"title\">Balance<\/div> <span class=\"amount\" count-to=\"5421\" value=\"0\" duration=\"1\">€'+ numberWithCommas((price*.95).toFixed(2))  + ' Due ' +  leichtStatusDate+ ' <\/span> \r\n                    <\/div>\r\n  ' + 
             '              <\/div>\r\n            <\/div>\r\n        <\/div>\r\n\r\n ' + 


             '  <\/div>';

      }
      var displayName = region == "master" ? "National Orders" : region == "tasks" ? "Tasks" : region.replace('_',' ');
      if($.urlParam('date')){
        var dateParam = $.urlParam('date').replace('_','/').replace('_','/');
        displayName += ' ' + dateParam;
      }


      if(region == 'tasks')
        displayName = '<i class="fa  fa-tasks"></i> ' + displayName;
      else if(region == 'Archived_Tasks'){
        displayName = '<i class="fa  fa-tasks"></i> ' + displayName;
      } else if(isDHL)
        displayName = '<i class="fa  fa-plane"></i> ' + displayName;
      else if(isRegional)
        displayName = '<i class="zmdi zmdi-boat zmdi-hc-2x"></i> ' + displayName;


      tableHtml='<h2> ' + displayName+' </h2> <br>' + tableHtml;
      

      $("#table").append(tableHtml);
      var d = new Date();
      var date = (d.getMonth()+1) + '_' + d.getDate() + '_' + d.getFullYear() ;
      
      
      registerTableEvents(containerObj,region,isRegional,containerOption,toolbar,totalVolume)


}

function registerTableEvents (containerObj,region,isRegional,containerOption,toolbar,totalVolume) {
      var domVal = region == 'master' ? 'lBfrtp': 'Bfrtp';
      var hideValue = region === 'tasks' ;
      $('#dataTables'+ region).DataTable({
        "columnDefs": [
          { "visible": !hideValue, "targets": [12] },
          { "visible": !hideValue, "targets": [13] }
        ],
        paging : region === 'master',
        stateSave: false,
        scrollY:        '600px',
        scrollX:        true,
        scrollCollapse: true,
        lengthMenu: [[50, 100, 200, -1], [50, 100, 200, "All"]],
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        order: [[ 0, "desc" ]],
         "dom": '<"toolbar'  + region +'">' + domVal

      });



      $('div.toolbar' + region).html(toolbar);

      $('#dataTables' +region +' tbody').on( 'click', 'tr', function () {
        $(this).toggleClass('selected');
        var orderId =$(this).find('td')[3].innerHTML;
        var orderName =$(this).find('td')[4].innerHTML;
        if(selectedOrders[orderId]){
          delete selectedOrders[orderId]
          console.log('removing');
        } else {
          selectedOrders[orderId] = orderName;
          console.log('adding');
        }
      });

//ignoreRegion" value="'+ order['OrderId']
      $('.ignoreRegion').on('click',function(event){
         var orderId = $(this).attr('value');
        firebase.database().ref('/orders/' + localStorage['lastDate'] + '/' + orderId).update(
             { "ignoreRegion" : true });

         console.log(orderId);
      })

      var selected = [];


      if(isRegional){

        $('#' +  region + 'S').on('hidden.bs.select', function (e) {
              console.log("USER SELECTED " + e.currentTarget.value);
              var boxSize = e.currentTarget.value.split('-')[1];
              var boxId = e.currentTarget.value.split('-')[0];

              var area = region.replace(/\d+/g, '');
              var d = new Date();
              var dateKey = (d.getMonth()+1) + '_' + d.getDate() + '_' + d.getFullYear() ;
              firebase.database().ref('/containers/' + area + '/' + region).set(
             {"size" :boxSize,"id" :boxId , "name" : region, "vol" : boxSize});
              percentage = parseInt((totalVolume*100)/boxSize);
              var tag = getStatusTag(percentage);

              $('#' + region + 'Container').html(+ totalVolume +' (' + percentage +'%)');
              $('#' + region + 'Status').removeClass('bg-danger-900').removeClass('bg-success-900').removeClass('bg-warning-900');
              $('#' + region + 'Status').addClass(tag);



        });
         ;
        $('#containerLabel' + region).on('click', function(e){
          $('#' +  region + 'S').toggleClass('hidden');
          $('#' + region + 'S').parent().toggleClass('hidden');

          $('#containerLabel' + region).toggleClass('hidden');
          $('#containerBox' + region).toggleClass('text-widget-sm');

        
        });
        $('#' +  region + 'S').selectpicker('val',containerOption );

      }

}

function getVolumeNotConfirmedTag (num){
  if(parseInt(num) == 0)
    return 'bg-success-900';
  else
    return 'bg-warning-900';
}

function displayAllRegions(regions) {
    var regionsStub =  '';
    var dhlStub = '';
    var countRegional= 0;
    var countDhl = 0;
    for (var region in regions){
      
      if(!isContainerdhl(regions[region])) {
        regionsStub +=  '<li> <a class="sideline" href="report?region=' + regions[region] + '" >'  + 
      '<i class="fa fa-dot-circle-o "></i> <span class="title" > ' + regions[region] +'</span> </a> </li>';
        countRegional++;
      }

    }
    
    $('#reportCount').html(countRegional);
   
    $('#regions').html(regionsStub);
   
}
function isContainerdhl(region){
  return (region.startsWith('A') || 
        region.startsWith('DHL')) && !region.startsWith('UPS');
}

function loadAllRegions(dateKey) {
    if(localStorage['regions_' + dateKey])
      displayAllRegions(JSON.parse(localStorage['regions_' + dateKey]));
    else{
      firebase.database().ref('/regions/' + dateKey ).once('value').then(function(snapshot) {
        localStorage['regions_' + dateKey] = JSON.stringify(snapshot.val());
        displayAllRegions(snapshot.val());
                

      });
    }
  
}



$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function getStatusTag(capacity){
  var val = 'bg-success-900';
  if(capacity >= 104) {
    val = 'bg-danger-900';
  } else if(capacity >= 101){
    val = 'bg-warning-900';
  } else if (capacity < 71){
    val = 'bg-warning-900';
  }
  return val;

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCommentHtml(date,comment){
 return '<span> ' + date.replace('_','/').replace('_','/') + ':</span> <br> ';
}

function authenticateUserIfNecessary(callback){    
    $('.logoutButton').on('click',function (e){
       logout();
    }); 


    registerUUIDListener(callback);
}

function registerUUIDListener(callback){
    var userEmail = localStorage["userEmail"];
    var initialized = false;
    firebase.auth().onAuthStateChanged(function(user) {
      firebase.database().ref('/adminusers').once('value').then(function(adminusers) {
        var adminusers = adminusers.val();
        if (user){

            localStorage["userEmail"] = user.email;
      
            initialized = true;
            callback('success',user.email,adminusers);

        } else {

            
         
         callback('not-loggedin',null,adminusers);


        }
      });

  });

      /*
  firebase.auth().onAuthStateChanged(function(user) {
      if (user )  {
        // User is signed in.
       $('#loggedin').text('Logged in as ' + user.email);
        $('#isloggedin').removeClass('hidden');
        $('#myform').addClass('hidden');
        console.log('FIREBASE: ' + user);
        localStorage["userEmail"] = $('#email').val();
      } else if(userEmail){
        // User is signed in.
        $('#loggedin').text('Logged in as ' + cachedUser);
        $('#isloggedin').removeClass('hidden');
        $('#myform').addClass('hidden');
      
      } else {
        $('#isloggedin').addClass('hidden');
        $('#myform').removeClass('hidden');
      }
  });
  if(localStorage["userEmail"]){
    
    $('#loggedin').text('Logged in as ' + localStorage["userEmail"]);
    $('#isloggedin').removeClass('hidden');
    $('#myform').addClass('hidden');

  } else {
    $('#isloggedin').addClass('hidden');
    $('#myform').removeClass('hidden');
  } */
}

function logout() {

      delete localStorage["userEmail"];
      firebase.auth().signOut().then(function() {
      // Sign-out successful.
            window.location.href = 'login';

          }, function(error) {
      // An error happened.
          window.location.href = 'login';
        });
}

function getCommentCell(isEven, comment,date){
  var dateObj = comment['date'] ? comment['date'] :  date;
  if (dateObj && typeof dateObj== 'string')
    dateObj = dateObj.replace('_','/').replace('_','/');
  else if(!dateObj)
    dateObj = 'N/A';
  return '<div class="row bg-'  + isEven + '-color">' + 
                            '<div class="col-xs-12 timeline timeline-' +  (isEven == 'even' ? 'success' : 'primary')+'">\r\n' + 
                               '<div class="p-10">\r\n' +
                                        '<p>'  +  (comment["comment"] ? comment['comment'] : comment) +'</p>\r\n' +
                                        '<p class="text-sm text-muted">' + (comment['user'] ? comment['user'] : 'NA' ) + '</p>\r\n' + 
                                        '<p class="text-sm m-t-10"> '  +  timeSince(getDateObj(dateObj)) + ' <i class="m-l-5 m-r-5 fa fa-mail-reply"></i>\r\n' + 
                                        '</p>\r\n' + 
                                    '</div>\r\n' + 
                                '</div>\r\n' +
                        '</div>';
  }


function timeSince(date) {

    if (date =='N/A')
      return date;
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " yr";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " d";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hr";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " min";
    }
    return Math.floor(seconds) + " s";
}

function getDateObj(string){
  if(string == 'N/A')
    return string;

  var d = new Date(string);

  return d;
}

function setupCommentsClickListeners(){

        $('.saveTask').on('click', function(event) {
          var orderId = this.value;
          var comments = $("#comments" + orderId).val();
          var d = new Date();
          var date = d.getTime() ;
          var completed = "false";
          var user = localStorage['userEmail'];
          firebase.database().ref('/tasks/pending/'+ orderId).update(
           { "orderId" : orderId, "date" : date , "completed" : completed});
          var commentRef = firebase.database().ref('tasks/pending/' + orderId + '/comments').push();
          commentRef.set({'comment' : comments , 'date' : date , 'user' : user });
          $("#comments" + orderId).html('');
        
          $('#commentButton' + orderId).html(comments);
          $('#timeline' + orderId).append(getCommentCell('false',{'comment' : comments, 'user' : user ,'date' : date },date));
          //$('#commentText' + orderId).html('<a data-toggle=\"modal\" data-target=\"#commentsModal' + 
          //orderId+'\" class=\"#commentsModal' + orderId + '\"> ' + comments + ' </a> ');
          //$('#commentCell' + orderId).addClass('hidden');
          console.log('user clicked');
      });

      $('.completeTask').on('click', function(event) {
          
          var orderId = this.value;
          var comments = $("#comments" + orderId).val() ? $("#comments" + orderId).val() : 'Completed';
          var d = new Date();
          var date = d.getTime() ;
          var user = localStorage['userEmail'];
          $("#comments" + orderId).html('');

          firebase.database().ref('/tasks/pending/'+ orderId).update(
           {"completed" : true});
          var newComment = firebase.database().ref('/tasks/pending/'+ orderId + '/comments').push();
          newComment.set({'comment' : comments , 'date' : date , 'user' : user , 'completed' : true });
              
          $('#commentButton' + orderId).html('<i class="ion-icon s32 ion-checkmark"></i>' + comments);
          $('#commentButton' + orderId).removeClass('btn-info').addClass('btn-success');

          $('#timeline' + orderId).append(getCommentCell('true',{'comment' : comments, 'user' : user ,'date' : date },date));

          //firebase.database().ref('/tasks/pending/'+ orderId).remove();
          //$('#commentsButton' + orderId).html(new String('' + (1 + parseInt($('#commentsButton' + orderId).html())))).removeClass('info').addClass('success');
          //$('#commentText' + orderId).html('<span class=\"label label-success\" data-toggle=\"modal\" data-target=\"#commentsModal' 
            ///+orderId+'\" class=\"#commentsModal' + orderId + '\"> ' + comments + ' </span> ');
          //$('#commentCell' + orderId).addClass('hidden');
      });

      $('.showFreight').on('click', function(btn){
        var id = this.name;
        $('#freightName').html(id);
        var freightObj = $('#freightObj' + id).text().split(',');
        $('#freightId').val(freightObj[0]);
        $('#boxDimensions').val(freightObj[1]);
        $('#boxWeight').val(freightObj[2]);
        $('#numBoxes').val(freightObj[3]);
        
      });
      $('#saveAirFreight').on('click', function(btn){
          var region = $('#freightName').text();
          var location = region.replace(/\d+/g, '');;
          var freightId = $('#freightId').val();
          var boxDimensions = $('#boxDimensions').val();
          var boxWeight =$('#boxWeight').val();
          var numBoxes = $('#numBoxes').val();
          var persistedObj = {'freightId' : freightId, 'boxDimensions' : boxDimensions, 'boxWeight' : boxWeight , 'numBoxes' : numBoxes};
          var newFreight = firebase.database().ref('/containers/'+ location + '/' + region).set(persistedObj);
         $('#freightDetails' + region).html(freightId + ', ' + boxDimensions);
      });
      

      commentsInitialized = true;

}


function fetchOrdersFiltered (region,filter,lastDate) {

    var d = new Date();
    if(lastDate) {
       loadAllRegions(lastDate);
       loadOrdersFromCache(lastDate,region,filter);
      
    } else {
      lastDate = (d.getMonth()+1) + '_' + d.getDate() + '_' + d.getFullYear() ;
      if(localStorage['lastDate'] == lastDate){
        loadAllRegions(lastDate);

        loadOrdersFromCache(lastDate,region,filter);
      } else {
        firebase.database().ref('/lastDate').once('value').then(function(lastDate){
            localStorage['lastDate'] = lastDate.val();
            loadAllRegions(lastDate.val());
            loadOrdersFromCache(lastDate.val(),region,filter);
            

        });
      }
    }

}

function fetchOrders (region) {
  fetchOrdersFiltered(region,null,null);
}

function loadOrdersFromCache(dateKey,region,filter){

    var orders = localStorage['orders_' + dateKey] ? JSON.parse(localStorage['orders_' + dateKey]) : null;
    if(orders){
      loadTasks(orders,region,filter);
    } else {
      firebase.database().ref('/orders/' + dateKey ).once('value').then(function(orders) {
         localStorage['orders_' + dateKey] = JSON.stringify(orders.val());
         localStorage['lastDate'] = dateKey;

         loadTasks(orders.val(),region,filter);


      });
    }
}

function loadTasks(orders,region,filter){
      firebase.database().ref('/tasks/pending/').once('value').then(function(tasks){
          tasks = tasks.val();
          allTasks = tasks;
          var dealersInPage = [];
          for (var orderId in orders){
            var order = orders[orderId];

            if(order['DealerName'] && !dealersInPage[order['DealerName']])
              dealersInPage[order['DealerName']] = order['DealerName'];
                
          }
          if(!initialized){
           displayFilter(dealersInPage,region);
           initialized = true;
         }

         if(filter) {
            var dealerDict = [];
            for (d in filter){
              dealerDict[filter[d]] = true;
            }
            var filteredOrders = [];
            for (o in orders){
              var order = orders[o];
               if(dealerDict[order['DealerName']])
                filteredOrders.push(order);
            };
            orders = filteredOrders;
         }

         if(region == 'master') {
            displayTable({'orders':orders,'tasks': tasks},region);
         } else if (region == 'tasks'){
            var filteredOrders = [];
            for (o in orders){
              var s = orders[o];
               if(tasks && tasks[s['OrderId']] && tasks[s['OrderId']]['completed'] == 'false')
                filteredOrders.push(s);
            }
            displayTable({'orders':filteredOrders,'tasks':tasks},'tasks');  
         } else if(region == 'archived'){
            var filteredOrders = [];
            for (o in orders){
              var s = orders[o];
               if(tasks && tasks[s['OrderId']] && tasks[s['OrderId']]['completed'] == true)
                filteredOrders.push(s);
            }
            displayTable({'orders':filteredOrders,'tasks':tasks},'Archived_Tasks');              
         } else if(region == 'airfreight'){
            var regionArray = [];
            var filteredOrders = [];
            regionArray['airfreight'] = true;
            for (o in orders){
              var order = orders[o];
               if(order["Container"] && isContainerdhl(order["Container"]) )
                filteredOrders.push(order);
            }
            displayTableRegion(filteredOrders,regionArray,tasks);

         }else if(region == 'notprocessed') {
            var filteredOrders = [];
            for (o in orders){
              var order = orders[o];
               if(order["LeichtStatus"].indexOf('Not processed') != -1 )
                filteredOrders.push(order);
            }
             displayTable({'orders':filteredOrders,'tasks':tasks},'Not_Processed');
         } else if(region == 'notconfirmed'){
           var filteredOrders = [];
           for (o in orders){
              var order = orders[o];
               if(order["DealerStatus"].indexOf('Not confirmed') != -1)
                filteredOrders.push(order);
            }
            displayTable({'orders':filteredOrders,'tasks':tasks},'Not_Confirmed');
         } else if (region == 'none'){ 
            var filteredOrders = [];
            for (o in orders){
              var order = orders[o];
               if(!order["Container"] && (order["DealerStatus"].indexOf('Not confirmed') == -1) &&
                order["LeichtStatus"].indexOf('Not processed') == -1)
                  filteredOrders.push(order);
            }
            displayTable({'orders':filteredOrders,'tasks':tasks},'Not_Assigned');

         } else {
            var regionArray = [];
            if(region != 'all')
              regionArray[region] = region;
            displayTableRegion(orders,regionArray,tasks);

         }
         $('.loader').addClass('hidden');
         if(!commentsInitialized)
          setupCommentsClickListeners();
      });
}




function displayFilter (dealers,region){
         var dealerNames = [];
         
         var dropdown = '';
         for (var i in dealers){
          var dealer = dealers[i];
          dealerNames.push(dealer);
         }
        $('.typeahead-1').typeahead({
            source: dealerNames,
            afterSelect : function (item) {
               $('#table').html('');
               $('#modal').html('');
               $('.hideFilter').removeClass('hidden');
               fetchOrdersFiltered(region,item,null);
               $('#clipboard').removeClass('hidden');
               $('#clipboard').attr('href',  '/dealerdata?filter=' + item );
            }
        });
        $('.typeahead-1').removeClass('fade');
        var filter = $.urlParam('filter') ? decodeURI($.urlParam('filter')) : null;
         if(filter){
            $('.typeahead-1').typeahead('filter');
        } 

        $('#clipboard').attr('href',  window.location.host + 
         '/dealerdata?region='  + $.urlParam('region') + '&filter=' 
         + $('.typeahead-1').typeahead("getActive") );
        $('.dropdown-parent').removeClass('fade');
        $('.hideFilter').on('click', function(){
          $('#table').html('');
          $('#modal').html('');
  

          fetchOrdersFiltered(region,null,null);
        });
  

}
function encodeMyHtml(html) {
  var encodedHtml = escape(html);
  encodedHtml = encodedHtml.replace(/\//g,"%2F");
  encodedHtml = encodedHtml.replace(/\?/g,"%3F");
  encodedHtml = encodedHtml.replace(/=/g,"%3D");
  encodedHtml = encodedHtml.replace(/&/g,"%26");
  encodedHtml = encodedHtml.replace(/@/g,"%40");
  return encodedHtml;
} 

ForwarderEnum = {
    NOT_ASSIGNED: "not_assigned",
    PRODUCTION : "production",
    PREBOOKING : "prebooking",
    BOOKING : "booking",
    SHIPMENT: "shipment",
    COMPLETED: "completed"
}

function isProduction(container){
  return container['importer'] && container['id'] && container['name'];
}

function isNotAssigned(container){
  return container['notAssigned'];
}
function isPreBooking(container){
    return isProduction(container) && 
    container['loadingDate'] &&
    container['vessel'] && container['etsDate'] &&
    container['pol'] && container['etaDate'] && 
    container['pod'] && container['warehouse'];
}

function isBooking(container){
  return isPreBooking(container) && container['tripId'];
}
function isShipment(container){
  return isBooking(container) && container['containerNumber'];
}
function isCompleted(container){
  return isShipment(container) && container['deliveredDate'];
}

function getForwarderStatus (container){


  if(isCompleted(container))
    return ForwarderEnum.COMPLETED;
  else if(isShipment(container))
    return ForwarderEnum.SHIPMENT;
  else if(isBooking(container) || isPreBooking(container))
    return ForwarderEnum.BOOKING;
  else if(isProduction(container))
    return ForwarderEnum.PRODUCTION;
  else 
    return ForwarderEnum.NOT_ASSIGNED;
}

