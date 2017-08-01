var randomElement = function(array){
    return array[Math.floor(Math.random()*array.length)];
  },
  rules = [
    {
     search: /(president((\-|\s)?elect)?)\s(donald\s+)?(john\s+)?trump(\s+sr\.?)?/gi,
      replacements: [
        'President Pussy Grabber',
        'Racist in Chief'
      ]
    },
    {
     search: /trump/gi,
      replacements: [
        'Pussy Grabber',
        'Racist'
      ]
    }
  ]
 
  nodes = jQuery('h1,h2,h3,h4,h5,h6,p,div,a'),
  

jQuery.each(nodes, function(i,n){
  var $n = jQuery(n),
      html = $n.html();
  if(html){
    rules.forEach(function(rule){
      var random = randomElement(rule.replacements);
      $n.html(html.replace(rule.search, random));
    });
  }
});