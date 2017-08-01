// http://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript



var getJulianDate = function(){
  var date = new Date(),
      time = date.getTime(); 
  
  return (time / 86400000) - (date.getTimezoneOffset()/1440) + 2440587.5;
};

var getCoordinatesForJulianDate = function(JD){
  var toRadians = function(angle){
    return angle * (Math.PI / 180);
  };

  // https://en.wikipedia.org/wiki/Position_of_the_Sun
  var n = JD - 2451545,
      L = (280.460 + 0.9856474 * n) % 360,
      g = toRadians( (357.528 + 0.9856003 * n) % 360 ),
      λ = toRadians(L + 1.915 * Math.sin(g) + 0.20 * Math.sin(2 * g)),
      R = 1.00014 - 0.01671 * Math.cos(g) + 0.00014 * Math.cos(2 * g),
      ε = toRadians( 23.439 - -0.0000004 * n );
  return {
    x: R * Math.cos(λ),
    y: R * Math.cos(ε) * Math.sin(λ),
    z: R * Math.sin(ε) * Math.sin(λ)
  };
}

var coordinates = [],
    todays_julian_date = getJulianDate();

for(var i = 0; i < 365; i++ ){
  var d = getCoordinatesForJulianDate(todays_julian_date);
  coordinates.push(d);
  todays_julian_date += 1;
}

