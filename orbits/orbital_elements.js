var Trig = {};

Trig.radeg = 180 / Math.PI;

Trig.sind = function(d){
  return Math.sin(d / Trig.radeg);
};

Trig.cosd = function(d){
  return Math.cos(d / Trig.radeg);
};

Trig.tand = function(d){
  return Math.tan(d / Trig.radeg);
};

Trig.asind = function(x){
  return Trig.radeg * Math.atan( x / Math.sqrt( 1 - x * x ) );
};

Trig.acosd = function(x){
  return 90 - Trig.asind(x);
};

Trig.atand = function(x){
  return Trig.radeg * Math.atan(x);
};

Trig.atan2d = function(y,x){
  return  Trig.radeg * Math.atan2(y,x);
};

var rev = function(x){
  return  x - Math.floor(x / 360) * 360;
};

var cbrt = function(x){
  if (x > 0) {
    return Math.exp( Math.log(x) / 3 );
  } else if (x < 0){
    return -cbrt(-x);
  } else {
    return 0;
  }
}




var Orbit = function(planet){
  this.m = planet.m; // Solar masses  (0 for comets and asteroids)

  this.a = planet.elements.a; // Mean distance, or semi-major axis
  this.e = planet.elements.e; // Eccentricity
  this.T = planet.elements.T; // Time at perihelion
  this.i = planet.elements.i; // Inclination
  this.N = planet.elements.N; // Longitude of Ascending Node
  this.w = planet.elements.w; // Angle from the Ascending Node to the Perihelion
}

// Perihelion distance
Object.defineProperty(Orbit.prototype, 'q', {
  get: function(){
    return this.a * (1 - this.e)
  } 
};

// Aphelion distance
Object.defineProperty(Orbit.prototype, 'Q', {
  get: function(){
    return this.a * (1 + this.e)
  } 
};

// Orbital period
Object.defineProperty(Orbit.prototype, 'P', {
  get: function(){
    return 365.256898326 * (this.a ** 1.5) / Math.sqrt(1 + this.m);
  } 
};

// Daily motion
Object.defineProperty(Orbit.prototype, 'n', {
  get: function(){
    return  360 / this.P;
  } 
};

// Mean Anomaly
Orbit.prototype.M = function(t){
  return this.n * (t - this.T);
};

// Mean Longitude 
Orbit.prototype.L = function(t){
  return this.M(t) + this.w + this.N;
};

// Eccentric anomaly
// Orbit.prototype.E = function(t){
//   return this.M(t) + this.w + this.N;
// };



var dayNumber = function(){
  var date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate();
   return 367 * y - 
          Math.floor((7 * 
            (y + Math.floor( (m + 9) / 12) )
          ) / 4) + 
          Math.floor( (275 * m) / 9 ) + 
          d - 730530;
}

    N = 125.1228_deg - 0.0529538083_deg  * d    (Long asc. node)
    i =   5.1454_deg                            (Inclination)
    w = 318.0634_deg + 0.1643573223_deg  * d    (Arg. of perigee)
    a =  60.2666                                (Mean distance)
    e = 0.054900                                (Eccentricity)
    M = 115.3654_deg + 13.0649929509_deg * d    (Mean anomaly)


