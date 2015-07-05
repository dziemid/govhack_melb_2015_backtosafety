  var newMarker = null;
  var targetMarker = null;
  var socket = io.connect('http://govhack2015.gregdmd.com');

  var howIfeel = null;

  var peers = {};

  var showLocationFeel = function(latlng, feeling) {
    if (feeling == 'safe') {
            addSafePoint(latlng);
        };
    if (feeling == 'unsafe') {
        addDangerPoint(latlng);
    };
    if (feeling == 'emergency') {
        addEmergencyPoint(latlng);
    }
  }

  function makeid()
  {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 5; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  };

  window.onload = function() {
    cartodb.createVis('map', 'https://gdziemidowicz.cartodb.com/api/v2/viz/2ebe7fe6-21d6-11e5-ac0c-0e853d047bba/viz.json')
    .done(function(vis, layers) {
      layers[1].setInteraction(true);

      var map = vis.getNativeMap();
      targetMarker = new L.marker([0,0]).addTo(map);

      layers[1].on('featureClick', function(e, latlng, pos, data, layerNumber) {
        targetMarker.setLatLng(latlng);
        showLocationFeel(latlng, howIfeel);
        socket.emit('user_click', { pos: latlng, id: socket.id, feeling: howIfeel} );
      });

      socket.on('user_click', function(msg){
        if (peers[msg.id]) {
          peers[msg.id].setLatLng(msg.pos);
        } else {
          peers[msg.id] = new L.marker(msg.pos);
          peers[msg.id].addTo(map);
        }
        showLocationFeel(msg.pos, msg.feeling);
      });

      function showPosition(position) {
        var pos = [position.coords.latitude,position.coords.longitude];
        var my_location = new L.marker(pos).addTo(map);

        map.panTo(pos);
        map.setZoom(17);
        
        socket.emit('user_click', 
          { pos: pos, id: socket.id }  
          );
      }

      window.feelingSafe = function(position) {
        feelingClickHandler('safe', position, addSafePoint)
      };

      window.feelingUnsafe = function(position) {
        feelingClickHandler('unsafe', position, addDangerPoint)
      };

      window.feelingInEmergency = function(position) {
        feelingClickHandler('emergency', position, addEmergencyPoint)
      };

      window.feelingClickHandler = function(feeling, position, fun) {
        latlng = [position.coords.latitude,position.coords.longitude];
        howIfeel = feeling;
        fun(latlng);
        socket.emit('user_click', { pos: latlng, id: socket.id, feeling: feeling} );
      };

      window.addSafePoint = function addSafePoint(position) {
        var pointId = makeid();
        var my_location = new L.circle(position, 70, {
          color: 'green',
          fillColor: 'green',
          fillOpacity: 0.5,
          className: pointId
        }).addTo(map);

        blinkblink(pointId);
      }

      window.addDangerPoint = function addDangerPoint(position) {
       var pointId = makeid();
       var my_location = new L.circle(position, 70, {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.7,
        className: pointId
      }).addTo(map);

       blinkblink(pointId);
     }

     window.blinkblink = function(pointId) {
      $("." + pointId).animate({ opacity: 0 }, 500, function() {
             $("." + pointId).animate({ opacity: 1 }, 500, function() {})
     });
   }

     window.addEmergencyPoint = function addEmergencyPoint(position) {
      var pointId = makeid();
      console.log("addEmergencyPoint", position)
       var my_location = new L.circle(position, 100, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.7,
        className: pointId
      }).addTo(map);

       blinkblink(pointId);
    };

     
     function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, 
          function(error){
            alert(error.message);
          }, {
            enableHighAccuracy: true
            ,timeout : 25000
          });
      } else {
        
      }
    }

    getLocation();

  });



  }

