# jruby -J-Xmx2048m -S irb
require 'csv'
require 'date'
require 'json'


class String
  def underscore
    self.gsub(/::/, '/').
    gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2').
    gsub(/([a-z\d])([A-Z])/,'\1_\2').
    tr("-", "_").
    downcase
  end
end


dir = '/Users/stevecotter/GitHub/scotter.github.io/pgh-bike-share/'

data = CSV.read(
  dir + 'HealthyRideRentals 2015 Q3.csv',
  converters: :numeric,
  headers: true,
  header_converters: lambda { |h| h.underscore.to_sym }
)

data = data.map do |d|
  d = d.to_hash
  d[:timestamp] = DateTime.strptime("#{d[:start_time]} -0400", "%m/%d/%Y %k:%M %z").to_time.to_i
  d.delete(:bike_id)
  d.delete(:trip_duration)
  d.delete(:from_station_name)
  d.delete(:to_station_name)
  d.delete(:user_type)
  d
end

time_hash = {}

data.each do |d|
  if time_hash[d[:timestamp]]
    time_hash[d[:timestamp]] << d
  else
    time_hash[d[:timestamp]] = [d]
  end
end


File.open(dir + 'rides.json' , 'w') do |f| 
  f.write(time_hash.to_json)
end